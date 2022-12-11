class UtilJournalEntries {
	static async pGetCreateJournalEntryId ({name, folderId = null, defaultOwnership = null}) {
		const searchName = name.toLowerCase().trim();

		const existing = game.journal.find(it =>
			it.name.toLowerCase().trim() === searchName
			&& ((it.folder == null && folderId == null) || it.folder?.id === folderId),
		);
		if (existing) return existing.id;

		const journalEntryData = {
			name,
			pages: [],
			folder: folderId,
		};

		if (defaultOwnership != null) journalEntryData.ownership = {default: defaultOwnership};

		const journalEntry = await JournalEntry.create(journalEntryData, {renderSheet: false});
		return journalEntry.id;
	}
}

export {UtilJournalEntries};
