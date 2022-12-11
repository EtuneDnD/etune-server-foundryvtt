import {ImportListAdventureBook} from "./ImportListAdventureBook.js";
import {Vetools} from "./Vetools.js";
import {DataConverterBook} from "./DataConverterBook.js";

class ImportListBook extends ImportListAdventureBook {
	static get ID () { return "books"; }
	static get DISPLAY_NAME_TYPE_PLURAL () { return "Books"; }

	static _ = this.registerImpl(this);

	constructor (externalData) {
		super(
			{title: "Import Book"},
			externalData,
			{
				titleSearch: "books",
				defaultFolderPath: [
					"Books",
					{
						metaKey: "name",
					},
				],
				dirsHomebrew: ["book"],
				namespace: "book",
				isFolderOnly: true,
				configGroup: "importBook",
			},
			{
				fnGetIndex: Vetools.pGetBookIndex.bind(Vetools),
				dataProp: "book",
				brewDataProp: "bookData",
				title: "Book",
			},
		);
	}

	_pGetJournalDatas () {
		return DataConverterBook.pGetBookJournals(this._content.data, this._content._contentMetadata, {isAddOwnership: true});
	}
}

export {ImportListBook};
