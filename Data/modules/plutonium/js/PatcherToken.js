import {UtilLibWrapper} from "./PatcherLibWrapper.js";
import {Config} from "./Config.js";
import {LGT} from "./Util.js";
import {ConfigConsts} from "./ConfigConsts.js";
import {UtilCompat} from "./UtilCompat.js";
import {UtilGameSettings} from "./UtilGameSettings.js";

class Patcher_Token {
	static init () {
		// Note: unfortunately, `refreshToken` is not called when the token's actor is updated (e.g. when HP changes), so
		//   while we can avoid patching `Token.refresh`, we still have to patch various "on actor update" methods.
		// See: https://github.com/foundryvtt/foundryvtt/issues/6968
		Hooks.on("refreshToken", (token) => {
			if (!Config.get("tokens", "isDisplayDamageDealt")) return;
			Patcher_Token._handleConfigUpdate_displayDamageDealt_doUpdateDisplay(token);
		});
	}

	static _lw_Token_prototype__onUpdate (fn, ...args) {
		const out = fn(...args);
		Patcher_Token._handleConfigUpdate_displayDamageDealt_doUpdateDisplay(this);
		return out;
	}

	static _lw_TokenDocument_prototype__onUpdateTokenActor (fn, ...args) {
		const out = fn(...args);
		Patcher_Token._handleConfigUpdate_displayDamageDealt_doUpdateDisplay(this.object);
		return out;
	}

	static _lw_TokenDocument_prototype__onUpdateBaseActor (fn, ...args) {
		const out = fn(...args);
		Patcher_Token._handleConfigUpdate_displayDamageDealt_doUpdateDisplay(this.object);
		return out;
	}

	static _lw_Token_prototype__getTextStyle (fn, ...args) {
		const out = fn(...args);

		const fontSizeMult = Config.get("tokens", "nameplateFontSizeMultiplier");
		if (fontSizeMult != null) {
			if (out.fontSize != null) out.fontSize *= fontSizeMult;
		}

		const isAllowWrap = Config.get("tokens", "isAllowNameplateFontWrap");
		if (isAllowWrap !== ConfigConsts.C_USE_GAME_DEFAULT) {
			out.wordWrap = !!isAllowWrap;
		}

		const fontWrapWidthMult = Config.get("tokens", "nameplateFontWrapWidthMultiplier");
		if (fontWrapWidthMult != null) {
			if (out.wordWrapWidth != null) out.wordWrapWidth *= fontWrapWidthMult;
		}

		return out;
	}

	static handleConfigUpdate ({isInit = false, current, previous} = {}) {
		const tokens = MiscUtil.get(canvas, "tokens", "placeables") || [];

		this._handleConfigUpdate_displayDamageDealt({isInit, tokens});
		this._handleConfigUpdate_togglePatches();

		// Avoid doing a draw unless we've had a relevant config update
		if (!this._handleConfigUpdate_isDoDraw({isInit, current, previous})) return;

		// Delay the initial draw, to allow tokens to fully render
		this._handleConfigUpdate_pDoDraw({tokens});
	}

	static _handleConfigUpdate_togglePatches () {
		// region "Damage dealt" display
		UtilLibWrapper.togglePatch(
			"Token.prototype._onUpdate",
			this._lw_Token_prototype__onUpdate,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
			Config.get("tokens", "isDisplayDamageDealt"),
		);

		UtilLibWrapper.togglePatch(
			"TokenDocument.prototype._onUpdateTokenActor",
			this._lw_TokenDocument_prototype__onUpdateTokenActor,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
			Config.get("tokens", "isDisplayDamageDealt"),
		);

		UtilLibWrapper.togglePatch(
			"TokenDocument.prototype._onUpdateBaseActor",
			this._lw_TokenDocument_prototype__onUpdateBaseActor,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
			Config.get("tokens", "isDisplayDamageDealt"),
		);
		// endregion

		// region Nameplate text size
		UtilLibWrapper.togglePatch(
			"Token.prototype._getTextStyle",
			this._lw_Token_prototype__getTextStyle,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
			[
				Config.get("tokens", "nameplateFontSizeMultiplier"),
				Config.get("tokens", "isAllowNameplateFontWrap"),
				Config.get("tokens", "nameplateFontWrapWidthMultiplier"),
			].some(it => it != null && it !== ConfigConsts.C_USE_GAME_DEFAULT),
		);
		// endregion
	}

	static _isForceDisabled (token) {
		if (
			UtilCompat.isMonksLittleDetailsActive()
			&& UtilGameSettings.getSafe(UtilCompat.MODULE_MONKS_LITTLE_DETAILS, "show-bloodsplat")
			&& UtilCompat.MonksLittleDetails.isDefeated(token)
		) return true;
		return false;
	}

	static _handleConfigUpdate_isDoDraw ({isInit, current, previous}) {
		if (isInit) return true;
		if (!current || !previous) return false;

		const diffProps = [
			"isDisplayDamageDealt",
			"damageDealtBloodiedThreshold",
			"isDamageDealtBelowToken",
			"missingHealthAttribute",

			"nameplateFontSizeMultiplier",
			"isAllowNameplateFontWrap",
			"nameplateFontWrapWidthMultiplier",
		];
		return diffProps.some(prop => MiscUtil.get(current, "tokens", prop) !== MiscUtil.get(previous, "tokens", prop));
	}

	static async _handleConfigUpdate_pDoDraw ({tokens}) {
		for (const token of tokens) {
			try {
				const visible = token.visible;
				await this._pDoTokenFakeDraw({token});
				token.visible = visible;
			} catch (e) {
				// Sanity check/should never occur
				console.warn(...LGT, `Failed to refresh token "${token.id}"!`, e);
			}
		}
	}

	/**
	 * A stripped-down version of `Token._draw`, which allows us to change font parameters.
	 * We do this to avoid messing with modules like Token Magic FX, whose filters get stripped as part of `._draw()`.
	 */
	static async _pDoTokenFakeDraw ({token}) {
		// region Redraw HUD elements
		token.removeChild(token.tooltip).destroy({children: true});
		token.removeChild(token.nameplate).destroy({children: true});

		token.tooltip = token.addChild(token._drawTooltip());
		token.nameplate = token.addChild(token._drawNameplate());
		// endregion

		token.refresh();
	}

	static _handleConfigUpdate_displayDamageDealt ({isInit = false, tokens} = {}) {
		try {
			return this._handleConfigUpdate_displayDamageDealt_({tokens});
		} catch (e) {
			if (!isInit) throw e;
			Config.handleFailedInitConfigApplication("tokens", "isDisplayDamageDealt", e);
		}
	}

	static _handleConfigUpdate_displayDamageDealt_ ({tokens}) {
		this._handleConfigUpdate_displayDamageDealt_doRefreshTokens({
			tokens,
			isRemoveDisplays: !Config.get("tokens", "isDisplayDamageDealt"),
		});
	}

	/**
	 * @param [opts]
	 * @param [opts.tokens]
	 * @param [opts.isRemoveDisplays] If the custom displays should be removed.
	 */
	static _handleConfigUpdate_displayDamageDealt_doRefreshTokens ({tokens, isRemoveDisplays}) {
		for (const token of tokens) {
			try {
				if (isRemoveDisplays) Patcher_Token._doRemove(token);
			} catch (e) {
				// Should never occur
			}
		}
	}

	static _doRemove (token) {
		if (!token?.plut_dispDamageDealt) return;
		this._doDestroyText(token.removeChild(token?.plut_dispDamageDealt));
		delete token.plut_dispDamageDealt;
	}

	static _handleConfigUpdate_displayDamageDealt_doUpdateDisplay (token) {
		try {
			if (this._isForceDisabled(token)) {
				Patcher_Token._doRemove(token);
				return;
			}

			this._handleConfigUpdate_displayDamageDealt_doAddDisplay(token);

			const maxHp = foundry.utils.getProperty(token.actor, `system.${Config.get("tokens", "missingHealthAttribute")}.max`) || 0;
			const curHp = foundry.utils.getProperty(token.actor, `system.${Config.get("tokens", "missingHealthAttribute")}.value`) || 0;

			const damageDealt = Math.min(maxHp, Math.max(0, maxHp - curHp));
			token.plut_dispDamageDealt.text = `-${damageDealt}`;

			token.plut_dispDamageDealt.visible = !!damageDealt;

			const fontSizeMult = Config.get("tokens", "nameplateFontSizeMultiplier");

			// If we are using levels, render the text below the token. This is to allow levels to work its token-clobbering
			//   magic without leaving our text underneath the token. We do this instead of patching levels, as patching levels
			//   would require constant maintenance.
			if (Config.get("tokens", "isDamageDealtBelowToken")) {
				token.plut_dispDamageDealt.style.fontSize = 18 * (fontSizeMult ?? 1);

				token.plut_dispDamageDealt.anchor.set(0.5, 0);

				token.plut_dispDamageDealt.position.set(Math.round(token.w / 2), token.h + 1);
			} else {
				token.plut_dispDamageDealt.style.fontSize = 24 * (fontSizeMult ?? 1);

				// Anchor text to the bottom-right of the nameplate
				token.plut_dispDamageDealt.anchor.set(1, 1);

				// Taken from `Token._drawBar`
				const barHeight = Math.max((canvas.dimensions.size / 12), 8) * (token.document.height >= 2 ? 1.6 : 1);

				// Set position at bottom-right of token (with small offsets)
				token.plut_dispDamageDealt.position.set(token.w - 3, token.h - barHeight);
			}

			if (curHp <= Math.floor(maxHp * Config.get("tokens", "damageDealtBloodiedThreshold"))) token.plut_dispDamageDealt.style.fill = 0xFF0000;
			else token.plut_dispDamageDealt.style.fill = 0xFFFFFF;
		} catch (e) {
			// Sanity check/should never occur
			console.warn(...LGT, `Failed to update "damage dealt" display for token "${token.id}"!`, e);
		}
	}

	static _handleConfigUpdate_displayDamageDealt_doAddDisplay (token) {
		if (
			token?.plut_dispDamageDealt
			&& token?.plut_dispDamageDealt.parent // Our display can become orphaned--in this case, we need to regenerate it
		) return;

		// If orphaned, cleanup to prevent any leaks
		if (token?.plut_dispDamageDealt && !token?.plut_dispDamageDealt?.parent) {
			token.removeChild(token?.plut_dispDamageDealt);
			this._doDestroyText(token?.plut_dispDamageDealt);
			token.plut_dispDamageDealt = null;
		}

		// region Based on "Token._drawNameplate()"
		// Create the nameplate text
		token.plut_dispDamageDealt = new PreciseText("", CONFIG.canvasTextStyle.clone());

		token.addChild(token?.plut_dispDamageDealt);
	}

	static _doDestroyText (text) {
		if (!text?.texture) return;
		text.destroy();
	}
}

export {Patcher_Token};
