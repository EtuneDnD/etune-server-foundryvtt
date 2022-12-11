import {SharedConsts} from "../shared/SharedConsts.js";
import {DataConverter} from "./DataConverter.js";
import {Vetools} from "./Vetools.js";
import {UtilCompendium} from "./UtilCompendium.js";
import {UtilActiveEffects} from "./UtilActiveEffects.js";
import {DataConverterFeature} from "./DataConverterFeature.js";

class DataConverterBackgroundFeature extends DataConverterFeature {
	static _SIDE_LOAD_OPTS = {
		propBrew: "foundryBackgroundFeature",
		fnLoadJson: async () => this._pGetPreloadSideData(),
		propJson: "backgroundFeature",
		propsMatch: ["backgroundSource", "backgroundName", "source", "name"],
	};

	static _IMG_FALLBACK = `modules/${SharedConsts.MODULE_NAME}/media/icon/farmer.svg`;

	/**
	 * Note: there is no "get from SRD," as the single SRD background (as of 2022-04-28) has no data we are
	 * interested in.
	 * @param featureEntry
	 * @param actor
	 */
	static async pGetBackgroundFeatureItem (featureEntry, {actor}) {
		const img = await this._pGetCompendiumFeatureImage(featureEntry);

		const effectsSideTuples = await this._pGetEffectsSideLoadedTuples({ent: featureEntry, img});
		effectsSideTuples.forEach(({effect, effectRaw}) => DataConverter.mutEffectDisabledTransfer(effect, "importBackground", UtilActiveEffects.getDisabledTransferHintsSideData(effectRaw)));

		return DataConverter.pGetItemActorPassive(
			featureEntry,
			{
				mode: "player",
				img,
				fvttType: "feat",
				source: featureEntry.source,
				actor,
				requirements: featureEntry.backgroundName,
				additionalData: await this._pGetDataSideLoaded(featureEntry),
				additionalFlags: await this._pGetFlagsSideLoaded(featureEntry),
				foundryFlags: {
					[SharedConsts.MODULE_NAME]: {
						page: "backgroundFeature",
						source: featureEntry.source,
						hash: UrlUtil.URL_TO_HASH_BUILDER["backgroundFeature"](featureEntry),
					},
				},
				effects: effectsSideTuples.map(it => it.effect),
			},
		);
	}

	static async _pGetCompendiumFeatureImage (feature) {
		const fromFeature = await UtilCompendium.pGetCompendiumImage("backgroundFeature", feature, {fnGetAliases: this._getCompendiumFeatureAliases.bind(this), deepKeys: ["system.requirements"]});
		if (fromFeature) return fromFeature;

		return this._pGetSaveImagePath(
			{name: feature.backgroundName, source: feature.backgroundSource, srd: feature.srd},
			{propCompendium: "background"},
		);
	}

	static _getCompendiumFeatureAliases (feature) {
		if (!feature.backgroundName || !feature.name) return [];

		const out = [];

		out.push({
			name: feature.name,
			"system.requirements": feature.backgroundName,
		});

		const nameNoPrefix = feature.name.replace(/^Feature:?\s*/i, "").trim();
		if (nameNoPrefix !== feature.name) {
			out.push({
				name: nameNoPrefix,
				"system.requirements": feature.backgroundName,
			});
		}

		return out;
	}

	static async pMutActorUpdateBackgroundFeature (actor, actorUpdate, feature, dataBuilderOpts) {
		const sideData = await this.pGetSideLoadedMatch(feature);
		this.mutActorUpdate(actor, actorUpdate, feature, {sideData});
	}

	static async _pGetPreloadSideData () {
		if (!this._SIDE_DATA) this._SIDE_DATA = await Vetools.pGeBackgroundSideData();
		return this._SIDE_DATA;
	}

	static async pHasBackgroundFeatureSideLoadedEffects (actor, feature) {
		return (await this._pGetEffectsRawSideLoaded_(feature, this._SIDE_LOAD_OPTS))?.length > 0;
	}

	static async pGetBackgroundFeatureItemEffectTuples (actor, feature, sheetItem, {img} = {}) {
		const effectsRaw = await this._pGetEffectsRawSideLoaded_(feature, this._SIDE_LOAD_OPTS);
		return UtilActiveEffects.getExpandedEffects(effectsRaw || [], {actor, sheetItem, parentName: feature.name, img}, {isTuples: true});
	}
}

export {DataConverterBackgroundFeature};
