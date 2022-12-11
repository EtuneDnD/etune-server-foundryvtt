import {UtilApplications} from "./UtilApplications.js";
import {UtilDataConverter} from "./UtilDataConverter.js";
import {DataConverterJournal} from "./DataConverterJournal.js";
import {SharedConsts} from "../shared/SharedConsts.js";

class DataConverterHazard extends DataConverterJournal {
	static get _CONFIG_GROUP () { return "importHazard"; }

	/**
	 * @param haz
	 * @param [opts] Options object.
	 * @param [opts.isAddOwnership]
	 * @param [opts.defaultOwnership]
	 */
	static async pGetHazardJournal (haz, opts) {
		opts = opts || {};

		const content = this._pGetWithJournalDescriptionPlugins(() => {
			const subtitle = Renderer.traphazard.getSubtitle(haz);
			return `<div>
				${subtitle ? `<div class="mb-1 italic">${subtitle}</div>` : ""}
				${Renderer.get().setFirstSection(true).render({entries: haz.entries}, 2)}
			</div>`;
		});

		const imgMeta = await this._pGetSaveImagePathMeta(haz);

		const name = UtilApplications.getCleanEntityName(UtilDataConverter.getNameWithSourcePart(haz));
		const out = {
			name,
			pages: this._getPages({name, content, img: imgMeta?.isFallback ? null : imgMeta?.img}),
			ownership: {default: 0},
			flags: {
				...this._getHazardFlags(haz, opts),
			},
		};

		this._mutOwnership(out, opts);

		return out;
	}

	static _getHazardFlags (haz) {
		return {
			[SharedConsts.MODULE_NAME]: {
				page: UrlUtil.PG_TRAPS_HAZARDS,
				source: haz.source,
				hash: UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TRAPS_HAZARDS](haz),
			},
		};
	}
}

export {DataConverterHazard};
