import {DataConverter} from "./DataConverter.js";
import {Config} from "./Config.js";
import {UtilDataConverter} from "./UtilDataConverter.js";

class DataConverterJournal extends DataConverter {
	static get _CONFIG_GROUP () { throw new Error(`Unimplemented!`); }

	static _mutOwnership (obj, opts) {
		if (opts.defaultOwnership != null) obj.ownership = {default: opts.defaultOwnership};
		else if (opts.isAddOwnership) obj.ownership = {default: Config.get(this._CONFIG_GROUP, "ownership")};
	}

	static _getPages ({name, content, img, flags}) {
		const out = [
			content
				? {
					name,
					type: "text",
					text: {
						format: 1,
						content,
					},
				}
				: null,
			img
				? {
					name: `${name} (Image)`,
					type: "image",
					src: img,
				}
				: null,
		].filter(Boolean);

		out.forEach(page => {
			page.ownership = {default: CONST.DOCUMENT_OWNERSHIP_LEVELS.INHERIT};
			page.flags = flags ? MiscUtil.copy(flags) : {};
		});

		return out;
	}

	static async _pGetWithJournalDescriptionPlugins (pFn) {
		return UtilDataConverter.pGetWithDescriptionPlugins(async () => {
			const renderer = Renderer.get().setPartPageExpandCollapseDisabled(true);
			const out = await pFn();
			renderer.setPartPageExpandCollapseDisabled(false);
			return out;
		});
	}
}

export {DataConverterJournal};
