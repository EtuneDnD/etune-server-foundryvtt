import {SharedConsts} from "../shared/SharedConsts.js";
import {Config} from "./Config.js";
import {UtilApplications} from "./UtilApplications.js";
import {DataConverter} from "./DataConverter.js";
import {Vetools} from "./Vetools.js";
import {UtilActiveEffects} from "./UtilActiveEffects.js";
import {UtilDataConverter} from "./UtilDataConverter.js";

class DataConverterRace extends DataConverter {
	static _SIDE_LOAD_OPTS = {
		propBrew: "foundryRace",
		fnLoadJson: Vetools.pGetRaceSideData.bind(Vetools),
		propJson: "race",
		propsMatch: ["source", "name"],
	};

	static _IMG_FALLBACK = `modules/${SharedConsts.MODULE_NAME}/media/icon/family-tree.svg`;

	// TODO(Future) expand/replace this as Foundry allows
	/**
	 * @param race
	 * @param [opts] Options object.
	 * @param [opts.fluff]
	 * @param [opts.isAddOwnership]
	 * @param [opts.defaultOwnership]
	 * @param [opts.filterValues]
	 * @param [opts.actor]
	 * @param [opts.isActorItem]
	 */
	static async pGetRaceItem (race, opts) {
		opts = opts || {};
		if (opts.actor) opts.isActorItem = true;

		const img = await this._pGetSaveImagePath(race, {fluff: opts.fluff, propCompendium: "race"});

		const additionalData = await this._pGetDataSideLoaded(race);
		const additionalFlags = await this._pGetFlagsSideLoaded(race);

		const effectsSideTuples = await this._pGetEffectsSideLoadedTuples({ent: race, img});
		effectsSideTuples.forEach(({effect, effectRaw}) => DataConverter.mutEffectDisabledTransfer(effect, "importRace", UtilActiveEffects.getDisabledTransferHintsSideData(effectRaw)));

		const out = {
			name: UtilApplications.getCleanEntityName(UtilDataConverter.getNameWithSourcePart(race)),
			type: "feat",
			system: {
				description: {
					value: await this._pGetRaceDescription(race, opts),
					chat: "",
					unidentified: "",
				},
				source: UtilDataConverter.getSourceWithPagePart(race),

				// region unused
				damage: {parts: []},
				activation: {type: "", cost: 0, condition: ""},
				duration: {value: null, units: ""},
				target: {value: null, units: "", type: ""},
				range: {value: null, long: null, units: ""},
				uses: {value: 0, max: 0, per: null},
				ability: null,
				actionType: "",
				attackBonus: null,
				chatFlavor: "",
				critical: {threshold: null, damage: ""},
				formula: "",
				save: {ability: "", dc: null},
				requirements: "",
				recharge: {value: null, charged: false},
				// endregion

				...additionalData,
			},
			flags: {
				...this._getRaceFlags(race, opts),
				...additionalFlags,
			},
			effects: [
				...await this._pGetSpeedEffects(race.speed, {actor: opts.actor, iconEntity: race, iconPropCompendium: "race"}),
				...effectsSideTuples.map(it => it.effect),
			],
			img,
		};

		if (opts.defaultOwnership != null) out.ownership = {default: opts.defaultOwnership};
		else if (opts.isAddOwnership) out.ownership = {default: Config.get("importRace", "ownership")};

		return out;
	}

	static _pGetRaceDescription (race, opts) {
		if (!Config.get("importRace", "isImportDescription")) return "";

		return UtilDataConverter.pGetWithDescriptionPlugins(() => {
			const ptSummary = `<table class="w-100 summary stripe-even">
				<tr>
					<th class="col-4 text-center">Ability Scores</th>
					<th class="col-4 text-center">Size</th>
					<th class="col-4 text-center">Speed</th>
				</tr>
				<tr>
					<td class="text-center">${Renderer.getAbilityData(race.ability).asText}</td>
					<td class="text-center">${(race.size || [SZ_VARIES]).map(sz => Parser.sizeAbvToFull(sz)).join("/")}</td>
					<td class="text-center">${Parser.getSpeedString(race, {isMetric: Config.isUseMetricDistance({configGroup: "importRace"})})}</td>
				</tr>
			</table>`;

			const ptFeatures = this._pGetRaceDescription_features(race, opts);

			let ptFluff = null;
			if (opts.fluff) {
				ptFluff = Renderer.utils.getFluffTabContent({entity: race, isImageTab: false, fluff: opts.fluff});
			}

			return `<div>
				${ptSummary}
				${ptFeatures}
				${ptFluff != null ? `<hr class="hr-1">${ptFluff}` : ""}
			</div>`;
		});
	}

	static _pGetRaceDescription_features (race, opts) {
		// If importing to an actor directly, avoid populating feature text, as the features themselves will include it
		if (!opts.isActorItem) return Renderer.get().setFirstSection(true).render({type: "entries", entries: race.entries}, 1);

		if (!opts.actor || !opts.raceFeatureDataMetas?.length) return "";

		const ptsFeature = opts.raceFeatureDataMetas
			.map(({id, name}) => `@UUID[Actor.${opts.actor.id}.Item.${id}]{${name}}`);

		return `<div class="mt-2">${ptsFeature.map(f => `<p>${f}</p>`).join("")}</div>`;
	}

	static _getCompendiumAliases (race) {
		if (!race.name && !race._baseName) return [];

		const out = [];

		// Add inverted race name
		const invertedName = PageFilterRaces.getInvertedName(race.name);
		if (invertedName && invertedName !== race.name) out.push(invertedName);

		// Fall back on base race
		if (race._baseName) out.push(race._baseName);

		return out;
	}

	static _getRaceFlags (race, opts) {
		const out = {
			[SharedConsts.MODULE_NAME]: {
				page: UrlUtil.PG_RACES,
				source: race.source,
				hash: UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_RACES](race),
				propDroppable: "race",
				filterValues: opts.filterValues,
			},
		};

		if (opts.isActorItem) out[SharedConsts.MODULE_NAME].isDirectImport = true;

		return out;
	}

	static isStubRace (race) {
		return race.name === DataConverterRace.STUB_RACE.name && race.source === DataConverterRace.STUB_RACE.source;
	}

	static getRaceStub () {
		return MiscUtil.copy(DataConverterRace.STUB_RACE);
	}
}
// region Fake data used in place of missing records when levelling up
//   (i.e. if the same set of sources have not been selected when re-opening the Charactermancer)
DataConverterRace.STUB_RACE = {
	name: "Unknown Race",
	source: SRC_PHB,
	_isStub: true,
};
// endregion

export {DataConverterRace};
