import {UtilLibWrapper} from "./PatcherLibWrapper.js";
import {Config} from "./Config.js";

class Patcher_CanvasAnimation {
	static init () {
		// region Disable animations
		UtilLibWrapper.addPatch(
			"Token.prototype._onUpdateAppearance",
			this._lw_Token_prototype__onUpdateAppearance,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
		);

		UtilLibWrapper.addPatch(
			"Ruler.prototype._getMovementToken",
			this._lw_Ruler_prototype__getMovementToken,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
		);
		// endregion

		// region Speed up animations
		UtilLibWrapper.addPatch(
			"Token.prototype.animate",
			this._lw_Token_prototype_animate,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
		);
		// endregion
	}

	static _lw_Token_prototype__onUpdateAppearance (fn, data, changed, opts, ...otherArgs) {
		if (
			Config.get("tokens", "isDisableAnimations")
			&& Patcher_CanvasAnimation._isOnlyMovement(data)
			&& (
				!Config.get("tokens", "isIgnoreDisableAnimationsForWaypointMovement")
				|| !Patcher_CanvasAnimation._isTokenMovingAlongRuler(this)
			)
		) {
			opts = opts || {};
			opts.animate = false;
		}
		return fn(data, changed, opts, ...otherArgs);
	}

	static _IS_ONLY_MOVEMENT_KEYS = new Set(["_id", "x", "y"]);
	static _isOnlyMovement (updateData) {
		const otherKeys = Object.keys(updateData).filter(it => !this._IS_ONLY_MOVEMENT_KEYS.has(it));
		return !otherKeys.length;
	}

	static _lw_Ruler_prototype__getMovementToken (fn) {
		const out = fn();
		this._plut_tokenLastMoving = out;
		return out;
	}

	static _isTokenMovingAlongRuler (token) {
		return canvas.controls.rulers.children.some(it => it._state === Ruler.STATES.MOVING && it._plut_tokenLastMoving === token);
	}

	static _lw_Token_prototype_animate (fn, updateData, opts, ...otherArgs) {
		const mult = Config.get("tokens", "animationSpeedMultiplier");
		if (mult == null) return fn(updateData, opts, ...otherArgs);

		opts = {...opts || {}};
		if (opts.movementSpeed == null) opts.movementSpeed = 6; // "6" taken from defaults of the patched method
		opts.movementSpeed *= mult;

		return fn(updateData, opts, ...otherArgs);
	}
}

export {Patcher_CanvasAnimation};
