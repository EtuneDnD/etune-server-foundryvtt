import {SharedConsts} from "../shared/SharedConsts.js";
import {Consts} from "./Consts.js";
import {UtilApplications} from "./UtilApplications.js";

class Patcher_JournalSheet {
	static init () {
		DocumentSheetConfig.registerSheet(JournalEntryPage, SharedConsts.MODULE_NAME, JournalUrlPageSheet, {
			// Register as a known type, or our registration will be ignored
			types: ["text"],
			makeDefault: false,
			label: "Embedded URL",
		});

		DocumentSheetConfig.registerSheet(JournalEntry, SharedConsts.MODULE_NAME, JournalSheetUrl, {
			makeDefault: false,
			label: "Embedded URL",
		});
	}
}

/**
 * Note: this "page" version does not persist between closes/page changes, due to the way Foundry's Journal Entry sheet
 * renders pages--it does so by rendering the page and scooping out the HTML, which breaks
 */
class JournalUrlPageSheet extends JournalPageSheet {
	get template () {
		return `${SharedConsts.MODULE_LOCATION}/mod-template/journal/page-url-${this.isEditable ? "edit" : "view"}.hbs`;
	}

	activateListeners ($html) {
		$html
			// Expand the "article" wrapper to full-height, and defer to the page's scrolling behaviour. This allows us to
			//   nicely embed e.g. YouTube videos (https://www.youtube.com/embed/dQw4w9WgXcQ).
			// Note that this may not be optimal when in multi-page view in the journal--we could instead consider setting
			//   a minimum height on the content (e.g. `min-height: 40vh`)..?
			.parent().addClass("w-100 h-100 overflow-y-hidden");
	}
}

class JournalSheetUrl extends DocumentSheet {
	_lastRenderedUrl = null;

	static get defaultOptions () {
		return {
			...super.defaultOptions,
			template: `${SharedConsts.MODULE_LOCATION}/mod-template/journal/sheet.hbs`,
			width: 960,
			height: 800,
			resizable: true,
			submitOnChange: true,
			submitOnClose: true,
			closeOnSubmit: false,
		};
	}

	get title () { return this.document.name; }

	async close (...args) {
		if (this.object && this.object.getFlag(SharedConsts.MODULE_NAME, Consts.FLAG_IFRAME_URL)) {
			this.element.hideVe();
			// Flag as "not rendered" so the directory click manager (`_onClickEntityName`) doesn't skip opening the sheet
			//   on next click.
			this._state = Application.RENDER_STATES.CLOSED;
			return;
		}

		return super.close(...args);
	}

	render (...args) {
		const url = this.object ? this.object.getFlag(SharedConsts.MODULE_NAME, Consts.FLAG_IFRAME_URL) : null;

		if (
			url === this._lastRenderedUrl
			&& this.element && this.element.length // re-open the existing render rather than creating a new one
		) {
			this.element.showVe();
			this.maximize();
			UtilApplications.bringToFront(this);
			this._state = Application.RENDER_STATES.RENDERED;
			return;
		}

		this._lastRenderedUrl = url;

		return super.render(...args);
	}
}

export {Patcher_JournalSheet};
