import {SharedConsts} from "../shared/SharedConsts.js";
import {NamedTokenCreator} from "./NamedTokenCreator.js";
import {UtilTokens} from "./UtilTokens.js";
import {ChooseImporter} from "./ChooseImporter.js";
import {UtilApplications} from "./UtilApplications.js";

class ModuleMacro {
	static api_importToSelectedTokens () { return ModuleMacro._ImportToSelectedTokens.pExec(); }
	static api_createNamedToken () { return ModuleMacro._CreateNamedToken.pExec(); }
}

ModuleMacro._ImportToSelectedTokens = class {
	static async pExec () {
		try {
			await this._pExec();
		} catch (e) {
			ui.notifications.error(`Importing failed! ${VeCt.STR_SEE_CONSOLE}`);
			throw e;
		}
	}

	static async _pExec () {
		const tokens = [...canvas.tokens.controlled].filter(it => it.actor);
		if (!tokens.length) return ui.notifications.warn(`Please select some tokens (which have actors) first!`);

		const actors = tokens.map(it => it.actor).unique();
		if (!actors.length) return ui.notifications.warn(`Please select some tokens (which have actors) first!`);

		// If there is only a single actor, open the standard importer flow for this actor (as though opening it from a sheet)
		if (actors.length === 1) {
			await ChooseImporter.api_pOpen({actor: actors[0]});
			return;
		}

		// region If we are importing to multiple tokens, create a single dummy actor as a surrogate import target, then copy the resulting changes to each actor once the import wizard is closed.
		const ACTOR_TYPE_PREFERENCE = ["character", "npc", "vehicle"];
		const actorTypes = actors
			.map(it => it.type)
			.unique()
			.sort((a, b) => ACTOR_TYPE_PREFERENCE.indexOf(a) - ACTOR_TYPE_PREFERENCE.indexOf(b));

		if (actorTypes.length > 1) ui.notifications.warn(`Multiple actor types found in selected tokens\u2014the importer will run as though importing to a "${actorTypes[0]}"-type actor.`);

		ui.notifications.info(`You are importing to ${actors.length} actors\u2014updates will be applied, as a batch, when the importer is closed.`);

		const dummyActor = await Actor.create(
			{
				name: "Temp",
				type: actorTypes[0],
				flags: {[SharedConsts.MODULE_NAME]: {isImporterTempActor: true}},
			},
			{
				renderSheet: false,
				temporary: true,
			},
		);
		const baseData = dummyActor.toJSON();
		// Remove our temp flag, to avoid generating a junk diff later
		delete baseData.flags[SharedConsts.MODULE_NAME];

		const importer = await ChooseImporter.api_pOpen({actor: dummyActor});

		await UtilApplications.pAwaitAppClose(importer);

		ui.notifications.info(`Applying updates...`);

		const finalData = dummyActor.toJSON();

		// Remove our temp flags, to avoid applying them to the target actors
		MiscUtil.delete(finalData, "flags", SharedConsts.MODULE_NAME, "isImporterTempActor");
		if (!Object.keys(MiscUtil.get(finalData, "flags", SharedConsts.MODULE_NAME) || {}).length) MiscUtil.delete(finalData, "flags", SharedConsts.MODULE_NAME);

		let isAnyUpdate = false;

		const DIFF_OBJECT_PROPS = ["system", "prototypeToken", "flags"];
		for (const prop of DIFF_OBJECT_PROPS) {
			if (!baseData[prop] && !finalData[prop]) continue;

			const diff = foundry.utils.diffObject(baseData[prop], finalData[prop]);

			if (!Object.keys(diff).length) continue;
			isAnyUpdate = true;

			for (const actor of actors) await actor.update({[prop]: diff});
		}

		const DIFF_EMBEDDED_PROPS = [
			{prop: "items", documentName: "Item"},
			{prop: "effects", documentName: "ActiveEffect"},
		];
		for (const {prop, documentName} of DIFF_EMBEDDED_PROPS) {
			if (!finalData[prop]?.length) continue;
			isAnyUpdate = true;

			for (const actor of actors) {
				const cpyEmbeds = MiscUtil.copy(finalData[prop]);

				const [toCreates, toUpdates] = cpyEmbeds.segregate(embed => {
					// Fix any `origin`s, e.g. for active effects, which may point to invalid actors
					if (embed.origin && typeof embed.origin === "string") {
						const originSpl = embed.origin.split(".");
						// E.g. `Actor.<id>.Item.<id>`
						// If the actor ID is `null`, then repair it, using our current actor's ID
						if (originSpl.length === 4 && originSpl[1] === "null") {
							originSpl[1] = actor.id;
							embed.origin = originSpl.join(".");
						}
					}

					return actor[prop].get(embed._id) == null;
				});

				if (toCreates.length) await actor.createEmbeddedDocuments(documentName, toCreates, {keepId: true});
				if (toUpdates.length) await actor.updateEmbeddedDocuments(documentName, toUpdates);
			}
		}

		if (isAnyUpdate) ui.notifications.info(`Updates applied!`);
		else ui.notifications.warn(`Found no updates to apply!`);
		// endregion
	}
};

ModuleMacro._CreateNamedToken = class {
	static pExec () {
		canvas.stage.once("click", async evt => {
			try {
				const {x, y} = evt.data.getLocalPosition(canvas.stage);

				const name = await InputUiUtil.pGetUserString({title: "Token Name"});
				if (!name) return;

				const size = await InputUiUtil.pGetUserEnum({
					values: Parser.SIZE_ABVS,
					title: "Select Token Size",
					fnDisplay: it => Parser.sizeAbvToFull(it),
					isResolveItem: true,
				});
				if (!size) return;

				const {dimensions = 1, scale = 1} = UtilTokens.getTokenDimensionsAndScale(size);

				await NamedTokenCreator.pCreateToken({
					name,
					xScene: x,
					yScene: y,
					width: dimensions,
					height: dimensions,
					scale,
				});
			} catch (e) {
				ui.notifications.error(`Failed to create token! ${VeCt.STR_SEE_CONSOLE}`);
				throw e;
			}
		});

		ui.notifications.info("Click on the canvas to spawn a token!");
	}
};

export {ModuleMacro};
