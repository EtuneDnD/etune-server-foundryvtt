class UtilCollection {
	static getChildMeta (childEntityType) {
		const iconClass = CONFIG[childEntityType]?.sidebarIcon || `fas fa-file`; // default to this for `Page`
		const collectionProp = childEntityType === "Item" ? "items" : "pages";
		return {
			iconClass,
			collectionProp,
		};
	}
}

export {UtilCollection};
