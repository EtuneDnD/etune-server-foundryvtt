import { DAESystemDND5E } from "./DAEdnd5e.js";
//@ts-ignore
const CONFIG = globalThis.CONFIG;
export class DAESystemSW5E extends DAESystemDND5E {
    static getOptionsForSpec(specification) {
        return {};
    }
    static modifySpecials(actorType, specials, characterSpec) {
        super.modifySpecials(actorType, specials, characterSpec);
        //@ts-ignore
        const ACTIVE_EFFECT_MODES = CONST.ACTIVE_EFFECT_MODES;
        specials["data.traits.sdi.all"] = [false, ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.traits.sdi.value"] = ["", -1];
        specials["data.traits.sdi.custom"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.traits.sdr.all"] = [false, ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.traits.sdr.value"] = ["", -1];
        specials["data.traits.sdr.custom"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.traits.sdv.all"] = [false, ACTIVE_EFFECT_MODES.CUSTOM];
        specials["data.traits.sdv.value"] = ["", -1];
        specials["data.traits.sdv.custom"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        if (game.system.id === "sw5e") {
            specials["data.attributes.powerForceLightDC"] = [0, ACTIVE_EFFECT_MODES.CUSTOM];
            specials["data.attributes.powerForceDarkDC"] = [0, ACTIVE_EFFECT_MODES.CUSTOM];
            specials["data.attributes.powerForceUnivDC"] = [0, ACTIVE_EFFECT_MODES.CUSTOM];
            specials["data.attributes.powerTechDC"] = [0, ACTIVE_EFFECT_MODES.CUSTOM];
        }
    }
    static initSystemData() {
        super.daeActionTypeKeys.concat(Object.keys(CONFIG.SW5E.itemActionTypes));
        super.spellAttacks.concat(["mpak", "rpak"]);
    }
    static initActions() {
        super.DAESystemInitActions();
    }
}
