import {SharedConsts} from "../shared/SharedConsts.js";
import {UtilGameSettings} from "./UtilGameSettings.js";
import {Config} from "./Config.js";

class UtilWorldDataSourceSelector {
	static _SETTINGS_KEY = "data-source-selection";

	static async pInit () {
		await game.settings.register(
			SharedConsts.MODULE_NAME,
			this._SETTINGS_KEY,
			{
				name: "World Data Source Selection",
				default: {},
				type: Object,
				scope: "world",
				onChange: data => {
					// No-op
				},
			},
		);
	}

	static async pSaveState (saveableState) {
		await game.settings.set(SharedConsts.MODULE_NAME, this._SETTINGS_KEY, saveableState);
		ui.notifications.info(`Saved! Note that you (and connected players) may need to reload for any changes to take effect.`);
	}

	static loadState () { return UtilGameSettings.getSafe(SharedConsts.MODULE_NAME, this._SETTINGS_KEY); }

	static isSourceSelectionActive () {
		return (!game.user.isGM && Config.get("dataSources", "isPlayerEnableSourceSelection"))
			|| (game.user.isGM && Config.get("dataSources", "isGmEnableSourceSelection"));
	}

	static isFiltered (dataSource) {
		if (!this.isSourceSelectionActive()) return false;

		const savedState = this.loadState();
		if (savedState == null) return false;

		return !savedState.state?.[dataSource.identifierWorld];
	}
}

export {UtilWorldDataSourceSelector};
