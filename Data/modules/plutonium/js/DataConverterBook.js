import {DataConverterAdventureBook} from "./DataConverterAdventureBook.js";

class DataConverterBook extends DataConverterAdventureBook {
	static get _CONFIG_GROUP () { return "importBook"; }

	static pGetBookJournals (data, indexData, opts) {
		return this._pGetAdventureBookJournals(data, indexData, "book", opts);
	}
}

export {DataConverterBook};
