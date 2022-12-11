import {SharedConsts} from "../shared/SharedConsts.js";
import {Config} from "./Config.js";

class Patcher_Tooltips {
	static _ACTIVATION_MS_FAST = 300;
	static _ACTIVATION_MS_DEFAULT = null;

	static init () {
		this._ACTIVATION_MS_DEFAULT = TooltipManager.TOOLTIP_ACTIVATION_MS || 500;

		Hooks.on(`${SharedConsts.MODULE_NAME_FAKE}.configUpdate`, () => this._handleConfigUpdate());
		this._handleConfigUpdate();
	}

	static _handleConfigUpdate () {
		if (!Config.get("ui", "isFastTooltips")) {
			TooltipManager.TOOLTIP_ACTIVATION_MS = this._ACTIVATION_MS_DEFAULT;
			return;
		}
		TooltipManager.TOOLTIP_ACTIVATION_MS = this._ACTIVATION_MS_FAST;
	}
}

export {Patcher_Tooltips};
