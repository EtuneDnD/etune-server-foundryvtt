import {UtilApplications} from "./UtilApplications.js";
import {UtilDataConverter} from "./UtilDataConverter.js";
import {DataConverterJournal} from "./DataConverterJournal.js";
import {SharedConsts} from "../shared/SharedConsts.js";

class DataConverterDeity extends DataConverterJournal {
	static get _CONFIG_GROUP () { return "importDeity"; }

	/**
	 * @param deity
	 * @param [opts] Options object.
	 * @param [opts.isAddOwnership]
	 * @param [opts.defaultOwnership]
	 */
	static async pGetDeityJournal (deity, opts) {
		opts = opts || {};

		const content = await UtilDataConverter.pGetWithDescriptionPlugins(() => {
			return `<div>
				${Renderer.deity.getOrderedParts(deity, `<p>`, `</p>`)}
				${deity.entries ? `<div>${Renderer.get().setFirstSection(true).render({entries: deity.entries}, 1)}</div>` : ""}
			</div>`;
		});

		const img = await this._pGetSaveImagePath(deity);

		const name = UtilApplications.getCleanEntityName(UtilDataConverter.getNameWithSourcePart(deity, {displayName: deity.title ? `${deity.name}, ${deity.title.toTitleCase()}` : null}));
		const out = {
			name,
			pages: this._getPages({name, content, img}),
			ownership: {default: 0},
			flags: {
				...this._getDeityFlags(deity, opts),
			},
		};

		this._mutOwnership(out, opts);

		return out;
	}

	static _getDeityFlags (deity) {
		return {
			[SharedConsts.MODULE_NAME]: {
				page: UrlUtil.PG_DEITIES,
				source: deity.source,
				hash: UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_DEITIES](deity),
			},
		};
	}

	static _pGetImgCustom (deity) {
		return deity.symbolImg
			? Renderer.utils.getMediaUrl(deity.symbolImg, "href", "img")
			: null;
	}
}

export {DataConverterDeity};
