import { libWrapper } from "./shim.js";

let CombatantsInitiative = {};
let firstInitiative = 0;
let lastInitiative = 0;
let disableOpenSheet;

function getInitiatives(combatTracker) {
	combatTracker = combatTracker[0].children;
	let firstPlace = combatTracker[0].children;
	firstPlace = Number(firstPlace[firstPlace.length - 1].innerText);
	let lastPlace = combatTracker[combatTracker.length - 1];
	lastPlace = Number(lastPlace.children[lastPlace.children.length - 1].innerText);
	if (firstPlace > lastPlace) {
		firstInitiative = firstPlace + 1;
		lastInitiative = lastPlace - 1;
	} else if (firstPlace < lastPlace) {
		firstInitiative = firstPlace - 1;
		lastInitiative = lastPlace + 1;
	}
}

class FurnaceCombatQoL {
	static renderCombatTracker(tracker, html, data) {
		if (game.user.role < parseInt(game.settings.get("initiative-double-click", "player-access"))) return;
		const revertButton = game.settings.get("initiative-double-click", "revertButton");
		const orderButtons = game.settings.get("initiative-double-click", "orderButtons");
		const combatTracker = html.find("#combat-tracker");
		if (!combatTracker[0].children.length) return;
		getInitiatives(combatTracker);
		let TokenInitiative = html.find(".token-initiative");

		if (orderButtons) {
			TokenInitiative.before(`<div class="button double-click-initiative-first" title="${game.i18n.localize("initiative-double-click.buttons.top")}"><a>
				<i class="fas fa-arrow-up"></i>
			</a></div>`);
			html.find(".double-click-initiative-first a").on("click", FurnaceCombatQoL._onClickFirst);
		}

		if (disableOpenSheet) {
			TokenInitiative.off("dblclick").on("dblclick", FurnaceCombatQoL._onInitiativeDblClick);
		} else {
			TokenInitiative.off("pointerdown").on("pointerdown", FurnaceCombatQoL._onPointerDown);
			TokenInitiative.off("pointerup").on("pointerup", FurnaceCombatQoL._onPointerUp);
		}

		if (revertButton) {
			for (let combatant of html.find("#combat-tracker li.combatant")) {
				const cid = combatant.dataset.combatantId;
				let div = document.createElement("div");
				div.classList.add("button", "double-click-initiative-revert");
				if (CombatantsInitiative[cid]) {
					div.title = game.i18n.format("initiative-double-click.buttons.previous", { previous: CombatantsInitiative[cid].previous });
				} else {
					div.classList.add("double-click-disabled");
				}
				let i = document.createElement("i");
				i.classList.add("fas", "fa-undo");
				let a = document.createElement("a");
				a.appendChild(i);
				div.appendChild(a);
				combatant.insertBefore(div, combatant.querySelector(".token-initiative"));
				html.find(".double-click-initiative-revert a").on("click", FurnaceCombatQoL._onClickRevert);
			}
		}
		if (orderButtons) {
			TokenInitiative.before(`<div class="button double-click-initiative-last" title="${game.i18n.localize("initiative-double-click.buttons.bottom")}"><a>
				<i class="fas fa-arrow-down"></i>
			</a></div>`);
			html.find(".double-click-initiative-last a").on("click", FurnaceCombatQoL._onClickLast);
		}
	}
	static _onPointerDown(event) {
		event.stopPropagation();
		event.preventDefault();
		const now = Date.now();
		const dt = now - this._clickTime;
		this._clickTime = now;
	}
	static _onPointerUp(event) {
		const now = Date.now();
		const dt = now - this._clickTime;
		if (dt >= 500) {
			FurnaceCombatQoL._changeInitiative(event);
		}
	}
	static _onInitiativeDblClick(event) {
		event.stopPropagation();
		event.preventDefault();
		FurnaceCombatQoL._changeInitiative(event);
	}
	static _changeInitiative(event) {
		let html = $(event.target).closest(".combatant");
		const cid = html.data("combatant-id");
		let initiative = html.find(".token-initiative");
		let combatant = game.combat.combatants.get(cid);
		if (!combatant.isOwner) return;
		const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
		// Width = 50-95, increasing by 15 for every digit over 2
		const width = clamp(20 + 15 * numDigits(combatant.initiative), 50, 95);
		let input = $(`<input class="initiative" style="width: ${width}%" value="${combatant.initiative}"/>`);
		initiative.off("dblclick");
		initiative.empty().append(input);
		input.focus().select();
		input.on("change", (ev) => {
			CombatantsInitiative[cid] = { previous: combatant.initiative };
			game.combat.setInitiative(cid, input.val());
		});
		input.on("focusout", (ev) => game.combats.render());
	}
	static _onClickRevert(event) {
		let html = $(event.target).closest(".combatant");
		const cid = html.data("combatant-id");
		let combatant = game.combat.combatants.get(cid);
		if (!combatant.isOwner) return;
		const previous = CombatantsInitiative[cid].previous;
		CombatantsInitiative[cid] = { previous: combatant.initiative };
		game.combat.setInitiative(cid, previous);
	}
	static _onClickFirst(event) {
		let html = $(event.target).closest(".combatant");
		const cid = html.data("combatant-id");
		let combatant = game.combat.combatants.get(cid);
		if (!combatant.isOwner) return;
		CombatantsInitiative[cid] = { previous: combatant.initiative };
		game.combat.setInitiative(cid, firstInitiative);
	}
	static _onClickLast(event) {
		let html = $(event.target).closest(".combatant");
		const cid = html.data("combatant-id");
		let combatant = game.combat.combatants.get(cid);
		if (!combatant.isOwner) return;
		CombatantsInitiative[cid] = { previous: combatant.initiative };
		game.combat.setInitiative(cid, lastInitiative);
	}
}

Hooks.on("renderCombatTracker", FurnaceCombatQoL.renderCombatTracker);
Hooks.once("init", () => {
	game.settings.register("initiative-double-click", "disableOpenSheet", {
		name: game.i18n.localize("initiative-double-click.settings.disableOpenSheet.name"),
		hint: game.i18n.localize("initiative-double-click.settings.disableOpenSheet.hint"),
		scope: "world",
		config: true,
		type: Number,
		default: true,
		choices: {
			0: game.i18n.localize("initiative-double-click.settings.disableOpenSheet.choices.0"),
			1: game.i18n.localize("initiative-double-click.settings.disableOpenSheet.choices.1"),
		},
		onChange: (value) => {
			disableOpenSheet = value;
			if (value) libWrapper.register("initiative-double-click", "CombatTracker.prototype._onCombatantMouseDown", wrappedOnCombatantMouseDown, "OVERRIDE");
			else libWrapper.unregister("initiative-double-click", "CombatTracker.prototype._onCombatantMouseDown");
			game.combats.render();
		},
	});
	game.settings.register("initiative-double-click", "player-access", {
		name: game.i18n.localize("initiative-double-click.settings.player-access.name"),
		hint: game.i18n.localize("initiative-double-click.settings.player-access.hint"),
		scope: "world",
		config: true,
		type: String,
		default: "4",
		choices: {
			0: "USER.RoleNone",
			1: "USER.RolePlayer",
			2: "USER.RoleTrusted",
			3: "USER.RoleAssistant",
			4: "USER.RoleGamemaster",
		},
	});
	game.settings.register("initiative-double-click", "revertButton", {
		name: game.i18n.localize("initiative-double-click.settings.revertButton.name"),
		hint: game.i18n.localize("initiative-double-click.settings.revertButton.hint"),
		scope: "world",
		config: true,
		type: Boolean,
		default: false,
	});
	game.settings.register("initiative-double-click", "orderButtons", {
		name: game.i18n.localize("initiative-double-click.settings.orderButtons.name"),
		hint: game.i18n.localize("initiative-double-click.settings.orderButtons.hint"),
		scope: "world",
		config: true,
		type: Boolean,
		default: false,
	});
});

function wrappedOnCombatantMouseDown(wrapped, ...args) {
	event.preventDefault();

	const li = event.currentTarget;
	const combatant = this.viewed.combatants.get(li.dataset.combatantId);
	const token = combatant.token;
	if (!combatant.actor?.testUserPermission(game.user, "OBSERVED")) return;

	// Control and pan to Token object
	if (token?.object) {
		token.object?.control({ releaseOthers: true });
		if (game.version > 10) {
			return canvas.animatePan(token.object.center);
		} else {
			return canvas.animatePan({ x: token.data.x, y: token.data.y });
		}
	}
}

function numDigits(x) {
	return (Math.log10((x ^ (x >> 31)) - (x >> 31)) | 0) + 1;
}

Hooks.once("ready", () => {
	disableOpenSheet = game.settings.get("initiative-double-click", "disableOpenSheet");
	if (disableOpenSheet) libWrapper.register("initiative-double-click", "CombatTracker.prototype._onCombatantMouseDown", wrappedOnCombatantMouseDown, "OVERRIDE");
});
