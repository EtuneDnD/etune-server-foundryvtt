import {UtilApplications} from "./UtilApplications.js";
import {UtilSocket} from "./UtilSocket.js";
import {UtilMigrate} from "./UtilMigrate.js";
import {UtilActors} from "./UtilActors.js";
import {UtilDocuments} from "./UtilDocuments.js";

class ShowSheet {
	// region External
	static init () {
		UtilSocket.addSocketEventListener(
			ShowSheet._SOCKET_NAMESPACE,
			id => {
				ShowSheet._pShowSheet(id);
			},
		);
	}

	static pHandleButtonClick (evt, app, $html, data) {
		evt.preventDefault();
		return this._pHandleShowClick(app, data);
	}
	// endregion

	static async _pHandleShowClick (app, data) {
		const name = app.title || UtilApplications.getDataName(data);

		// Based on `JournalEntry#show`
		if (!UtilMigrate.isOwner(data)) throw new Error("You may only request to show sheets which you own.");

		const activeUsersWithoutPermissions = CONFIG.User.collection.instance.contents.filter(it => it.active).filter(user => !(app.actor || app.document).testUserPermission(user));
		if (activeUsersWithoutPermissions.length) {
			const isSetDefaultOwnership = await InputUiUtil.pGetUserBoolean({
				title: `Update Permissions`,
				textYes: `Make Visible to All Users`,
				textNo: `Show to Current Viewers`,
				htmlDescription: `${Parser.numberToText(activeUsersWithoutPermissions.length).uppercaseFirst()} ${activeUsersWithoutPermissions.length === 1 ? "user is" : "users are"} currently unable to view this sheet.<br>Would you like to update the default permissions for this sheet, to allow all users to view it?`,
			});

			if (isSetDefaultOwnership) {
				await UtilDocuments.pUpdateDocument(
					app.actor || app.document,
					{ownership: {default: CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED}},
				);
			}
		}

		await UtilSocket.pSendData(ShowSheet._SOCKET_NAMESPACE, app.id);
		ShowSheet._pShowSheet(app.id);
		ui.notifications.info(`"${name}" show to authorized players.`);
	}

	/**
	 * @param appId of the form e.g. `'<ActorSheet5e|ItemSheet5e>-<Actor|Item>-<id>'`
	 */
	static _pShowSheet (appId) {
		if (!appId) return;
		const [, type, id] = appId.split(/-/);

		let doc;

		const collection = CONFIG[type]?.collection;
		if (!collection) throw new Error(`Unsupported entity type "${type}"`);

		doc = collection.instance.get(id);

		if (!doc || !doc.visible) return;

		return doc.sheet.render(true);
	}
}
ShowSheet._SOCKET_NAMESPACE = "ShowSheet";

export {ShowSheet};
