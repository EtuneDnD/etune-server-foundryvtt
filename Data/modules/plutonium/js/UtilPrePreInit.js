class UtilPrePreInit {
	static _IS_GM = null;

	/** An alternate to `game.user.isGM`, which does not rely on the user collection being loaded. */
	static isGM () {
		return UtilPrePreInit._IS_GM = UtilPrePreInit._IS_GM ?? game.data.users.find(it => it._id === game.userId).role >= CONST.USER_ROLES.ASSISTANT;
	}
}

export {UtilPrePreInit};
