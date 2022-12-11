import {DataConverterAdventureBook} from "./DataConverterAdventureBook.js";

class DataConverterAdventure extends DataConverterAdventureBook {
	static get _CONFIG_GROUP () { return "importAdventure"; }

	static pGetAdventureJournals (data, indexData, opts) {
		return this._pGetAdventureBookJournals(data, indexData, "adventure", opts);
	}
}

export {DataConverterAdventure};
