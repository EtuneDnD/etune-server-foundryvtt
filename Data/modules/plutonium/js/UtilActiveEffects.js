/**
 * The active effects modes are as follows. Each has a default priority (effects are applied low-to-high)
 *   of `10 * mode`, so...
 * CONST.ACTIVE_EFFECT_MODES = {
 *   "CUSTOM":      0,  =>  priority  0
 *   "MULTIPLY":    1,  =>  priority 10
 *   "ADD":         2,  =>  priority 20
 *   "DOWNGRADE":   3,  =>  priority 30
 *   "UPGRADE":     4,  =>  priority 40
 *   "OVERRIDE":    5,  =>  priority 50
 * }
 * DAE uses the following priorities, to allow e.g. base AC to be modified by additional AC:
 * "OVERRIDE"  =>  priority 4
 * "ADD"       =>  priority 7
 * i.e. "OVERRIDE" is applied first, then "ADD".
 */

import {SharedConsts} from "../shared/SharedConsts.js";

class ActiveEffectMeta {
	constructor (path, mode, defaultVal) {
		this.path = path;
		this.mode = mode;
		this.default = defaultVal;
	}

	get dataType () { return typeof this.default; }
}

class UtilActiveEffects {
	static _PATHS_EXTRA__AC = [
		"system.attributes.ac.base", // note that this is intended as a "read-only"/result field
		"system.attributes.ac.armor",
		"system.attributes.ac.dex",
		"system.attributes.ac.shield",
		"system.attributes.ac.bonus",
		"system.attributes.ac.cover",
	];

	static init () {
		UtilActiveEffects._AVAIL_EFFECTS_ACTOR_DND5E.push(
			new ActiveEffectMeta("system.attributes.prof", CONST.ACTIVE_EFFECT_MODES.OVERRIDE, 1),

			new ActiveEffectMeta("system.resources.primary.label", CONST.ACTIVE_EFFECT_MODES.OVERRIDE, ""),
			new ActiveEffectMeta("system.resources.secondary.label", CONST.ACTIVE_EFFECT_MODES.OVERRIDE, ""),
			new ActiveEffectMeta("system.resources.tertiary.label", CONST.ACTIVE_EFFECT_MODES.OVERRIDE, ""),

			...Object.entries((CONFIG?.DND5E?.characterFlags) || {})
				.map(([k, meta]) => new ActiveEffectMeta(
					`flags.dnd5e.${k}`,
					CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					meta.placeholder != null ? MiscUtil.copy(meta.placeholder) : meta.type()),
				),

			// region Currently (as of 2022-02-05) these all work, but do not have sheet UI. Add them manually.
			// See `Item5e.rollDamage`
			...Object.keys((CONFIG?.DND5E?.itemActionTypes) || {})
				.map(k => [
					new ActiveEffectMeta(
						`system.bonuses.${k}.attack`,
						CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						"",
					),
					new ActiveEffectMeta(
						`system.bonuses.${k}.damage`,
						CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						"",
					),
				])
				.flat(),
			// endregion

			// region Add synthetic AC properties
			//   See: _prepareBaseArmorClass
			//   "Initialize derived AC fields for Active Effects to target."
			...this._PATHS_EXTRA__AC.map(path => new ActiveEffectMeta(
				path,
				CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				"",
			)),
			// endregion
		);
	}

	/**
	 * @param entity
	 * @param [opts] As passed in to the render hook for an `ActiveEffectConfig`
	 * @param [opts.isActorEffect]
	 * @param [opts.isItemEffect]
	 */
	static getAvailableEffects (entity, opts) {
		opts = opts || {};

		let modelMeta;
		if (opts.isItemEffect) modelMeta = game.system.model.Item;
		else if (opts.isActorEffect) modelMeta = game.system.model.Actor;
		else throw new Error(`Unhandled effect mode, was neither an item effect nor an actor effect!`);

		const model = modelMeta[entity.type];

		const baseEffects = Object.entries(foundry.utils.flattenObject(model))
			// Default everything to "override" when displaying in the UI
			.map(([keyPath, defaultVal]) => new ActiveEffectMeta(`system.${keyPath}`, CONST.ACTIVE_EFFECT_MODES.OVERRIDE, defaultVal));

		if (opts.isItemEffect) return baseEffects;
		return [...baseEffects, ...UtilActiveEffects._AVAIL_EFFECTS_ACTOR_DND5E]
			.unique(it => it.path)
			.sort(SortUtil.ascSortLowerProp.bind(null, "path"));
	}

	/**
	 * @param entity
	 * @param [opts] As passed in to the render hook for an `ActiveEffectConfig`
	 * @param [opts.isActorEffect]
	 * @param [opts.isItemEffect]
	 */
	static getAvailableEffectsLookup (entity, opts) {
		const effects = this.getAvailableEffects(entity, opts);
		const out = {};
		effects.forEach(it => out[it.path] = it);
		return out;
	}

	static getActiveEffectType (lookup, path) {
		if (!path) return undefined;

		// Note that all custom keys are just prefixed regular keys, so this works
		path = this.getKeyFromCustomKey(path);

		if (!lookup[path]) return undefined;
		const meta = lookup[path];
		if (meta.default === undefined) return "undefined";
		if (meta.default === null) return "null";
		if (meta.default instanceof Array) return "array";
		return typeof meta.default;
	}

	static getExpandedEffects (
		rawEffects,
		{actor = null, sheetItem = null, parentName = "", img = null} = {},
		{isTuples = false} = {},
	) {
		if (!rawEffects || !rawEffects.length) return [];

		const tuples = [];

		// Convert the reduced versions in the side data to full-data effects
		for (const effectRaw of rawEffects) {
			// Create a version of the raw effect with all our known/used props removed; we'll copy the rest over to the
			//   final effect.
			const cpyEffectRaw = MiscUtil.copy(effectRaw);
			["name", "priority", "icon", "disabled", "changes"].forEach(prop => delete cpyEffectRaw[prop]);

			const effect = UtilActiveEffects.getGenericEffect({
				label: effectRaw.name ?? parentName,
				priority: effectRaw?.changes?.length
					? Math.max(...effectRaw.changes.map(it => UtilActiveEffects.getPriority(UtilActiveEffects.getFoundryMode({mode: it.mode}))))
					: 0,
				icon: effectRaw.img ?? img ?? sheetItem?.img ?? actor?.system?.img ?? actor?.system?.prototypeToken?.texture?.src,
				disabled: !!effectRaw.disabled,
				transfer: !!effectRaw.transfer,
			});

			if (actor && sheetItem) effect.origin = `Actor.${actor.id}.Item.${sheetItem.id}`;

			effect.changes = effect.changes || [];
			(effectRaw.changes || []).forEach(rawChange => {
				const mode = UtilActiveEffects.getFoundryMode(rawChange.mode);

				// Handle legacy keys, as "data" was changed to "system" in Foundry v10.
				// TODO(v12) remove this as deprecation for ".data" progresses/as we migrate our data away.
				const key = rawChange.key.replace(/^data\./, "system.");

				effect.changes.push({
					key,
					mode,
					value: rawChange.value,
					priority: UtilActiveEffects.getPriority({mode, rawPriority: rawChange.priority}),
				});
			});

			// Ensure we copy over any other fields as-is (`"duration"`, `"flags"`, etc.)
			Object.entries(cpyEffectRaw)
				.forEach(([k, v]) => {
					effect[k] = v;
				});

			tuples.push({effect, effectRaw});
		}

		return isTuples ? tuples : tuples.map(it => it.effect);
	}

	static getGenericEffect (
		{
			label = "",
			icon = "icons/svg/aura.svg",
			disabled = false,
			transfer = true,

			key = "",
			value = "",
			mode = CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
			priority = null,

			durationSeconds = null,
			durationRounds = null,
			durationTurns = null,

			changes = null,

			originActor = null,
			originActorItem = null,
			originActorId = null,
			originActorItemId = null,

			flags = null,
		} = {},
	) {
		if (changes && (key || value)) throw new Error(`Generic effect args "key"/"value" and "changes" are mutually exclusive!`);

		const change = key || value ? this.getGenericChange({key, value, mode, priority}) : null;

		flags = flags || {};

		return {
			label,
			icon,
			changes: changes ?? [change].filter(Boolean),
			disabled,
			duration: {
				startTime: null,
				seconds: durationSeconds,
				rounds: durationRounds,
				turns: durationTurns,
				startRound: null,
				startTurn: null,
			},
			// origin: "Item.<item ID>",
			//   or
			// origin: "Actor.<actor ID>.Item.<item ID>",
			origin: this._getGenericEffect_getOrigin({
				originActor,
				originActorItem,
				originActorId,
				originActorItemId,
			}),
			tint: "",
			transfer,
			flags,
		};
	}

	static _getGenericEffect_getOrigin ({originActor, originActorItem, originActorId, originActorItemId}) {
		originActorId = originActorId ?? originActor?.id;
		originActorItemId = originActorItemId ?? originActorItem?.id;

		return originActorId
			? originActorItemId
				? `Actor.${originActorId}.Item.${originActorItemId}`
				: `Actor.${originActorId}`
			: null;
	}

	static getGenericChange (
		{
			key,
			value,
			mode = CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
			priority = null,
		},
	) {
		if (key == null || value === undefined) throw new Error(`Generic effect change "key" and "value" must be defined!`);
		return {
			key,
			mode,
			value,
			priority,
		};
	}

	static getCustomKey (key) { return `${SharedConsts.MODULE_NAME_FAKE}.${key}`; }
	static getKeyFromCustomKey (customKey) { return customKey.replace(new RegExp(`${SharedConsts.MODULE_NAME_FAKE}\\.`), ""); }

	static getFoundryMode (modeStrOrInt) {
		if (typeof modeStrOrInt === "number") return modeStrOrInt;
		const [, out = 0] = Object.entries(CONST.ACTIVE_EFFECT_MODES)
			.find(([k]) => k.toLowerCase() === `${modeStrOrInt}`.trim().toLowerCase()) || [];
		return out;
	}

	static getPriority ({mode, rawPriority = null}) {
		if (rawPriority != null && !isNaN(rawPriority)) return rawPriority;
		return mode >= CONST.ACTIVE_EFFECT_MODES.DOWNGRADE ? UtilActiveEffects.PRIORITY_BASE : UtilActiveEffects.PRIORITY_BONUS;
	}

	static _HINTS_DEFAULT_SIDE = {hintTransfer: false, hintDisabled: false};
	static getDisabledTransferHintsSideData (effectRaw) {
		const out = MiscUtil.copy(this._HINTS_DEFAULT_SIDE);
		if (effectRaw?.transfer != null) out.hintTransfer = effectRaw.transfer;
		if (effectRaw?.disabled != null) out.hintDisabled = effectRaw.disabled;
		return out;
	}
}
UtilActiveEffects._AVAIL_EFFECTS_ACTOR_DND5E = [];

UtilActiveEffects.PRIORITY_BASE = 4;
UtilActiveEffects.PRIORITY_BONUS = 7;

export {UtilActiveEffects};
