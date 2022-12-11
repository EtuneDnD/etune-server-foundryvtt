import { debug } from "../dae.js";
import { applyDaeEffects, libWrapper, noDupDamageMacro } from "./dae.js";
import { applyBaseActiveEffects, ValidSpec } from "./DAESystem.js";
// @ts-ignore
const CONFIG = globalThis.CONFIG;
export class DAESystemDND5E extends CONFIG.DAE.systemClass {
    static modifyBaseValues(actorType, baseValues, characterSpec) {
        baseValues["data.attributes.prof"] = 0;
        baseValues["data.details.level"] = 0;
        baseValues["data.attributes.ac.bonus"] = 0;
        baseValues["data.attributes.ac.base"] = 0;
        baseValues["data.attributes.ac.cover"] = 0;
        if (characterSpec.data.bonuses) {
            // data.attributes.prof/data.details.level and data.attributes.hd are all calced in prepareBaseData
            baseValues["data.bonuses.All-Attacks"] = "";
            baseValues["data.bonuses.weapon.attack"] = "";
            baseValues["data.bonuses.spell.attack"] = "";
            baseValues["data.bonuses.All-Damage"] = "";
            baseValues["data.bonuses.weapon.damage"] = "";
            baseValues["data.bonuses.spell.damage"] = "";
            // These are for item action types - works by accident.
            baseValues["data.bonuses.heal.damage"] = "";
            baseValues["data.bonuses.heal.attack"] = "";
            baseValues["data.bonuses.save.damage"] = "";
            baseValues["data.bonuses.check.damage"] = "";
            baseValues["data.bonuses.abil.damage"] = "";
            baseValues["data.bonuses.other.damage"] = "";
            baseValues["data.bonuses.util.damage"] = "";
        }
        // move all the characteer flags to specials so that the can be custom effects only
        let charFlagKeys = (game.system.id === "dnd5e") ? Object.keys(CONFIG.DND5E.characterFlags) : Object.keys(CONFIG.SW5E.characterFlags);
        charFlagKeys.forEach(key => {
            let theKey = `flags.${game.system.id}.${key}`;
            if ([`flags.${game.system.id}.weaponCriticalThreshold`,
                `flags.${game.system.id}.powerCriticalThreshold`,
                `flags.${game.system.id}.meleeCriticalDamageDice`,
                `flags.${game.system.id}.spellCriticalThreshold`].includes(theKey)) {
                delete baseValues[theKey];
            }
            else
                baseValues[theKey] = false;
        });
        if (game.modules.get("skill-customization-5e")?.active && game.system.id === "dnd5e") {
            Object.keys(CONFIG.DND5E.skills).forEach(skl => {
                baseValues[`flags.skill-customization-5e.${skl}.skill-bonus`] = "";
            });
        }
        //TODO work out how to evaluate this to a number in prepare data - it looks like this is wrong
        if (characterSpec.data.bonuses)
            baseValues["data.bonuses.spell.dc"] = 0;
        Object.keys(baseValues).forEach(key => {
            // can't modify many spell details.
            if (key.includes("data.spells")) {
                delete baseValues[key];
            }
            if (key.includes("data.spells") && key.includes("override")) {
                baseValues[key] = 0;
            }
        });
        delete baseValues["data.attributes.init.total"];
        delete baseValues["data.attributes.init.mod"];
        delete baseValues["data.attributes.init.bonus"];
        delete baseValues["flags"];
    }
    static modifySpecials(actorType, specials, characterSpec) {
        //@ts-ignore
        const ACTIVE_EFFECT_MODES = CONST.ACTIVE_EFFECT_MODES;
        specials["data.attributes.ac.value"] = [0, -1];
        specials["data.attributes.ac.min"] = [0, -1];
        specials["data.attributes.hp.max"] = [0, -1];
        specials["data.attributes.hp.tempmax"] = [0, -1];
        specials["data.attributes.hp.min"] = [0, -1];
        specials["data.attributes.init.total"] = [0, -1];
        specials["data.attributes.init.bonus"] = [0, -1];
        specials["data.abilities.str.dc"] = [0, ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.abilities.dex.dc"] = [0, ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.abilities.int.dc"] = [0, ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.abilities.wis.dc"] = [0, ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.abilities.cha.dc"] = [0, ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.abilities.con.dc"] = [0, ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.attributes.encumbrance.max"] = [0, -1];
        specials["data.traits.di.all"] = [false, ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.traits.di.value"] = ["", -1];
        specials["data.traits.di.custom"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.traits.dr.all"] = [false, ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.traits.dr.value"] = ["", -1];
        specials["data.traits.dr.custom"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.traits.dv.all"] = [false, ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.traits.dv.value"] = ["", -1];
        specials["data.traits.dv.custom"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.traits.ci.all"] = [false, ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.traits.ci.value"] = ["", -1];
        specials["data.traits.ci.custom"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.traits.size"] = ["", ACTIVE_EFFECT_MODES.OVERRIDE];
        specials["data.spells.pact.level"] = [0, -1];
        specials["flags.dae"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.attributes.movement.all"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.attributes.movement.hover"] = [0, ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.attributes.ac.EC"] = [0, -1];
        specials["data.attributes.ac.AR"] = [0, -1];
        if (characterSpec.data.attributes.hd)
            specials["data.attributes.hd"] = [0, -1];
        if (characterSpec.data.traits.weaponProf) {
            specials["data.traits.weaponProf.all"] = [false, ACTIVE_EFFECT_MODES.CUSTOM];
            specials["data.traits.weaponProf.value"] = ["", -1];
            specials["data.traits.weaponProf.custom"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        }
        if (characterSpec.data.traits.languages) {
            specials["data.traits.languages.all"] = [false, ACTIVE_EFFECT_MODES.CUSTOM];
            specials["data.traits.languages.value"] = ["", -1];
            specials["data.traits.languages.custom"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        }
        if (characterSpec.data.traits.armorProf) {
            specials["data.traits.armorProf.all"] = [false, ACTIVE_EFFECT_MODES.CUSTOM];
            specials["data.traits.armorProf.value"] = ["", -1];
            specials["data.traits.armorProf.custom"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        }
        if (characterSpec.data.traits.toolProf) {
            specials["data.traits.toolProf.all"] = [false, ACTIVE_EFFECT_MODES.CUSTOM];
            specials["data.traits.toolProf.value"] = ["", -1];
            specials["data.traits.toolProf.custom"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        }
        if (characterSpec.data.resources) {
            specials["data.resources.primary.max"] = [0, -1];
            specials["data.resources.primary.label"] = ["", ACTIVE_EFFECT_MODES.OVERRIDE];
            specials["data.resources.secondary.max"] = [0, -1];
            specials["data.resources.secondary.label"] = ["", ACTIVE_EFFECT_MODES.OVERRIDE];
            specials["data.resources.tertiary.max"] = [0, -1];
            specials["data.resources.tertiary.label"] = ["", ACTIVE_EFFECT_MODES.OVERRIDE];
            specials["data.resources.legact.max"] = [0, -1];
            specials["data.resources.legres.max"] = [0, -1];
            if (game.modules.get("resourcesplus")?.active) {
                for (let res of ["fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"]) {
                    specials[`data.resources.${res}.max`] = [0, -1];
                    specials[`data.resources.${res}.label`] = ["", ACTIVE_EFFECT_MODES.OVERRIDE];
                }
            }
        }
        specials[`flags.${game.system.id}.initiativeHalfProf`] = [false, ACTIVE_EFFECT_MODES.CUSTOM];
        specials[`flags.${game.system.id}.DamageBonusMacro`] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials[`flags.${game.system.id}.initiativeDisadv`] = [false, ACTIVE_EFFECT_MODES.CUSTOM];
        if (game.modules.get("tidy5e-sheet")?.active)
            specials["data.details.maxPreparedSpells"] = [0, -1];
        // change movement effects to be after prepareDerivedData
        for (let key of Object.keys(CONFIG.DND5E.movementTypes)) {
            specials[`data.attributes.movement.${key}`] = [0, -1];
        }
        // move all the characteer flags to specials so that the can be custom effects only
        let charFlagKeys = (game.system.id === "dnd5e") ? Object.keys(CONFIG.DND5E.characterFlags) : Object.keys(CONFIG.SW5E.characterFlags);
        charFlagKeys.forEach(key => {
            let theKey = `flags.${game.system.id}.${key}`;
            if ([`flags.${game.system.id}.weaponCriticalThreshold`,
                `flags.${game.system.id}.powerCriticalThreshold`,
                `flags.${game.system.id}.meleeCriticalDamageDice`,
                `flags.${game.system.id}.spellCriticalThreshold`].includes(theKey)) {
                specials[theKey] = [0, -1];
            }
        });
    }
    static initActions() {
        // We will call this in prepareData
        libWrapper.register("dae", "CONFIG.Actor.documentClass.prototype.applyActiveEffects", applyBaseActiveEffects, "OVERRIDE");
        // Add flags to roll data so they can be referenced in effects
        libWrapper.register("dae", "CONFIG.Actor.documentClass.prototype.getRollData", getRollData, "WRAPPER");
        libWrapper.register("dae", "CONFIG.Actor.documentClass.prototype.prepareData", prepareData, "WRAPPER");
        // This supplies DAE custom effects
        Hooks.on("applyActiveEffect", this.daeCustomEffect);
    }
    static readyActions() {
        patchPrepareArmorClassAttribution();
    }
    static setupActions() {
    }
    static initSystemData() {
        // Setup attack types and expansion change mappings
        this.spellAttacks = ["msak", "rsak"];
        this.weaponAttacks = ["mwak", "rwak"];
        this.attackTypes = this.weaponAttacks.concat(this.spellAttacks);
        this.bonusSelectors = {
            "data.bonuses.All-Attacks": { attacks: this.attackTypes, selector: "attack" },
            "data.bonuses.weapon.attack": { attacks: this.weaponAttacks, selector: "attack" },
            "data.bonuses.spell.attack": { attacks: this.spellAttacks, selector: "attack" },
            "data.bonuses.All-Damage": { attacks: this.attackTypes, selector: "damage" },
            "data.bonuses.weapon.damage": { attacks: this.weaponAttacks, selector: "damage" },
            "data.bonuses.spell.damage": { attacks: this.spellAttacks, selector: "damage" }
        };
        this.daeActionTypeKeys = Object.keys(CONFIG.DND5E.itemActionTypes);
    }
    static effectDisabled(actor, efData, itemData = null) {
        let disabled = efData.disabled;
        const ci = actor.data.data.traits?.ci?.value;
        const statusId = (efData.flags?.core?.statusId ?? "no effect").toLocaleLowerCase();
        disabled = disabled || efData.isSuppressed || (ci.length && ci.find(c => statusId.endsWith(c)));
        return disabled;
    }
    static getOptionsForSpec(specification) {
        return {};
    }
    // Special case handling of (expr)dX
    static attackDamageBonusEval(bonusString, actor) {
        return bonusString;
        if (typeof bonusString === "string") {
            const special = bonusString.match(/\((.+)\)\s*d([0-9]+)(.*)/);
            // const special = bonusString.match(/\(([\s\S]+)\)\s+d([0-9]*)\)([\s\S]+)/);
            if (special && special.length >= 3) {
                try {
                    return new Roll(special[1].replace(/ /g, ""), actor.getRollData()).roll().total + "d" + special[2] + (special[3] ?? "");
                }
                catch (err) {
                    console?.warn(`DAE eval error for: ${special[1].replace(/ /g, "")} in actor ${actor.name}`, err);
                    return bonusString;
                }
            }
        }
        return `${bonusString || ""}`;
    }
    /*
     * do custom effefct applications
     * damage resistance/immunity/vulnerabilities
     * languages
     */
    static daeCustomEffect(actor, change) {
        const current = getProperty(actor.data, change.key);
        var validValues;
        var value;
        if (typeof change?.key !== "string")
            return true;
        const damageBonusMacroFlag = `flags.${game.system.id}.DamageBonusMacro`;
        if (change.key === damageBonusMacroFlag) {
            let current = getProperty(actor.data, change.key);
            // includes wont work for macro names that are subsets of other macro names
            if (noDupDamageMacro && current?.split(",").some(macro => macro === change.value))
                return true;
            setProperty(actor.data, change.key, current ? `${current},${change.value}` : change.value);
            return true;
        }
        if (change.key.includes(`flags.${game.system.id}`)) {
            const value = ["1", "true"].includes(change.value);
            setProperty(actor.data, change.key, value);
            return true;
        }
        if (change.key.startsWith("data.skills.") && change.key.endsWith(".value")) {
            const currentProf = getProperty(actor.data, change.key) || 0;
            const profValues = { "0.5": 0.5, "1": 1, "2": 2 };
            const upgrade = profValues[change.value];
            if (upgrade === undefined)
                return;
            let newProf = currentProf + upgrade;
            if (newProf > 1 && newProf < 2)
                newProf = 1;
            if (newProf > 2)
                newProf = 2;
            return setProperty(actor.data, change.key, newProf);
        }
        /*
        if (change.key.startsWith("items.")) {
          let originalKey = duplicate(change.key);
          const fields = change.key.split("."); // items.data.contents.index......
          const index = fields[2];
          const itemKey = fields.slice(3).join(".")
          const item = actor.data.items.contents[index];
          let value = getProperty(item, itemKey);
          if (value === undefined) value = change.value;
          else if (value instanceof Array) {
            const newEntry = eval(change.value)
            value = value.concat([newEntry]);
          } else if (typeof value === "string") value = `${value} + ${change.value}`;
          //@ts-ignore
          else if (typeof value === "boolean") value = Roll.safeEval(change.value);
          //@ts-ignore
          else value = Roll.safeEval(value + change.value);
          setProperty(item, itemKey, value)
          return true;
        }
        */
        switch (change.key) {
            case "data.attributes.movement.hover":
                setProperty(actor.data, change.key, change.value ? true : false);
                return true;
            case "data.traits.di.all":
            case "data.traits.dr.all":
            case "data.traits.dv.all":
            case "data.traits.sdi.all":
            case "data.traits.sdr.all":
            case "data.traits.sdv.all":
                const key = change.key.replace(".all", ".value");
                if (game.system.id === "dnd5e")
                    setProperty(actor.data, key, Object.keys(CONFIG.DND5E.damageResistanceTypes));
                else
                    setProperty(actor.data, key, Object.keys(CONFIG.SW5E.damageResistanceTypes));
                return true;
            case "data.traits.di.value":
            case "data.traits.dr.value":
            case "data.traits.dv.value":
            case "data.traits.sdi.value":
            case "data.traits.sdr.value":
            case "data.traits.sdv.value":
                if (game.system.id === "dnd5e")
                    return super.doCustomArrayValue(actor, current, change, Object.keys(CONFIG.DND5E.damageResistanceTypes));
                else
                    return super.doCustomArrayValue(actor, current, change, Object.keys(CONFIG.SW5E.damageResistanceTypes));
            case "data.traits.di.custom":
            case "data.traits.dr.custom":
            case "data.traits.dv.custom":
            case "data.traits.sdi.custom":
            case "data.traits.sdr.custom":
            case "data.traits.sdv.custom":
            case "data.traits.ci.custom":
            case "data.traits.languages.custom":
            case "data.traits.toolProf.custom":
            case "data.traits.armorProf.custom":
            case "data.traits.weaponProf.custom":
                value = (current ?? "").length > 0 ? current.trim().split(";").map(s => s.trim()) : [];
                const setValue = new Set(value);
                setValue.add(change.value);
                value = Array.from(setValue).join("; ");
                setProperty(actor.data, change.key, value);
                return true;
            case "data.traits.languages.all":
                if (game.system.id === "dnd5e")
                    setProperty(actor.data, "data.traits.languages.value", Object.keys(CONFIG.DND5E.languages));
                else
                    setProperty(actor.data, "data.traits.languages.value", Object.keys(CONFIG.SW5E.languages));
                return true;
            case "data.traits.languages.value":
                if (game.system.id === "dnd5e")
                    return super.doCustomArrayValue(actor, current, change, Object.keys(CONFIG.DND5E.languages));
                else
                    return super.doCustomArrayValue(actor, current, change, Object.keys(CONFIG.SW5E.languages));
            case "data.traits.ci.all":
                if (game.system.id === "dnd5e")
                    setProperty(actor.data, "data.traits.ci.value", Object.keys(CONFIG.DND5E.conditionTypes));
                else
                    setProperty(actor.data, "data.traits.ci.value", Object.keys(CONFIG.SW5E.conditionTypes));
                return true;
            case "data.traits.ci.value":
                if (game.system.id === "dnd5e")
                    return super.doCustomArrayValue(actor, current, change, Object.keys(CONFIG.DND5E.conditionTypes));
                else
                    return super.doCustomArrayValue(actor, current, change, Object.keys(CONFIG.SW5E.conditionTypes));
            case "data.traits.toolProf.value":
                if (game.system.id === "dnd5e")
                    return super.doCustomArrayValue(actor, current, change, Object.keys(CONFIG.DND5E.toolProficiencies));
                else
                    return super.doCustomArrayValue(actor, current, change, Object.keys(CONFIG.SW5E.toolProficiencies));
            case "data.traits.toolProf.all":
                if (game.system.id === "dnd5e")
                    setProperty(actor.data, "data.traits.toolProf.value", Object.keys(CONFIG.DND5E.toolProficiencies));
                else
                    setProperty(actor.data, "data.traits.toolProf.value", Object.keys(CONFIG.SW5E.toolProficiencies));
                return true;
            case "data.traits.armorProf.value":
                if (game.system.id === "dnd5e")
                    return super.doCustomArrayValue(actor, current, change, Object.keys(CONFIG.DND5E.armorProficiencies));
                else
                    return super.doCustomArrayValue(actor, current, change, Object.keys(CONFIG.SW5E.armorProficiencies));
            case "data.traits.armorProf.all":
                if (game.system.id === "dnd5e")
                    setProperty(actor.data, "data.traits.armorProf.value", Object.keys(CONFIG.DND5E.armorProficiencies));
                else
                    setProperty(actor.data, "data.traits.armorProf.value", Object.keys(CONFIG.SW5E.armorProficiencies));
                return true;
            case "data.traits.weaponProf.value":
                if (game.system.id === "dnd5e")
                    return super.doCustomArrayValue(actor, current, change, Object.keys(CONFIG.DND5E.weaponProficiencies));
                else
                    return super.doCustomArrayValue(actor, current, change, Object.keys(CONFIG.SW5E.weaponProficiencies));
            case "data.traits.weaponProf.all":
                if (game.system.id === "dnd5e")
                    setProperty(actor.data, "data.traits.weaponProf.value", Object.keys(CONFIG.DND5E.weaponProficiencies));
                else
                    setProperty(actor.data, "data.traits.weaponProf.value", Object.keys(CONFIG.SW5E.weaponProficiencies));
                return true;
            case "data.bonuses.weapon.damage":
                value = this.attackDamageBonusEval(change.value, actor);
                if (current)
                    value = (change.value.startsWith("+") || change.value.startsWith("-")) ? value : "+" + value;
                this.weaponAttacks.forEach(atType => actor.data.data.bonuses[atType].damage += value);
                return true;
            case "data.bonuses.spell.damage":
                value = this.attackDamageBonusEval(change.value, actor);
                if (current)
                    value = (change.value.startsWith("+") || change.value.startsWith("-")) ? value : "+" + value;
                this.spellAttacks.forEach(atType => actor.data.data.bonuses[atType].damage += value);
                return true;
            case "data.bonuses.mwak.attack":
            case "data.bonuses.mwak.damage":
            case "data.bonuses.rwak.attack":
            case "data.bonuses.rwak.damage":
            case "data.bonuses.msak.attack":
            case "data.bonuses.msak.damage":
            case "data.bonuses.mpak.attack":
            case "data.bonuses.mpak.damage":
            case "data.bonuses.rpak.attack":
            case "data.bonuses.rpak.damage":
            case "data.bonuses.rsak.attack":
            case "data.bonuses.rsak.damage":
            case "data.bonuses.heal.attack":
            case "data.bonuses.heal.damage":
            case "data.bonuses.abilities.save":
            case "data.bonuses.abilities.check":
            case "data.bonuses.abilities.skill":
            case "data.bonuses.power.forceLightDC":
            case "data.bonuses.power.forceDarkDC":
            case "data.bonuses.power.forceUnivDC":
            case "data.bonuses.power.techDC":
                // TODO: remove if fixed in core
                let result = this.attackDamageBonusEval(change.value, actor);
                value = result;
                if (current)
                    value = (result.startsWith("+") || result.startsWith("-")) ? result : "+" + result;
                setProperty(actor.data, change.key, (current || "") + value);
                return true;
            case "data.attributes.movement.all":
                const movement = actor.data.data.attributes.movement;
                let op = "";
                if (typeof change.value === "string") {
                    change.value = change.value.trim();
                    if (["+", "-", "/", "*"].includes(change.value[0])) {
                        op = change.value[0];
                    }
                }
                for (let key of Object.keys(movement)) {
                    if (key === "units")
                        continue;
                    let valueString = change.value;
                    if (op !== "") {
                        //@ts-ignore isNumeric
                        if (!movement[key])
                            continue;
                        valueString = `${movement[key]} ${change.value}`;
                    }
                    try {
                        //@ts-ignore
                        let result = (new Roll(valueString, actor.getRollData())).evaluate({ async: false }).total;
                        movement[key] = Math.floor(Math.max(0, result) + 0.5);
                    }
                    catch (err) {
                        console.warn(`dae | Error evaluating custom movement.all = ${valueString}`, key, err);
                    }
                }
                ;
                return true;
            //TODO review this for 1.5
            case "data.abilities.str.dc":
            case "data.abilities.dex.dc":
            case "data.abilities.int.dc":
            case "data.abilities.wis.dc":
            case "data.abilities.cha.dc":
            case "data.abilities.con.dc":
            case "data.bonuses.spell.dc":
            case "data.attributes.powerForceLightDC":
            case "data.attributes.powerForceDarkDC":
            case "data.attributes.powerForceUnivDC":
            case "data.attributes.powerTechDC":
                //@ts-ignore
                if (Number.isNumeric(change.value)) {
                    value = parseInt(change.value);
                }
                else {
                    try {
                        //@ts-ignore
                        value = (new Roll(change.value, actor.getRollData())).evaluate({ async: false }).total;
                    }
                    catch (err) { }
                    ;
                }
                if (value !== undefined) {
                    setProperty(actor.data, change.key, Number(current) + value);
                }
                else
                    return;
                // Spellcasting DC
                const ad = actor.data.data;
                const spellcastingAbility = ad.abilities[ad.attributes.spellcasting];
                ad.attributes.spelldc = spellcastingAbility ? spellcastingAbility.dc : 8 + ad.attributes.prof;
                if (actor.items) {
                    actor.items.forEach(item => {
                        item.getSaveDC();
                        item.getAttackToHit();
                    });
                }
                ;
                return true;
            case "flags.dae":
                let list = change.value.split(" ");
                const flagName = list[0];
                let formula = list.splice(1).join(" ");
                const rollData = actor.getRollData();
                const flagValue = getProperty(rollData.flags, `dae.${flagName}`) || 0;
                // ensure the flag is not undefined when doing the roll, supports flagName @flags.dae.flagName + 1
                setProperty(rollData, `flags.dae.${flagName}`, flagValue);
                //@ts-ignore evaluate TODO work out async
                value = new Roll(formula, rollData).evaluate({ async: false }).total;
                setProperty(actor.data, `flags.dae.${flagName}`, value);
                return true;
        }
    }
}
function getRollData(wrapped) {
    const data = wrapped();
    data.flags = this.data.flags;
    return data;
}
async function preparePassiveSkills() {
    const skills = this.data.data.skills;
    if (!skills)
        return;
    for (let skillId of Object.keys(skills)) {
        const skill = this.data.data.skills[skillId];
        const abilityId = skill.ability;
        const advdisadv = procAdvantageSkill(this, abilityId, skillId);
        skill.passive = skill.passive + 5 * advdisadv;
    }
}
function prepareData(wrapped) {
    debug("prepare data: before passes", this.name, this.data._source);
    this.overrides = {};
    wrapped();
    if (this.name === "Luthar v2")
        debugger;
    const hasHeavy = this.items.find(i => i.data.data.equipped && i.data.data.stealth) !== undefined;
    if (hasHeavy)
        setProperty(this.data, "flags.midi-qol.disadvantage.skill.ste", true);
    applyDaeEffects.bind(this)(ValidSpec.specs[this.type].derivedSpecsObj, ValidSpec.specs[this.type].baseSpecsObj, true);
    preparePassiveSkills.bind(this)();
    //TODO find another way to tdo this
    // this._prepareOwnedItems(this.data.items)
    debug("prepare data: after passes", this.data);
}
function procAdvantageSkill(actor, abilityId, skillId) {
    const midiFlags = actor.data.flags["midi-qol"] ?? {};
    const advantage = midiFlags.advantage ?? {};
    const disadvantage = midiFlags.disadvantage ?? {};
    let withAdvantage = advantage.all ?? false;
    let withDisadvantage = disadvantage.all ?? false;
    if (advantage.ability) {
        withAdvantage = withAdvantage || advantage.ability.all || advantage.ability.check?.all;
    }
    if (advantage.ability?.check) {
        withAdvantage = withAdvantage || advantage.ability.check[abilityId];
    }
    if (advantage.skill) {
        withAdvantage = withAdvantage || advantage.skill.all || advantage.skill[skillId];
    }
    if (disadvantage.ability) {
        withDisadvantage = withDisadvantage || disadvantage.all || disadvantage.ability.all || disadvantage.ability.check?.all;
    }
    if (disadvantage.ability?.check) {
        withDisadvantage = withDisadvantage || disadvantage.ability.check[abilityId];
    }
    if (disadvantage.skill) {
        withDisadvantage = withDisadvantage || disadvantage.skill.all || disadvantage.skill[skillId];
    }
    if ((withAdvantage && withDisadvantage) || (!withAdvantage && !withDisadvantage))
        return 0;
    else if (withAdvantage)
        return 1;
    else
        return -1;
}
function _prepareArmorClassAttribution(wrapped, data) {
    const attributions = wrapped(data);
    if (!this.object.data.effects)
        return attributions;
    for (let effect of this.object.data.effects) {
        for (let change of effect.data.changes) {
            //@ts-ignore .isNumeric - core does not look at ac.value or non-numeric ac.bonus
            if ((change.key === "data.attributes.ac.value" || change.key === "data.attributes.ac.bonus" && !Number.isNumeric(change.value)) && !effect.data.disabled && !effect.isSuppressed) {
                attributions.push({
                    label: `${effect.data.label} (dae)`,
                    mode: change.mode,
                    value: change.value
                });
            }
        }
    }
    return attributions;
}
export function patchPrepareArmorClassAttribution() {
    if (game.system.id === "dnd5e") {
        libWrapper.register("dae", "CONFIG.Actor.sheetClasses.character['dnd5e.ActorSheet5eCharacter'].cls.prototype._prepareArmorClassAttribution", _prepareArmorClassAttribution, "WRAPPER");
        libWrapper.register("dae", "CONFIG.Actor.sheetClasses.npc['dnd5e.ActorSheet5eNPC'].cls.prototype._prepareArmorClassAttribution", _prepareArmorClassAttribution, "WRAPPER");
        libWrapper.register("dae", "CONFIG.Actor.sheetClasses.vehicle['dnd5e.ActorSheet5eVehicle'].cls.prototype._prepareArmorClassAttribution", _prepareArmorClassAttribution, "WRAPPER");
    }
    else if (game.system.id === "sw5e") {
        libWrapper.register("dae", "CONFIG.Actor.sheetClasses.character['sw5e.ActorSheet5eCharacter'].cls.prototype._prepareArmorClassAttribution", _prepareArmorClassAttribution, "WRAPPER");
        libWrapper.register("dae", "CONFIG.Actor.sheetClasses.npc['sw5e.ActorSheet5eNPC'].cls.prototype._prepareArmorClassAttribution", _prepareArmorClassAttribution, "WRAPPER");
        libWrapper.register("dae", "CONFIG.Actor.sheetClasses.vehicle['sw5e.ActorSheet5eVehicle'].cls.prototype._prepareArmorClassAttribution", _prepareArmorClassAttribution, "WRAPPER");
    }
}
