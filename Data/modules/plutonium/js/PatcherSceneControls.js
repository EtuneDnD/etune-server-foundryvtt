import {UtilLibWrapper} from "./PatcherLibWrapper.js";

class Patcher_SceneControls {
	// region External

	static prePreInit () {
		this._addMissingBoxSelectControls();

		this._addBoxSelectSupport_measure();
		this._addBoxSelectSupport_lighting();
		this._addBoxSelectSupport_sounds();
		this._addBoxSelectSupport_notes();
	}

	// endregion

	static _BOX_SELECT_TOOL_METAS = [
		{
			groupName: "measure",
			title: "CONTROLS.MeasureSelect",
		},
		{
			groupName: "lighting",
			title: "CONTROLS.LightSelect",
		},
		{
			groupName: "sounds",
			title: "CONTROLS.SoundSelect",
		},
	];

	static _addMissingBoxSelectControls () {
		Hooks.on("getSceneControlButtons", (buttonMetas) => {
			if (!game.user.isGM) return;

			this._BOX_SELECT_TOOL_METAS.forEach(addMeta => {
				const buttonMeta = buttonMetas.find(it => it.name === addMeta.groupName);
				const isExists = buttonMeta.tools.some(it => it.name === "select");

				if (isExists) return;
				buttonMeta.tools.unshift({
					name: "select",
					title: addMeta.title,
					icon: "fas fa-expand",
				});
			});
		});
	}

	static _addBoxSelectSupport_measure () {
		UtilLibWrapper.addPatch(
			"TemplateLayer.layerOptions",
			this._lw_TemplateLayer_layerOptions,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
		);

		UtilLibWrapper.addPatch(
			"TemplateLayer.prototype._onDeleteKey",
			this._lw_TemplateLayer_prototype__onDeleteKey,
			UtilLibWrapper.LIBWRAPPER_MODE_OVERRIDE,
		);

		UtilLibWrapper.addPatch(
			"MeasuredTemplate.prototype.refresh",
			this._lw_MeasuredTemplate_prototype_refresh,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
		);
	}

	static _lw_TemplateLayer_layerOptions (fn, ...args) {
		const out = fn(...args);
		out.controllableObjects = true;
		return out;
	}

	static _lw_TemplateLayer_prototype__onDeleteKey (fn, ...args) {
		return Patcher_SceneControls._placeablesLayer_onDeleteKey_controlledOrHover.bind(this)(...args);
	}

	static _lw_MeasuredTemplate_prototype_refresh (fn, ...args) {
		const out = fn(...args);
		this.controlIcon.border.visible = this.hover || this.controlled;
		return out;
	}

	static _addBoxSelectSupport_lighting () {
		UtilLibWrapper.addPatch(
			"LightingLayer.layerOptions",
			this._lw_LightingLayer_layerOptions,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
		);

		UtilLibWrapper.addPatch(
			"LightingLayer.prototype._onDeleteKey",
			this._lw_LightingLayer_prototype__onDeleteKey,
			UtilLibWrapper.LIBWRAPPER_MODE_OVERRIDE,
		);

		UtilLibWrapper.addPatch(
			"AmbientLight.prototype.refreshControl",
			this._lw_AmbientLight_prototype_refreshControl,
		);

		// region Avoid crashes on moving multiple lights
		// See alternate solution/original report here:
		//   - https://github.com/KayelGee/select-tool-everywhere/issues/5
		//   - https://github.com/KayelGee/select-tool-everywhere/pull/6
		// Repro:
		//   - create scene with walls, many lights, some actors with vision
		//   - remove framerate limit
		//   - box-select lights and move them around

		UtilLibWrapper.addPatch(
			"PointSource.prototype.destroy",
			this._lw_PointSource_prototype_destroy,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
		);

		UtilLibWrapper.addPatch(
			"LightSource.prototype.drawMeshes",
			this._lw_LightSource_prototype_drawMeshes,
			UtilLibWrapper.LIBWRAPPER_MODE_MIXED,
		);

		// endregion
	}

	static _lw_LightingLayer_layerOptions (fn, ...args) {
		const out = fn(...args);
		out.controllableObjects = true;
		return out;
	}

	static _lw_LightingLayer_prototype__onDeleteKey (...args) {
		return Patcher_SceneControls._placeablesLayer_onDeleteKey_controlledOrHover.bind(this)(...args);
	}

	static _lw_AmbientLight_prototype_refreshControl (fn, ...args) {
		const out = fn(...args);
		this.controlIcon.border.visible = this.hover || this.controlled;
		return out;
	}

	static _lw_PointSource_prototype_destroy (fn, ...args) {
		this._meshesDestroyed = true;
		return fn(...args);
	}

	static _lw_LightSource_prototype_drawMeshes (fn, ...args) {
		if (this._meshesDestroyed) return {};
		return fn(...args);
	}

	static _addBoxSelectSupport_sounds () {
		UtilLibWrapper.addPatch(
			"SoundsLayer.layerOptions",
			this._lw_SoundsLayer_layerOptions,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
		);

		UtilLibWrapper.addPatch(
			"SoundsLayer.prototype._onDeleteKey",
			this._lw_SoundsLayer_prototype__onDeleteKey,
			UtilLibWrapper.LIBWRAPPER_MODE_OVERRIDE,
		);

		UtilLibWrapper.addPatch(
			"AmbientSound.prototype.refreshControl",
			this._lw_AmbientSound_prototype_refreshControl,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
		);
	}

	static _lw_SoundsLayer_layerOptions (fn, ...args) {
		const out = fn(...args);
		out.controllableObjects = true;
		return out;
	}

	static _lw_SoundsLayer_prototype__onDeleteKey (...args) {
		return Patcher_SceneControls._placeablesLayer_onDeleteKey_controlledOrHover.bind(this)(...args);
	}

	static _lw_AmbientSound_prototype_refreshControl (fn, ...args) {
		const out = fn(...args);
		this.controlIcon.border.visible = this.hover || this.controlled;
		return out;
	}

	static _addBoxSelectSupport_notes () {
		UtilLibWrapper.addPatch(
			"NotesLayer.layerOptions",
			this._lw_NotesLayer_layerOptions,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
		);

		UtilLibWrapper.addPatch(
			"NotesLayer.prototype._onDeleteKey",
			this._lw_NotesLayer_prototype__onDeleteKey,
			UtilLibWrapper.LIBWRAPPER_MODE_OVERRIDE,
		);

		UtilLibWrapper.addPatch(
			"Note.prototype.refresh",
			this._lw_Note_prototype_refresh,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
		);
	}

	static _lw_NotesLayer_layerOptions (fn, ...args) {
		const out = fn(...args);
		out.controllableObjects = true;
		return out;
	}

	static _lw_NotesLayer_prototype__onDeleteKey (...args) {
		return Patcher_SceneControls._placeablesLayer_onDeleteKey_controlledOrHover.bind(this)(...args);
	}

	static _lw_Note_prototype_refresh (fn, ...args) {
		const out = fn(...args);
		this.controlIcon.border.visible = this.hover || this.controlled;
		return out;
	}

	/** Based on `PlaceablesLayer._onDeleteKey` */
	static _placeablesLayer_onDeleteKey_controlledOrHover = async function (evt) {
		// Identify objects which are candidates for deletion
		// If there are no controlled objects, look for hovered objects instead
		let objects = this.options.controllableObjects && this.controlled?.length
			? this.controlled
			: (this.hover ? [this.hover] : []);
		if (!objects.length) return;

		// Restrict to objects which can be deleted
		const ids = objects.reduce((ids, o) => {
			if (o.document.locked || !o.document.canUserModify(game.user, "delete")) return ids;
			ids.push(o.id);
			return ids;
		}, []);
		if (ids.length) return canvas.scene.deleteEmbeddedDocuments(this.constructor.documentName, ids);
	};
}

export {Patcher_SceneControls};
