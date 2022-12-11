import {ImportListActor} from "./ImportListActor.js";
import {Vetools} from "./Vetools.js";
import {Config} from "./Config.js";
import {DataConverter} from "./DataConverter.js";
import {UtilActors} from "./UtilActors.js";
import {DataConverterObject} from "./DataConverterObject.js";
import {UtilDataSource} from "./UtilDataSource.js";
import {UtilDataConverter} from "./UtilDataConverter.js";
import {UtilCompat} from "./UtilCompat.js";

class ImportListObject extends ImportListActor {
	static get ID () { return "objects"; }
	static get DISPLAY_NAME_TYPE_PLURAL () { return "Objects"; }

	static _ = this.registerImpl(this);

	constructor (externalData) {
		externalData = externalData || {};
		super(
			{
				title: "Import Objects",
			},
			externalData,
			{
				props: ["object"],
				dirsHomebrew: ["object"],
				propsBrewAdditionalData: ["foundryObject"],
				fnLoadSideData: Vetools.pGetObjectSideData,
				titleSearch: "objects",
				sidebarTab: "actors",
				gameProp: "actors",
				defaultFolderPath: ["Objects"],
				pageFilter: new PageFilterObjects(),
				page: UrlUtil.PG_OBJECTS,
				isPreviewable: true,
				isDedupable: true,
				configGroup: "importObject",
			},
			{
				actorType: "vehicle",
				DataConverter: DataConverterObject,
			},
		);
	}

	async _pGetSources () {
		return [
			new UtilDataSource.DataSourceUrl(
				Config.get("ui", "isStreamerMode") ? "SRD" : "5etools",
				Vetools.DATA_URL_OBJECTS,
				{
					filterTypes: [UtilDataSource.SOURCE_TYP_OFFICIAL_ALL],
					isDefault: true,
				},
			),
			new UtilDataSource.DataSourceUrl(
				"Custom URL",
				"",
				{
					filterTypes: [UtilDataSource.SOURCE_TYP_CUSTOM],
				},
			),
			new UtilDataSource.DataSourceFile(
				"Upload File",
				{
					filterTypes: [UtilDataSource.SOURCE_TYP_CUSTOM],
				},
			),
			...(await this._pGetSourcesHomebrew()),
		];
	}

	async _pImportEntry_pGetMergedFluff (obj) {
		const fluffBase = Config.get(this._configGroup, "isImportBio") ? await Renderer.object.pGetFluff(obj) : null;
		if (!obj.entries?.length) return fluffBase;

		const out = fluffBase ? MiscUtil.copy(fluffBase) : {};

		out.entries = out.entries || [];
		out.entries.push({type: "entries", entries: obj.entries});

		return out;
	}

	async _pImportEntry_pGetImportMetadata (actor, obj, importOpts, importOptsEntity) {
		const act = {};

		const fluff = await this._pImportEntry_pGetMergedFluff(obj);

		const dataBuilderOpts = new ImportListObject.ImportEntryOpts({actor, fluff});

		await this._pImportEntry_pFillBase(obj, act, dataBuilderOpts.fluff, {isUseTokenImageAsPortrait: Config.get(this._configGroup, "isUseTokenImageAsPortrait")});

		act.system = {};

		await this._pImportEntry_pFillFolder(obj, act, importOpts, importOptsEntity);

		if (importOpts.defaultOwnership != null) act.ownership = {default: importOpts.defaultOwnership};
		else act.ownership = {default: Config.get(this._configGroup, "ownership")};

		this._pImportEntry_fillData_Abilities(obj, act.system, dataBuilderOpts);
		this._pImportEntry_fillData_Attributes(obj, act.system, dataBuilderOpts);
		await this._pImportEntry_pFillData_Details(obj, act.system, dataBuilderOpts);
		this._pImportEntry_fillData_Traits(obj, act.system, dataBuilderOpts);
		this._pImportEntry_fillData_Currency(obj, act.system, dataBuilderOpts);
		this._pImportEntry_fillData_Cargo(obj, act.system, dataBuilderOpts);

		await this._pImportEntry_pFillToken({importable: obj, actor: act, flags: this._getTokenFlags({obj})});

		return {dataBuilderOpts: dataBuilderOpts, actorData: act};
	}

	_pImportEntry_fillData_Attributes (obj, sys) {
		const out = {};

		out.init = {
			value: 0,
			bonus: 0,
			mod: 0,
			prof: 0,
			total: 0,
		};

		out.spelldc = null;

		if (obj.speed != null) out.movement = DataConverter.getMovement(obj.speed, {configGroup: "importObject"});
		else out.movement = {walk: 0};

		if (typeof obj.ac === "number") {
			out.ac = {flat: obj.ac, motionless: `${obj.ac}`};
		}

		if (typeof obj.hp === "number") {
			out.hp = {
				value: obj.hp,
				min: 0,
				max: obj.hp,
				temp: 0,
				tempmax: 0,
				dt: 0,
				mt: 0,
			};
		}

		if (obj.capCrew != null || obj.capPassenger != null || obj.capCargo != null) {
			out.capacity = {
				creature: Renderer.vehicle.getShipCreatureCapacity(obj),
				cargo: typeof obj.capCargo === "string" ? 0 : obj.capCargo,
			};
		}

		sys.attributes = out;
	}

	async _pImportEntry_pFillData_Details (obj, sys, dataBuilderOpts) {
		const out = {};

		out.biography = {
			value: await this._pGetBiographyValue(obj, dataBuilderOpts.fluff, {isImportText: true, isImportImages: Config.get(this._configGroup, "isImportBioImages")}),
		};

		out.source = UtilDataConverter.getSourceWithPagePart(obj);

		sys.details = out;
	}

	_pImportEntry_fillData_Traits (obj, sys) {
		const out = {};

		out.size = UtilActors.VET_SIZE_TO_ABV[obj.size] || "med";

		this._pImportEntry_fillConditionsDamage(obj, out);

		sys.traits = out;
	}

	_pImportEntry_fillData_Currency (obj, sys) {
		// Dummy data
		sys.currency = {
			pp: 0,
			gp: 0,
			ep: 0,
			sp: 0,
			cp: 0,
		};
	}

	async _pImportEntry_pFillItems (obj, act, dataBuilderOpts, importOpts) {
		if (obj.actionEntries?.length) {
			for (const actionEntry of obj.actionEntries) await this._pImportEntry_pFillItems_pActionEntry(obj, act, actionEntry, dataBuilderOpts);
		}

		const isTemporary = importOpts.isTemp || this._pack != null;
		await UtilActors.pAddActorItems(dataBuilderOpts.actor, dataBuilderOpts.items, {isTemporary});
	}

	async _pImportEntry_pFillItems_pActionEntry (obj, act, ent, dataBuilderOpts) {
		if (ent.type === "actions") {
			for (const action of ent.entries) {
				if (typeof action === "object") {
					// Convert the attack entry into something the generic parser can comprehend
					const cpyAction = MiscUtil.copy(action);

					cpyAction.name = cpyAction.name || ent.name;
					if (action.type === "attack" && cpyAction.attackEntries?.length === 1 && cpyAction.hitEntries?.length === 1 && typeof cpyAction.attackEntries[0] === "string" && typeof cpyAction.hitEntries[0] === "string") {
						cpyAction.entries = [
							`{@atk ${action.attackType.toLowerCase()}} ${cpyAction.attackEntries[0]} {@h}${cpyAction.hitEntries[0]}`,
						];

						delete cpyAction.attackEntries;
						delete cpyAction.hitEntries;
					}

					await this._pImportEntry_pFillItems_pActionEntry(obj, act, cpyAction, dataBuilderOpts);
				} else {
					await this._pImportEntry_pFillItems_pActionEntry(obj, act, action, dataBuilderOpts);
				}
			}
			return;
		}

		ent = typeof ent === "object" ? ent : {name: "Unnamed Action", entries: [ent]};

		const description = await DataConverter.pGetEntryDescription(ent);
		const strEntries = ent.entries ? JSON.stringify(ent.entries) : null;

		const {
			damageTuples,
			formula,
			isAttack,
			isRecharge,
			rangeShort,
			rangeLong,
			actionType,
			isProficient,
			attackBonus,
			_foundryData,
			foundrySystem,
			_foundryFlags,
			foundryFlags,
			img,
		} = await DataConverterObject.pGetParsedAction(obj, ent, dataBuilderOpts);

		const damageParts = damageTuples;

		// region Saving throw
		const {
			saveAbility,
			saveScaling,
			saveDc,
		} = this._getSavingThrowData(strEntries);
		// endregion

		// If it was an attack, treat is as a weapon. Otherwise, treat it as a generic action.
		if (isAttack) {
			await this._pFillWeaponItem(
				obj,
				act,
				ent,
				dataBuilderOpts,
				{
					damageParts,
					formula,
					rangeShort,
					rangeLong,
					actionType,
					isProficient,
					description,
					saveAbility,
					saveDc,
					saveScaling,
					attackBonus,
					_foundryData,
					foundrySystem,
					_foundryFlags,
					foundryFlags,
					img,
					isSiegeWeapon: obj.objectType === "SW",
					isRecharge,
				},
			);
		} else {
			dataBuilderOpts.items.push(await DataConverter.pGetItemActorPassive(
				ent,
				{
					mode: "creature",
					fvttType: "feat",
					activationType: "action",
					activationCost: 1,
					description,
					saveAbility,
					saveDc,
					saveScaling,
					damageParts,
					formula,
					attackBonus,
					_foundryData,
					foundrySystem,
					_foundryFlags,
					foundryFlags,
					img,
					entity: obj,
					source: obj.source,
					actor: {system: act}, // wrap our update data to give the appearance of a real actor
				},
			));
		}
	}

	_pImportEntry_fillData_Cargo (obj, sys) {
		// Dummy data
		sys.cargo = {
			crew: [],
			passengers: [],
		};
	}

	_getTokenFlags ({obj}) {
		if (!UtilCompat.isMonksLittleDetailsActive()) return null;
		return {"monks-little-details": {"bloodsplat-colour": "#00000000"}};
	}
}

ImportListObject.ImportEntryOpts = class extends ImportListActor.ImportEntryOpts {};

export {ImportListObject};
