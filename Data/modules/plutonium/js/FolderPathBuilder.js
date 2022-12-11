import {SharedConsts} from "../shared/SharedConsts.js";
import {GameStorage} from "./GameStorage.js";
import {UtilFolders} from "./UtilFolders.js";
import {UtilApplications} from "./UtilApplications.js";
import {Config} from "./Config.js";
import {UtilJournalEntries} from "./UtilJournalEntries.js";

class _FolderInfo {
	constructor (
		{
			displayName,
			folder,
		},
	) {
		this.displayName = displayName;
		this.folder = folder;
	}
}

class UtilFolderPathBuilder {
	static isJournalEntryNamer ({folderType}) {
		return Config.get("import", "isTreatJournalEntriesAsFolders") && folderType === "JournalEntry";
	}

	static async pGetCreateFolderIdMeta (
		{
			folderType,
			folderIdRoot = null,
			folderNames,
			sorting = "a",
			defaultOwnership = null,
			isFoldersOnly = false,
		},
	) {
		if (!folderType) throw new Error(`Missing "folderType" option!`);
		if (!folderNames.length || !folderType) return new FolderIdMeta();

		if (isFoldersOnly || !UtilFolderPathBuilder.isJournalEntryNamer({folderType})) {
			const folderId = await UtilFolders.pCreateFoldersGetId({folderType, folderIdRoot, folderNames, sorting});
			return new FolderIdMeta({folderId});
		}

		const [pathStringJournalEntry, ...pathStringsFolders] = [...folderNames].reverse();
		const folderId = await UtilFolders.pCreateFoldersGetId({folderType, folderIdRoot, folderNames: pathStringsFolders.reverse(), sorting});

		const parentDocumentId = await UtilJournalEntries.pGetCreateJournalEntryId({
			name: pathStringJournalEntry,
			folderId,
			defaultOwnership,
		});

		return new FolderIdMeta({folderId, parentDocumentId});
	}
}

class FolderIdMeta {
	constructor ({folderId = null, parentDocumentId = null} = {}) {
		this.folderId = folderId;
		this.parentDocumentId = parentDocumentId;
	}
}

/**
 * @mixin
 */
function MixinFolderPathBuilder (Cls) {
	class MixedFolderPathBuilder extends Cls {
		// region To be implemented
		_getFullFolderPathSpecKey () { throw new Error("Unimplemented!"); }
		getFolderPathMeta () { throw new Error("Unimplemented!"); }
		// endregion

		constructor (...args) {
			super(...args);
			this._folderPathSpec = [];
			this._defaultFolderPath = [];
			this._mxFolderPathBuilder_textOnlyMode = false;
		}

		get folderPathSpec () { return this._folderPathSpec; }

		async _pInit_folderPathSpec () {
			this._folderPathSpec = MiscUtil.get((await GameStorage.pGetClient(this._getFullFolderPathSpecKey())), "path");
			if (this._folderPathSpec != null) return;

			const folderPathMeta = this.getFolderPathMeta();
			const defaultSpec = (this._defaultFolderPath || [])
				.map(it => (this._mxFolderPathBuilder_textOnlyMode ? FolderPathBuilderRowTextOnly : FolderPathBuilderRow).getStateFromDefault_(it, {folderPathMeta}));
			await this.pSetFolderPathSpec(defaultSpec);
		}

		async pSetFolderPathSpec (folderPathSpec) {
			this._folderPathSpec = folderPathSpec;
			return GameStorage.pSetClient(this._getFullFolderPathSpecKey(), {path: this._folderPathSpec});
		}

		async pHandleEditFolderPathClick () {
			await this._pInit_folderPathSpec();
			const builderApp = new FolderPathBuilderApp({fpApp: this, folderType: this.constructor.FOLDER_TYPE});
			builderApp.render(true);
		}

		async _pGetCreateFoldersGetIdFromObject ({folderType, obj, sorting = "a", defaultOwnership = null, isFoldersOnly = false}) {
			if (!this._folderPathSpec.length || !folderType) return new FolderIdMeta();

			const pathStrings = this._getFolderPathStrings({obj});

			return UtilFolderPathBuilder.pGetCreateFolderIdMeta({
				folderType,
				folderNames: pathStrings,
				sorting,
				defaultOwnership,
				isFoldersOnly,
			});
		}

		_getFolderPathStrings ({obj}) {
			return FolderPathBuilder.getFolderPathStrings({obj, folderPathSpec: this._folderPathSpec, folderPathMeta: this.getFolderPathMeta()});
		}
	}
	return MixedFolderPathBuilder;
}

class FolderPathBuilder extends BaseComponent {
	constructor ({fpApp = null, defaultFolderPathSpec = null, fnOnRowKeydown = null, folderType}) {
		super();
		this._fpApp = fpApp;
		this._ClsRow = fpApp ? FolderPathBuilderRow : FolderPathBuilderRowTextOnly;
		this._initialFolderPathSpec = FolderPathBuilder._getInitialFolderPathSpec({fpApp, ClsRow: this._ClsRow, defaultFolderPathSpec, fnOnRowKeydown});
		this._fnOnRowKeydown = fnOnRowKeydown;
		this._folderType = folderType;

		this._lock = new VeLock();
		this._childComps = [];
		this._$wrpRows = null;
	}

	static _getInitialFolderPathSpec ({fpApp, defaultFolderPathSpec, ClsRow, fnOnRowKeydown}) {
		if (defaultFolderPathSpec) {
			return defaultFolderPathSpec
				.map(it => ClsRow.getStateFromDefault_(it, {fnOnKeydown: fnOnRowKeydown}));
		}

		return fpApp ? MiscUtil.copy(fpApp.folderPathSpec) : [];
	}

	_getMaxDepth () {
		let out = CONST.FOLDER_MAX_DEPTH__ORIGINAL ?? CONST.FOLDER_MAX_DEPTH;
		if (UtilFolderPathBuilder.isJournalEntryNamer({folderType: this._folderType})) return out + 1;
		return out;
	}

	static _SEL_EXISTING_BASE_OPTION = `<option value="-1" selected>Select Existing...</option>`;

	static _$getSelExistingFolder (
		{
			folderType,
			fnOnAccept,
		},
	) {
		let folderMetas;
		const $selExisting = $(`<select class="w-80p input-xs form-control italic mr-1" title="Select Existing Folder Path">
			${this._SEL_EXISTING_BASE_OPTION}
		</select>`)
			.click(() => {
				folderMetas = game.folders.contents
					.filter(it => it.type === folderType)
					.map(folder => {
						const path = UtilApplications.getFolderPath(folder, {isAddTrailingSlash: true});
						return new _FolderInfo({
							displayName: `${path || ""}${folder.name}`,
							folder,
						});
					})
					.sort((a, b) => SortUtil.ascSortLower(a.displayName, b.displayName));

				$selExisting
					.removeClass("italic")
					.html(
						this._SEL_EXISTING_BASE_OPTION
						+ folderMetas
							.map((it, ix) => `<option value="${ix}">${it.displayName}</option>`)
							.join(""),
					);
			})
			.change(() => {
				const meta = folderMetas[$selExisting.val()];
				fnOnAccept(meta);
				$selExisting.val("-1").addClass("italic");
			})
			.blur(() => {
				$selExisting.val("-1").addClass("italic");
			});

		return $selExisting;
	}

	render ($parent) {
		$parent.empty();

		const pod = this.getPod();

		this._$wrpRows = $$`<div class="ve-flex-col w-100 h-100 overflow-y-auto relative"></div>`;
		this._childComps.forEach(it => it.render(this._$wrpRows, pod));
		this._render_checkAddEmptyMessage();

		const $selExisting = this.constructor._$getSelExistingFolder({
			folderType: this._folderType,
			fnOnAccept: folderInfo => {
				if (!folderInfo) return;
				const folders = [
					...UtilApplications.getFolderPathFolders(folderInfo.folder),
					folderInfo.folder,
				];

				this._removeAllRows();

				folders.forEach(fld => {
					this._render_addRow(pod, FolderPathBuilderRow.getStateFromFolder_(fld));
				});
			},
		});

		const $btnAdd = $(`<button class="btn btn-5et btn-xs"><span class="fas fa-fw fa-folder-plus"></span> Add Path Part</button>`)
			.click(() => {
				const maxDepth = this._getMaxDepth();
				if (this._childComps.length >= maxDepth) return ui.notifications.warn(`Foundry currently supports a maximum of ${Parser.numberToText(maxDepth)} levels of directory nesting. T-too deep!`);
				this._render_addRow(pod);
			});

		this._initialFolderPathSpec.forEach(state => this._render_addRow(pod, state));

		$$($parent)`
			<div class="w-100 split-v-center mb-1">
				<div>Folder Path:</div>
				<div class="ipt-group ve-flex-vh-center">
					${$selExisting}
					${$btnAdd}
				</div>
			</div>
			${this._$wrpRows}
		`;
	}

	_getFolderPathSpec () { return this._childComps.map(it => MiscUtil.copy(it._state)); }

	static getFolderPathStrings ({obj = null, folderPathSpec = null, folderPathMeta = null} = {}) {
		return folderPathSpec
			.filter(it => it.isFreeText ? it.text && it.text.trim() : it.selectedProp)
			.map(it => it.isFreeText ? it.text : folderPathMeta[it.selectedProp].getter(obj));
	}

	getFolderPathStrings ({obj = null, folderPathSpec = null, folderPathMeta = null} = {}) {
		folderPathSpec = folderPathSpec || this._getFolderPathSpec();
		folderPathMeta = folderPathMeta || (this._fpApp ? this._fpApp.getFolderPathMeta() : null);
		return this.constructor.getFolderPathStrings({obj, folderPathSpec, folderPathMeta});
	}

	async _render_updateParentPath () {
		if (!this._fpApp) return;

		await (this._lock.pLock());
		await this._fpApp.pSetFolderPathSpec(this._getFolderPathSpec());
		this._lock.unlock();
	}

	_render_addRow (pod, state) {
		const folderMeta = this._fpApp ? this._fpApp.getFolderPathMeta() : {};
		const comp = new this._ClsRow(folderMeta, {fnOnKeydown: this._fnOnRowKeydown, folderType: this._folderType});
		if (state) Object.assign(comp.__state, state);

		comp._addHookAll("state", () => this._render_updateParentPath());

		if (!this._childComps.length) this._$wrpRows.empty();

		this._childComps.push(comp);
		comp.render(this._$wrpRows, pod);
		this._render_updateJournalEntryNameDisplays();
		this._render_updateParentPath().then(null);
	}

	_swapRowPositions (ixA, ixB) {
		const a = this._childComps[ixA];
		this._childComps[ixA] = this._childComps[ixB];
		this._childComps[ixB] = a;

		this._childComps.forEach(it => it.$row.detach().appendTo(this._$wrpRows));
		this._render_updateJournalEntryNameDisplays();
		this._render_updateParentPath().then(null);
	}

	_removeRow (comp) {
		const ix = this._childComps.indexOf(comp);
		if (~ix) {
			this._childComps.splice(ix, 1);
			comp.$row.remove();
			this._render_updateParentPath().then(null);
		}

		this._render_updateJournalEntryNameDisplays();
		this._render_checkAddEmptyMessage();
	}

	_removeAllRows () {
		this._childComps.splice(0, this._childComps.length);
		this._render_updateParentPath().then(null);
		this._render_checkAddEmptyMessage();
	}

	_render_updateJournalEntryNameDisplays () {
		const isJournalEntryNamer = UtilFolderPathBuilder.isJournalEntryNamer({folderType: this._folderType});
		this._childComps.forEach((comp, i) => comp.isJournalEntryName = isJournalEntryNamer && i === this._childComps.length - 1);
	}

	_render_checkAddEmptyMessage () {
		if (!this._childComps.length) this._$wrpRows.append(`<div class="ve-flex-v-center w-100 my-1"><i>(Directory root)</i></div>`);
	}

	getPod () {
		const pod = super.getPod();
		pod.swapRowPositions = this._swapRowPositions.bind(this);
		pod.removeRow = this._removeRow.bind(this);
		pod.$getChildren = () => this._childComps.map(it => it.$row);
		return pod;
	}
}

class FolderPathBuilderRowTextOnly extends BaseComponent {
	constructor (folderMeta, {fnOnKeydown, folderType} = {}) {
		super();
		this._folderMeta = folderMeta;
		this._$row = null;
		this._fnOnKeydown = fnOnKeydown;
		this._folderType = folderType;
	}

	get $row () { return this._$row; }

	set isJournalEntryName (val) { this._state.isJournalEntryName = !!val; }

	_$getDispIsJournalEntry () {
		const $dispIsJournalEntry = $(`<div class="ve-muted ve-small italic help-subtle" title="Imported entities will be created as pages within a journal entry with this name. If you would prefer to have each page imported to its own journal entry with this name, click to open the Config, and disable the &quot;Treat Journal Entries as Folders&quot; option.">Journal Entry name</div>`)
			.click(evt => Config.pHandleButtonClick(evt, "journalEntries"));
		const hkIsJournalEntry = () => $dispIsJournalEntry.toggleVe(this._state.isJournalEntryName);
		this._addHookBase("isJournalEntryName", hkIsJournalEntry);
		hkIsJournalEntry();
		return $dispIsJournalEntry;
	}

	render ($parent, parent) {
		this._parent = parent;

		const $dispIsJournalEntry = this._$getDispIsJournalEntry();

		const $iptName = ComponentUiUtil.$getIptStr(this, "text").attr("type", "text").addClass("mr-2");
		if (this._fnOnKeydown) $iptName.keydown(evt => this._fnOnKeydown(evt));

		const $btnRemove = $(`<button class="btn btn-danger btn-xs"><span class="fas fa-fw fa-trash"></span></button>`)
			.click(() => {
				const {removeRow} = this._parent;
				removeRow(this);
			});

		this._$row = $$`<div class="ve-flex-v-center w-100 my-1 imp-folder__row">
			<div class="ve-flex-col w-100 min-w-0">
				${$dispIsJournalEntry}
				${$iptName}
			</div>
			${DragReorderUiUtil.$getDragPad2(() => this._$row, $parent, this._parent)}
			${$btnRemove}
		</div>`.appendTo($parent);
	}

	_getDefaultState () { return {...FolderPathBuilderRowTextOnly._DEFAULT_STATE}; }

	static getStateFromDefault_ (val, {...rest} = {}) {
		const comp = new FolderPathBuilderRowTextOnly({...rest});
		comp.__state.text = val;
		return comp.__state;
	}
}
FolderPathBuilderRowTextOnly._DEFAULT_STATE = {
	text: "",
	isFreeText: true,
	isJournalEntryName: false,
};

class FolderPathBuilderRow extends FolderPathBuilderRowTextOnly {
	render ($parent, parent) {
		this._parent = parent;

		const $dispIsJournalEntry = this._$getDispIsJournalEntry();

		const $btnToggleFreeText = ComponentUiUtil.$getBtnBool(this, "isFreeText", {$ele: $(`<button class="btn btn-xs mr-1 imp-folder__btn-mode">Custom</button>`)});

		const $iptName = ComponentUiUtil.$getIptStr(this, "text").attr("type", "text");
		if (this._fnOnKeydown) $iptName.keydown(evt => this._fnOnKeydown(evt));
		const $wrpFreeText = $$`<div class="ve-flex mr-1 w-100">${$iptName}</div>`;

		const folderMetaKeys = Object.keys(this._folderMeta)
			.sort((a, b) => SortUtil.ascSortLower(this._folderMeta[a].label, this._folderMeta[b].label));
		const $selProp = ComponentUiUtil.$getSelEnum(
			this,
			"selectedProp",
			{
				values: folderMetaKeys,
				isAllowNull: true,
				fnDisplay: (k) => this._folderMeta[k].label,
			},
		);
		const $wrpSelProp = $$`<div class="ve-flex mr-1 w-100">${$selProp}</div>`;

		const hookFreeText = () => {
			$wrpFreeText.toggleClass("ve-hidden", !this._state.isFreeText);
			$wrpSelProp.toggleClass("ve-hidden", this._state.isFreeText);
		};
		hookFreeText();
		this._addHookBase("isFreeText", hookFreeText);

		const $btnRemove = $(`<button class="btn btn-danger btn-xs"><span class="fas fa-fw fa-trash"></span></button>`)
			.click(() => {
				const {removeRow} = this._parent;
				removeRow(this);
			});

		this._$row = $$`<div class="ve-flex-v-center w-100 my-1 imp-folder__row">
			${$btnToggleFreeText}
			<div class="ve-flex-col">
				${$dispIsJournalEntry}
				${$wrpFreeText}
				${$wrpSelProp}
			</div>
			${DragReorderUiUtil.$getDragPad2(() => this._$row, $parent, this._parent)}
			${$btnRemove}
		</div>`.appendTo($parent);
	}

	_getDefaultState () { return {...FolderPathBuilderRow._DEFAULT_STATE}; }

	static getStateFromDefault_ (val, {folderPathMeta, ...rest} = {}) {
		const comp = new FolderPathBuilderRow({...rest});
		if (val?.metaKey) {
			if (!folderPathMeta?.[val.metaKey]) throw new Error(`Folder path meta key "${val.metaKey}" was not found in the available values!`);
			comp.__state.isFreeText = false;
			comp.__state.selectedProp = val.metaKey;
		} else {
			comp.__state.text = val;
		}
		return comp.__state;
	}

	static getStateFromFolder_ (fld) {
		return {
			...FolderPathBuilderRow._DEFAULT_STATE,
			text: fld.name,
			isFreeText: true,
		};
	}
}
FolderPathBuilderRow._DEFAULT_STATE = {
	isFreeText: true,
	text: "",
	selectedProp: null,
};

/**
 * A window-based wrapper around the full component.
 */
class FolderPathBuilderApp extends Application {
	constructor ({fpApp, folderType}) {
		super({
			width: 480,
			height: 480,
			title: "Edit Folder Path",
			template: `${SharedConsts.MODULE_LOCATION}/template/FolderPathBuilder.hbs`,
			resizable: true,
		});
		this._comp = new FolderPathBuilder({fpApp, folderType});
	}

	activateListeners ($html) {
		super.activateListeners($html);
		this._comp.render($html);
	}
}

export {UtilFolderPathBuilder, MixinFolderPathBuilder, FolderPathBuilder, FolderIdMeta};
