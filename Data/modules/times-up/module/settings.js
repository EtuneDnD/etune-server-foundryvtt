import { setDebugLevel, warn, debug } from "../times-up.js";
export let disablePassiveEffects;
export const registerSettings = function () {
    // Register any custom module settings here
    game.settings.register("times-up", "store", {
        name: "Effect Expiry queue",
        hint: "Don't touch this",
        default: {},
        type: Object,
        scope: 'world',
        config: false,
        onChange: fetchQueue
    });
    game.settings.register("times-up", "DisablePassiveEffects", {
        name: "times-up.DisablePassiveEffects.Name",
        hint: "times-up.DisablePassiveEffects.Hint",
        scope: "world",
        default: false,
        type: Boolean,
        config: true,
        onChange: fetchParams
    });
    game.settings.register("times-up", "Debug", {
        name: "times-up.Debug.Name",
        hint: "times-up.Debug.Hint",
        scope: "world",
        default: "None",
        type: String,
        config: true,
        choices: { none: "None", warn: "warnings", debug: "debug", all: "all" },
        onChange: fetchParams
    });
    game.settings.register("times-up", "status", {
        scope: "world",
        default: {},
        type: Object,
        config: false
    });
};
class Qentry {
}
const defaultQueue = {
    //@ts-ignore
    effects: new Collection()
};
export var effectQueue;
export function fetchParams() {
    setDebugLevel(game.settings.get("times-up", "Debug"));
    disablePassiveEffects = game.settings.get("times-up", "DisablePassiveEffects") ?? false;
}
export function fetchQueue() {
    if (!game.user.isGM)
        return;
    //@ts-ignore .contents
    if (game.user == game.users.contents.find(u => u.isGM && u.active) && effectQueue)
        return;
    effectQueue = {};
    let data = game.settings.get("times-up", "store");
    try {
        //@ts-ignore
        effectQueue.effects = new Collection();
        data.entries?.forEach(i => {
            effectQueue.effects.set(i.effectData._id, i);
        });
        // effectQueue.effects = new Map(data.entries)
    }
    catch (err) {
        warn(err, data.entries);
        effectQueue = null;
    }
    if (!effectQueue?.effects) {
        warn("resetting to empty queue");
        effectQueue = defaultQueue;
    }
}
// Avoid saving the queue too often.
//@ts-ignore debounce
export let saveQueue = debounce(baseSaveQueue, 500);
export async function baseSaveQueue() {
    debug("Save queue", effectQueue);
    //@ts-ignore contents
    let intendedGM = game.users.contents.find(u => u.isGM && u.active);
    if (intendedGM.id === game.user.id) {
        let data = { entries: null };
        data.entries = effectQueue.effects.contents;
        warn("Saving queue", data, effectQueue);
        await game.settings.set("times-up", "store", data);
    }
}
export async function clearQueue() {
    if (game.user.isGM) {
        effectQueue = defaultQueue;
        await saveQueue();
    }
}
