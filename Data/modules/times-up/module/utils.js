import { warn, debug } from "../times-up.js";
import { effectQueue, saveQueue } from "./settings.js";
export function removeConcentrationEffects(actor, effects) {
    return effects?.filter(ef => !isConcentrationEffect(actor, ef));
}
export function isConcentrationEffect(actor, effectData) {
    //@ts-ignore flags
    const midiFlags = actor.flags["midi-qol"];
    if (!midiFlags || !midiFlags["concentration-data"])
        return false;
    const concentrationUuid = midiFlags["concentration-data"].uuid;
    return effectData.orign === concentrationUuid;
}
export function GMAction(action, actor, effectData) {
    //@ts-ignore contents
    let intendedGM = game.users.contents.find(u => u.isGM && u.active);
    if (intendedGM.id === game.user.id) {
        warn("Gmaction", action, actor.uuid, effectData);
        switch (action) {
            case "createEffect":
                debug("create effect ", effectData, actor);
                if (hasDuration(effectData)) {
                    if (!effectData.duration.startTime)
                        effectData.duration.startTime = game.time.worldTime;
                    effectQueue.effects.set(effectData._id, { actorUuid: actor.uuid, effectData });
                    saveQueue();
                }
                break;
            case "deleteEffect":
                warn("Delete effect", actor, effectData);
                var effectDataId;
                if (typeof effectData === "string")
                    effectDataId = effectData;
                else
                    effectDataId = effectData?._id;
                if (effectQueue.effects.has(effectDataId)) {
                    effectQueue.effects.delete(effectDataId);
                    saveQueue();
                }
                break;
            case "updateEffect":
                warn("update effect", actor, effectData);
                effectQueue.effects.set(effectData._id, { actorUuid: actor.uuid, effectData });
                saveQueue();
        }
    }
}
export function TUfromUuid(uuid) {
    if (!uuid || uuid === "")
        return null;
    //@ts-ignore foundry v10 types
    return fromUuidSync(uuid);
}
export function TUfromActorUuid(uuid) {
    const doc = TUfromUuid(uuid);
    if (doc instanceof CONFIG.Token.documentClass)
        return doc.actor;
    //@ts-ignore actor.documentClass
    if (doc instanceof CONFIG.Actor.documentClass)
        return doc;
    return null;
}
export function hasDuration(effectData) {
    return effectData.duration && (effectData.duration.seconds || effectData.duration.turns || effectData.duration.rounds);
}
