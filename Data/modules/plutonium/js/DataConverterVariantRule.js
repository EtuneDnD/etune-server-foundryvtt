import {UtilApplications} from "./UtilApplications.js";
import {UtilDataConverter} from "./UtilDataConverter.js";
import {DataConverterJournal} from "./DataConverterJournal.js";
import {SharedConsts} from "../shared/SharedConsts.js";

class DataConverterVariantRule extends DataConverterJournal {
	static get _CONFIG_GROUP () { return "importRule"; }

	/**
	 * @param rule
	 * @param [opts] Options object.
	 * @param [opts.isAddOwnership]
	 * @param [opts.defaultOwnership]
	 */
	static async pGetVariantRuleJournal (rule, opts) {
		opts = opts || {};

		const cpy = MiscUtil.copy(rule);
		delete cpy.name;
		delete cpy.page;
		delete cpy.source;

		const content = await this._pGetWithJournalDescriptionPlugins(() => `<div>${Renderer.get().setFirstSection(true).render(cpy)}</div>`);

		const imgMeta = await this._pGetSaveImagePathMeta(rule);

		const name = UtilApplications.getCleanEntityName(UtilDataConverter.getNameWithSourcePart(rule));
		const out = {
			name,
			pages: this._getPages({name, content, img: imgMeta?.isFallback ? null : imgMeta?.img}),
			ownership: {default: 0},
			flags: {
				...this._getVariantRuleFlags(rule, opts),
			},
		};

		this._mutOwnership(out, opts);

		return out;
	}
	static _getVariantRuleFlags (rule) {
		return {
			[SharedConsts.MODULE_NAME]: {
				page: UrlUtil.PG_VARIANTRULES,
				source: rule.source,
				hash: UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VARIANTRULES](rule),
			},
		};
	}
}

export {DataConverterVariantRule};
