import {UtilApplications} from "./UtilApplications.js";
import {UtilDataConverter} from "./UtilDataConverter.js";
import {DataConverterJournal} from "./DataConverterJournal.js";
import {SharedConsts} from "../shared/SharedConsts.js";

class DataConverterLanguage extends DataConverterJournal {
	static get _CONFIG_GROUP () { return "importLanguage"; }

	/**
	 * @param ent
	 * @param [opts] Options object.
	 * @param [opts.isAddOwnership]
	 * @param [opts.defaultOwnership]
	 */
	static async pGetLanguageJournal (ent, opts) {
		opts = opts || {};

		const content = await this._pGetWithJournalDescriptionPlugins(() => `<div>${Renderer.language.getRenderedString(ent, {isSkipNameRow: true})}</div>`);

		const fluff = await Renderer.utils.pGetFluff({
			entity: ent,
			fluffUrl: `data/fluff-languages.json`,
			fluffProp: "languageFluff",
		});

		const imgMeta = await this._pGetSaveImagePathMeta(ent, {fluff});

		const name = UtilApplications.getCleanEntityName(UtilDataConverter.getNameWithSourcePart(ent));
		const out = {
			name,
			pages: this._getPages({name, content, img: imgMeta?.isFallback ? null : imgMeta?.img}),
			ownership: {default: 0},
			flags: {
				...this._getLanguageFlags(ent, opts),
			},
		};

		this._mutOwnership(out, opts);

		return out;
	}

	static _getLanguageFlags (ent) {
		return {
			[SharedConsts.MODULE_NAME]: {
				page: UrlUtil.PG_LANGUAGES,
				source: ent.source,
				hash: UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_LANGUAGES](ent),
			},
		};
	}
}

export {DataConverterLanguage};
