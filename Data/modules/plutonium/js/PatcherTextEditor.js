import {UtilLibWrapper} from "./PatcherLibWrapper.js";
import {Config} from "./Config.js";
import {ChooseImporter} from "./ChooseImporter.js";
import {LGT} from "./Util.js";
import {UtilApplications} from "./UtilApplications.js";
import {UtilEvents} from "./UtilEvents.js";
import {PopoutSheet} from "./PopoutSheet.js";
import {UtilDataConverter} from "./UtilDataConverter.js";
import {UtilImporter} from "./UtilImporter.js";

class Patcher_TextEditor {
	static prePreInit () {
		// Needs to be bound early as it is an unchangeable global handler
		this._prePreInit_contentLinks();
		this._prePreInit_createContentLink();
		this._prePreInit_enrichers();
	}

	static _prePreInit_contentLinks () {
		try {
			this._prePreInit_contentLinks_();
		} catch (e) {
			Config.handleFailedInitConfigApplication("text", "isAutoRollActorItemTags");
			Config.handleFailedInitConfigApplication("text", "isJumpToFolderTags", e);
		}
	}

	static _prePreInit_contentLinks_ () {
		UtilLibWrapper.addPatch(
			"TextEditor._onClickContentLink",
			this._lw_TextEditor__onClickContentLink,
			UtilLibWrapper.LIBWRAPPER_MODE_MIXED,
		);
	}

	static _lw_TextEditor__onClickContentLink (fn, ...args) {
		const [evt, ...rest] = args;

		evt.preventDefault();

		if (!evt.currentTarget.dataset.uuid) return fn(...args);

		// Avoid making this async, as the `currentTarget` of the event will change while we `await`
		const doc = Patcher_TextEditor._fromUuidSyncSafe(evt);
		if (!doc) return fn(evt, ...rest);

		if (doc instanceof Folder) {
			if (Patcher_TextEditor._handleContentLinkClick_folder(evt, doc)) return;
			return fn(evt, ...rest);
		}

		if (doc instanceof Item && doc.parent && doc.parent instanceof Actor) {
			if (Patcher_TextEditor._handleContentLinkClick_withParentActor(evt, doc)) return;
			return fn(evt, ...rest);
		}

		return fn(evt, ...rest);
	}

	static _fromUuidSyncSafe (evt) {
		try {
			return fromUuidSync(evt.currentTarget.dataset.uuid);
		} catch (e) {
			return null;
		}
	}

	static _handleContentLinkClick_folder (evt, doc) {
		if (!Config.get("text", "isJumpToFolderTags")) return false;

		if (evt?.shiftKey) return false;

		if (doc.ownership < CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) {
			ui.notifications.warn(`You do not have sufficient ownership to view this Folder.`);
			return true;
		}

		const sidebarTabName = CONFIG[doc.type]?.documentClass?.metadata?.collection;
		if (!sidebarTabName) return false;

		(async () => {
			await ui.sidebar.activateTab(sidebarTabName);

			const sidebarTab = ui.sidebar.tabs[sidebarTabName];
			const $eleFolder = sidebarTab.element.find(`[data-folder-id="${doc.id}"]`);

			if (!doc.expanded) {
				// region Based on `SidebarDirectory._toggleFolder`
				game.folders._expanded[doc.id] = true;

				$eleFolder.removeClass("collapsed");

				// Resize container
				if (sidebarTab.popOut) sidebarTab.setPosition();
				// endregion
			}

			$eleFolder[0].scrollIntoView({block: "center"});

			// Briefly make the folder glow
			$eleFolder.addClass("jlnk__folder-pulse-1s");
			setTimeout(() => $eleFolder.removeClass("jlnk__folder-pulse-1s"), 1000);
		})()
			.then(null);

		return true;
	}

	static _handleContentLinkClick_withParentActor (evt, doc) {
		if (!Config.get("text", "isAutoRollActorItemTags")) return false;

		if (evt?.shiftKey) return false;

		if (doc.parent.ownership < CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) {
			ui.notifications.warn(`You do not have sufficient ownership to view this ${doc.parent.documentName}.`);
			return true;
		}

		if (doc.ownership < CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) {
			ui.notifications.warn(`You do not have sufficient ownership to view this ${doc.documentName}.`);
			return true;
		}

		doc.use();

		return true;
	}

	static _prePreInit_createContentLink () {
		try {
			this._prePreInit_createContentLink_();
		} catch (e) {
			console.error(...LGT, e);
		}
	}

	static _prePreInit_createContentLink_ () {
		UtilLibWrapper.addPatch(
			"TextEditor._createContentLink",
			this._lw_TextEditor__createContentLink,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
		);
	}

	// FIXME(v12) presumably this will stop being sync-able in v12; update it
	static _lw_TextEditor__createContentLink (fn, ...args) {
		const link = fn(...args);
		if (!Config.get("text", "isShowLinkParent")) return link;

		const [, {relativeTo} = {}] = args;

		if (link instanceof Promise) {
			return link
				.then(async link => {
					const uuid = Patcher_TextEditor.ParentChildEntity.getValidUuid(link);
					if (!uuid) return link;
					const doc = await fromUuid(uuid, relativeTo);
					Patcher_TextEditor.ParentChildEntity.mutLink(link, doc);
					return link;
				});
		}

		const uuid = Patcher_TextEditor.ParentChildEntity.getValidUuid(link);
		if (!uuid) return link;

		// Silently fail on missing UUIDs
		let doc;
		try {
			doc = fromUuidSync(uuid, relativeTo);
		} catch (e) {
			return link;
		}

		Patcher_TextEditor.ParentChildEntity.mutLink(link, doc);
		return link;
	}

	// TODO(v12) Remove
	static _SYNC_ENRICHERS = [];

	static _prePreInit_enrichers () {
		CONFIG.TextEditor.enrichers.push(
			Patcher_TextEditor.JournalEmbed.getEnricher(),
			Patcher_TextEditor.ContentLoader.getEnricher(),
		);

		// TODO(v12) Remove
		this._SYNC_ENRICHERS = [
			Patcher_TextEditor.ContentLoader.getEnricher(),
		];

		UtilEvents.registerDocumentHandler({
			eventType: "click",
			selector: `.jemb__btn-toggle`,
			fnEvent: Patcher_TextEditor.JournalEmbed.handleToggleClick.bind(Patcher_TextEditor.JournalEmbed),
		});

		UtilEvents.registerDocumentHandler({
			eventType: "click",
			selector: `.jlnk__entity-link`,
			fnEvent: Patcher_TextEditor.ContentLoader.handleClick.bind(Patcher_TextEditor.JournalEmbed),
		});

		Patcher_TextEditor.ContentDragDrop.init();

		// region TODO(v12) Required until `TextEditor.enrichHTML` becomes `async` only
		UtilLibWrapper.addPatch(
			"TextEditor.enrichHTML",
			this._lw_TextEditor_enrichHTML,
			UtilLibWrapper.LIBWRAPPER_MODE_WRAPPER,
		);
		// endregion
	}

	static _lw_TextEditor_enrichHTML (fn, ...args) {
		let out = fn(...args);
		if (!out?.length) return out;

		const [, options] = args;

		// If `async`, we have already applied our enrichers
		// FIXME(v12) this will break when async becomes the default
		if (options?.async) return out;

		// region Based on original method
		// Create the HTML element
		const html = document.createElement("div");
		html.innerHTML = String(out || "");

		let updateTextArray = true;
		let text = [];
		const fns = [];

		for (const config of Patcher_TextEditor._SYNC_ENRICHERS) {
			fns.push(this._applyCustomEnrichers.bind(this, config.pattern, config.enricher));
		}

		const enrich = (fn, update) => {
			if (update) text = this._getTextNodes(html);
			return fn(text, options);
		};

		for (const fn of fns) {
			updateTextArray = enrich(fn, updateTextArray);
		}

		return html.innerHTML;
		// endregion
	}
}

Patcher_TextEditor.Enricher = class {
	/**
	 * @return {RegExp}
	 */
	static get _RE () { throw new Error("Unimplemented!"); }

	// TODO(v12) enrichers will be assumed to be `async` by default, so we can convert this to `_pEnrich`
	static _enrich (match, opts) { throw new Error("Unimplemented!"); }

	static _getEntityPermissions (entity) {
		if (game.user.isGM) return CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
		return entity.permission;
	}

	static _getEntity (collection, entityNameOrId) {
		// Match either on ID or by name
		let entity = null;
		if (/^[a-zA-Z0-9]{16}$/.test(entityNameOrId)) entity = collection.get(entityNameOrId);
		if (!entity) entity = (collection.contents || collection.entries).find(e => e.name === entityNameOrId);
		return entity;
	}

	static getEnricher () {
		return {
			pattern: this._RE,
			enricher: this._enrich.bind(this),
		};
	}
};

Patcher_TextEditor.JournalEmbed = class extends Patcher_TextEditor.Enricher {
	// Note that this catches _any_ embedded UUID; we then filter to journal pages in the enricher
	// Wrap the `UUID` part in parentheses so we can easily pass the match to `_createContentLink`
	static get _RE () { return /@Embed(UUID)\[([^#\]]+)(?:#([^\]]+))?](?:{([^}]+)})?/g; }

	static async _enrich (match, enrichOpts, ...args) {
		const [originalText, , target] = match;

		const doc = await fromUuid(target, enrichOpts?.relativeTo);
		if (doc?.documentName !== "JournalEntryPage" || !doc?.parent) return originalText;

		const lnkPage = await TextEditor._createContentLink(match, enrichOpts);

		if (
			this._getEntityPermissions(doc) < CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER
			|| this._getEntityPermissions(doc).parent < CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER
		) return lnkPage;

		const isAutoExpand = Config.get("journalEntries", "isAutoExpandJournalEmbeds");
		switch (doc.type) {
			case "text": {
				// Avoid infinite loops
				const isTooDeep = enrichOpts.depth === Patcher_TextEditor.JournalEmbed._MAX_RECURSION_DEPTH;
				const subContent = isTooDeep
					? doc.text.content
					: await TextEditor.enrichHTML(doc.text.content, {...enrichOpts, depth: enrichOpts.depth + 1});

				return e_({
					outer: `<div class="w-100 ve-flex-col">
						<div class="ve-flex-v-center mb-1 jemb__wrp-lnk">${lnkPage.outerHTML}${this._getBtnHtmlToggle(isAutoExpand)}</div>
						${isTooDeep ? `<div class="mb-1 bold veapp__msg-error">Warning: too many recursive embeds! Have you made an infinite loop?</div>` : ""}
						<div class="w-100 jemb__wrp-content ${isAutoExpand ? "" : "ve-hidden"}">${subContent}</div>
					</div>`,
				});
			}

			case "image": {
				return e_({
					outer: `<div class="w-100 ve-flex-col">
						<div class="ve-flex-v-center mb-1 jemb__wrp-lnk">${lnkPage.outerHTML}${this._getBtnHtmlToggle(isAutoExpand)}</div>
						<div class="ve-flex-vh-center jemb__wrp-content ${isAutoExpand ? "" : "ve-hidden"}"><a target="_blank w-100" href="${doc.src}"><img src="${doc.src}" class="jemb__img"></a></div>
					</div>`,
				});
			}

			case "video":
			case "pdf": {
				// These are both pretty rough to implement/maintain, so kick the can for now.
				// If there's a demand for it, either:
				//   - generalize a sub-sheet renderer (see e.g. `renderSubSheet` in Monk's Enhanced Journal for how much
				//     of a pain this is)
				//   - take a minimal amount of relevant layout/logic from each sheet type (see e.g.
				//     `resources/app/templates/journal/page-*-view.html` and
				//     `resources/app/client/apps/forms/journal-sheet.js` in Foundry source) and duplicate it here (which is
				//     a hopelessly brittle """solution""")
				// Ideally, we do neither, and Foundry improves their API to allow anyone to easily render a non-standard
				//   view of a sheet...
				return lnkPage;
			}

			default: {
				return lnkPage;
			}
		}
	}

	static handleToggleClick (event) {
		const $btn = $(event.currentTarget);
		const isExpanded = $btn.attr("data-plut-is-expanded") === "1";

		if (event.shiftKey) {
			event.preventDefault();

			const $editor = $btn.closest(`.editor`);
			$editor.find(`button[data-plut-is-expanded]`).each((i, e) => this._handleExpandCollapse($(e), isExpanded));
			return;
		}

		this._handleExpandCollapse($btn, isExpanded);
	}

	static _handleExpandCollapse ($btn, isExpanded) {
		const $wrp = $btn.parent().next();
		$wrp.toggleClass("ve-hidden", isExpanded);
		$btn
			.attr("data-plut-is-expanded", isExpanded ? "0" : "1")
			.html(isExpanded ? `<i class="fa fa-caret-square-left"></i>` : `<i class="fa fa-caret-square-down"></i>`)
			.title(`${isExpanded ? `Expand` : `Collapse`} Journal Entry (SHIFT for All Entries)`);
	}

	static _getBtnHtmlToggle (isAutoExpand) {
		return `<button class="btn btn-xxs btn-5et btn-default ve-flex-vh-center mx-1 jemb__btn-toggle" data-plut-is-expanded="${isAutoExpand ? 1 : 0}" title="${isAutoExpand ? "Collapse" : "Expand"} Journal Entry (SHIFT for All Entries)" type="button">${isAutoExpand ? `<i class="fa fa-caret-square-down"></i>` : `<i class="fa fa-caret-square-left"></i>`}</button>`;
	}
};
Patcher_TextEditor.JournalEmbed._MAX_RECURSION_DEPTH = 69; // Arbitrary number of steps

Patcher_TextEditor.ContentLoader = class extends Patcher_TextEditor.Enricher {
	static get _RE () { return /@([a-z][a-zA-Z]+)\[([^\]]+)](?:{([^}]+)})?/g; }

	static _enrich (match, opts) {
		const [fullText, tag, pipeParts, displayText] = match;

		const importerMeta = ChooseImporter.getImporterClassMeta(tag);
		const name = (Renderer.splitTagByPipe(pipeParts)[0] || "");

		if (!importerMeta) {
			return e_({
				tag: "a",
				clazz: "entity-link broken",
				title: `Unknown Tag "${tag.qq()}"`,
				children: [
					e_({
						tag: "i",
						clazz: "fas fa-unlink",
					}),
					` ${displayText || name}`,
				],
			});
		}

		const {Class: Importer, isViewOnly} = importerMeta;

		const {displayText: displayTextPipe, page, pageHover, source, hash, preloadId, hashPreEncoded, hashHover, hashPreEncodedHover, subhashes, subhashesHover} = Renderer.utils.getTagMeta(`@${tag}`, pipeParts);

		const attrsHover = {
			"data-plut-hover-page": page,
			"data-plut-hover-page-hover": pageHover || undefined,
			"data-plut-hover-source": source,
			"data-plut-hover-hash": hash,
			"data-plut-hover-tag": tag,
			"data-plut-hover-preload-id": preloadId || undefined,
			"data-plut-hover-hash-pre-encoded": hashPreEncoded || undefined,
			"data-plut-hover-hash-hover": hashHover || undefined,
			"data-plut-hover-hash-pre-encoded-hover": hashPreEncodedHover || undefined,
			"data-plut-hover-subhashes": subhashes?.length ? JSON.stringify(subhashes) : undefined,
			"data-plut-hover-subhashes-hover": subhashesHover?.length ? JSON.stringify(subhashesHover) : undefined,
			"data-plut-hover-is-faux-page": isViewOnly ? true : undefined,
			"data-plut-hover": Config.get("text", "isEnableHoverForLinkTags") || isViewOnly ? true : undefined,
		};

		if (isViewOnly) {
			return e_({
				tag: "span",
				clazz: "help help--hover",
				attrs: {
					...attrsHover,
				},
				html: `${StrUtil.qq(displayTextPipe || displayText || name)}`,
			});
		}

		const config = CONFIG[Importer.FOLDER_TYPE];

		// (Should never occur)
		if (!config) {
			return e_({
				tag: "a",
				clazz: "entity-link broken",
				title: `No CONFIG found for type "${Importer.FOLDER_TYPE}"\u2014this is a bug!`,
				children: [
					e_({
						tag: "i",
						clazz: "fas fa-unlink",
					}),
					` ${displayText || name}`,
				],
			});
		}

		return e_({
			tag: "a",
			clazz: "jlnk__entity-link",
			attrs: {
				"draggable": true,
				...attrsHover,
				"data-plut-rich-link": true,
				"data-plut-rich-link-entity-type": Importer.FOLDER_TYPE,
				// The "@" is stripped to avoid issues when recursively rendering embedded text
				"data-plut-rich-link-original-text": fullText.slice(1).qq(),
			},
			children: [
				e_({
					tag: "i",
					clazz: `fas ${config.sidebarIcon}`,
				}),
				` ${displayTextPipe || displayText || name}`,
			],
		});
	}

	static handleClick (evt) {
		evt.stopPropagation();
		evt.preventDefault();

		// The "@" is stripped to avoid issues when recursively rendering embedded text, so add it back here
		const originalText = `@${evt.currentTarget.dataset.plutRichLinkOriginalText}`;

		const tag = evt.currentTarget.dataset.plutHoverTag;
		const page = evt.currentTarget.dataset.plutHoverPage;
		const source = evt.currentTarget.dataset.plutHoverSource;
		let hash = evt.currentTarget.dataset.plutHoverHash;
		const hashPreEncoded = !!evt.currentTarget.dataset.plutHoverHashPreEncoded;
		const pageHover = evt.currentTarget.dataset.plutHoverPageHover || page;
		let hashHover = evt.currentTarget.dataset.plutHoverHashHover;
		const hashPreEncodedHover = !!evt.currentTarget.dataset.plutHoverHashPreEncodedHover;
		const subhashesHover = evt.currentTarget.dataset.plutHoverSubhashesHover;

		if (!pageHover || !source || !hash) return;

		const importer = ChooseImporter.getImporter(tag) || ChooseImporter.getImporter(page);

		if (!hashPreEncoded) hash = UrlUtil.encodeForHash(hash);
		if (hashHover && !hashPreEncodedHover) hashHover = UrlUtil.encodeForHash(hashHover);
		if (!hashHover) hashHover = hash;

		if (subhashesHover) {
			const parsed = JSON.parse(subhashesHover);
			hashHover += Renderer.utils.getLinkSubhashString(parsed);
		}

		const isPermanent = !!evt.shiftKey
			&& (
				(game.user.can("ACTOR_CREATE") && importer.gameProp === "actors")
				|| (game.user.can("ITEM_CREATE") && importer.gameProp === "items")
				|| (game.user.can("JOURNAL_CREATE") && importer.gameProp === "journal")
				|| (game.user.can("ROLL_TABLE_CREATE") && importer.gameProp === "tables")
			);
		const isPopout = evt.view !== window && Config.get("ui", "isEnableSubPopouts");

		Renderer.hover.pCacheAndGet(pageHover, source, hashHover)
			.then(ent => {
				const msgErrorBase = `Could not load content for tag "${originalText}"!`;

				if (!ent) {
					const msgError = `${msgErrorBase} Could not find matching entity.`;
					console.error(...LGT, msgError);
					return ui.notifications.error(msgError);
				}

				importer.pImportEntry(
					ent,
					{
						isTemp: !isPermanent,
						defaultOwnership: !isPermanent
							? UtilDataConverter.getTempDocumentDefaultOwnership({documentType: importer.constructor.FOLDER_TYPE})
							: undefined,
					},
				)
					.then(async importSummary => {
						if (isPermanent) UtilApplications.doShowImportedNotification(importSummary);

						const renderMetas = UtilImporter.pForceRenderImportedDocSheets(importSummary);

						if (!isPopout) return;
						renderMetas.filter(Boolean).forEach(({app, data}) => PopoutSheet.doPopout(app, data));
					})
					.catch(err => {
						console.error(...LGT, err);
						ui.notifications.error(`${msgErrorBase} ${VeCt.STR_SEE_CONSOLE}`);
					});
			});
	}
};

Patcher_TextEditor.ParentChildEntity = class {
	static getValidUuid (link) {
		const uuid = link?.dataset?.uuid;
		if (!uuid) return null;

		const parts = uuid.split(".");
		if (parts.length !== 4) return null;

		return uuid;
	}

	static mutLink (link, doc) {
		if (!doc?.parent) return;

		const configParent = CONFIG[doc.parent.documentName];
		if (!configParent) return;

		link.prepend(" ");

		link.prepend(e_({
			tag: "i",
			clazz: configParent.sidebarIcon,
		}));

		const textNode = [...link.childNodes].last();
		textNode.textContent = `${doc.parent.name} / ${textNode.textContent}`;
	}
};

/** Drag-and-drop for @tag links. */
Patcher_TextEditor.ContentDragDrop = class {
	static init () {
		UtilLibWrapper.addPatch(
			"ActorSheet.prototype._onDragStart",
			this._lw_ActorSheet_prototype__onDragStart,
			UtilLibWrapper.LIBWRAPPER_MODE_MIXED,
		);

		UtilLibWrapper.addPatch(
			"TextEditor.getContentLink",
			this._lw_TextEditor_getContentLink,
			UtilLibWrapper.LIBWRAPPER_MODE_MIXED,
		);
	}

	static _lw_ActorSheet_prototype__onDragStart (fn, ...args) {
		const evt = args[0];
		if (evt.target.dataset.plutRichLink) return;
		return fn(...args);
	}

	static async _lw_TextEditor_getContentLink (fn, ...args) {
		const [data] = args;
		if (!Object.keys(data).length) return fn(...args);

		// region Handle drag-drop from importer lists; render these as `@<tag>[...]`s
		if (data?.subType === UtilEvents.EVT_DATA_SUBTYPE__IMPORT) {
			return data.tag;
		}
		// endregion

		if (data?.subType !== UtilEvents.EVT_DATA_SUBTYPE__HOVER) return fn(...args);

		// The "@" is stripped to avoid issues when recursively rendering embedded text, so add it back here
		return `@${data.originalText}`;
	}
};

export {Patcher_TextEditor};
