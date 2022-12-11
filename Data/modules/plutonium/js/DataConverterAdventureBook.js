import {UtilApplications} from "./UtilApplications.js";
import {DataConverter} from "./DataConverter.js";
import {SharedConsts} from "../shared/SharedConsts.js";
import {UtilDataConverter} from "./UtilDataConverter.js";
import {DataConverterJournal} from "./DataConverterJournal.js";

class DataConverterAdventureBook extends DataConverterJournal {
	/**
	 * @param data Array of adventure/book data
	 * @param indexData The matching metadata data from the adventure/book index
	 * @param prop Either "adventure" or "book"
	 * @param [opts] Options object.
	 * @param [opts.isAddOwnership]
	 * @param [opts.defaultOwnership]
	 */
	static async _pGetAdventureBookJournals (data, indexData, prop, opts) {
		const out = [];
		const contents = indexData.contents;

		const len = Math.min(contents.length, data.length);

		for (let i = 0; i < len; ++i) {
			const content = contents[i];
			const chapter = data[i];

			await this._pGetAdventureBookJournals_byChapter({
				contentsItem: content,
				chapter,
				out,
				opts,
				indexData,
			});
		}

		return out;
	}

	static async _pGetAdventureBookJournals_byChapter ({contentsItem, chapter, out, opts, indexData, folderNames, isNested}) {
		const content = await this._pGetWithJournalDescriptionPlugins(() => {
			return Renderer.get()
				.setFirstSection(true)
				.render(chapter)
				.replace(new RegExp(DataConverter.SYM_AT, "g"), "@");
		});

		const numEntry = out.length;

		const name = isNested
			? UtilApplications.getCleanEntityName(`${contentsItem.name}`)
			: UtilApplications.getCleanEntityName(`${Parser.bookOrdinalToAbv(contentsItem.ordinal)}${contentsItem.name}`);
		const flags = {
			[SharedConsts.MODULE_NAME]: {
				source: indexData.source,
				entryIds: this._getEntryIds({entry: chapter}),
			},
		};

		const journalEntry = {
			name,
			pages: this._getPages({
				name,
				content,
				flags,
			}),
			// Try to keep our entries together at all costs
			// FIXME(v10) is this required?
			sort: CONFIG.JournalEntry.collection.instance.contents.length + (CONST.SORT_INTEGER_DENSITY * numEntry),
			// Set flags at the base level for legacy deduplication
			flags,
		};

		this._mutOwnership(journalEntry, opts);

		out.push(new DataConverterAdventureBook.FolderizedJournalEntryBuilder({journalEntry, folderNames}));
	}

	static _getEntryIds ({entry}) {
		if (!entry) return [];

		const out = [];

		UtilDataConverter.WALKER_GENERIC.walk(
			entry,
			{
				object: (obj) => {
					if (obj.id) out.push(obj.id);
					return obj;
				},
			},
		);

		return out;
	}
}

DataConverterAdventureBook.FolderizedJournalEntryBuilder = class {
	constructor ({journalEntry, folderNames = []} = {}) {
		this.journalEntry = journalEntry;
		this.folderNames = folderNames;
	}
};

export {DataConverterAdventureBook};
