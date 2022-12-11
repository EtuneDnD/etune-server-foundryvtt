import {UtilApplications} from "./UtilApplications.js";
import {UtilDataConverter} from "./UtilDataConverter.js";
import {DataConverterJournal} from "./DataConverterJournal.js";
import {SharedConsts} from "../shared/SharedConsts.js";

class DataConverterRecipe extends DataConverterJournal {
	static get _CONFIG_GROUP () { return "importRecipe"; }

	/**
	 * @param recipe
	 * @param [opts] Options object.
	 * @param [opts.isAddOwnership]
	 * @param [opts.defaultOwnership]
	 */
	static async pGetRecipeJournal (recipe, opts) {
		opts = opts || {};

		const content = await this._pGetWithJournalDescriptionPlugins(() => Renderer.recipe.getBodyHtml(recipe));

		const fluff = await Renderer.utils.pGetFluff({
			entity: recipe,
			fluffUrl: `data/fluff-recipes.json`,
			fluffProp: "recipeFluff",
		});

		const imgMeta = await this._pGetSaveImagePathMeta(recipe, {fluff});

		const name = UtilApplications.getCleanEntityName(UtilDataConverter.getNameWithSourcePart(recipe));
		const out = {
			name,
			pages: this._getPages({name, content, img: imgMeta?.isFallback ? null : imgMeta?.img}),
			ownership: {default: 0},
			flags: {
				...this._getRecipeFlags(recipe, opts),
			},
		};

		this._mutOwnership(out, opts);

		return out;
	}

	static _getRecipeFlags (recipe) {
		return {
			[SharedConsts.MODULE_NAME]: {
				page: UrlUtil.PG_RECIPES,
				source: recipe.source,
				hash: UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_RECIPES](recipe),
			},
		};
	}
}

export {DataConverterRecipe};
