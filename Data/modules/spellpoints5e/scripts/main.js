class VSpellPoints {
    static ID = 'spellpoints5e';
    static isActive = true;
    static unsupportedModules = []

    static FLAGS = {
        POINTS: 'points', // legacy
        USES: 'uses', // legacy
        RESOURCES: 'resources',
        ENABLED: 'enabled'
    }
    
    static STATUSCHOICES = {
        enabled: "enabled",
        disabled: "disabled",
        default: "default"
    }

    static resourcesPath() {
        return `flags.${VSpellPoints.ID}.${VSpellPoints.FLAGS.RESOURCES}`
    }

    static TEMPLATES = {
        ATTRIBUTE: `modules/${this.ID}/templates/attribute.hbs`
    }

    static SETTINGS = {
        TOGGLEON: 'spellPointsToggle',
        DISPLAY: 'headerOrResourceToggle',
        TABLESETTINGS: 'tablesButton'
    }

    static DISPLAY_CHOICE = {
        header: "Header",
        resources: 'Resources'
    }

    static initialize() {
        // load templates
        delete _templateCache[this.TEMPLATES.ATTRIBUTE];
        loadTemplates([this.TEMPLATES.ATTRIBUTE]);

        // disable module if unsupported module is active
        if (this.unsupportedModuleActive()) {
            this.isActive = false;
        }

        // Register a world setting
        game.settings.register(this.ID, this.SETTINGS.TOGGLEON, {
            name: "Use Variant: Spell Points? ",
            hint: `Use Spell Points instead of Slots, as described in the Dungeon Master's Guide. Replaces parts of the "spell book" in the character sheet. `,
            scope: "world",      // This specifies a world-level setting
            config: true,        // This specifies that the setting appears in the configuration view
            default: false,      // The default value for the setting
            type: Boolean
        });

        // Register a client setting
        game.settings.register(this.ID, this.SETTINGS.DISPLAY, {
            name: "Where to display Spell Points:",
            hint: `Select where on the character sheet the current spell point value should be shown. `,
            scope: "world",      // This specifies a world-level setting
            config: true,        // This specifies that the setting appears in the configuration view
            default: 'Header',      // The default value for the setting
            choices: Object.values(this.DISPLAY_CHOICE)
        });
    }

    /* https://github.com/League-of-Foundry-Developers/foundryvtt-devMode */
    static log(...args) {
        try {
            const isDebugging = game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);
            if (isDebugging) {
                console.log(this.ID, '|', ...args);
            }
        } catch (e) {}
    }

    // check if unsupported module is enabled
    static unsupportedModuleActive() {
        let unsupported = false;
        this.unsupportedModules.forEach( function (name) {
            if (game.modules.get(name)?.active) {
                console.error(`${VSpellPoints.ID} | module ${name} is active, which is not supported yet, disabling ${VSpellPoints.ID}`)
                ui.notifications.error(`${VSpellPoints.ID}: module ${name} is active, which is not supported yet, disabling ${VSpellPoints.ID}`);
                unsupported = true;
            }
        })
        return unsupported;
    }
}

class VSpellPointsData {
    /** @typedef {{
     *  maxLevel: number,
     *  points: {
     *      max: number,
     *      value: number,
     *      addMax: number,
     *      temp: number
     *  },
     *  uses: {
     *      spell6: {max: number, value: number, override: number},
     *      spell7: {max: number, value: number, override: number},
     *      spell8: {max: number, value: number, override: number},
     *      spell9: {max: number, value: number, override: number}
     *  }
     * }} Resource
     * */

    /** @type Resource */
    static resourcesTemplate = {
        // max spell level
        maxLevel: 0,
        // tracking spell points
        points: {
            max: 0,
            value: 0,
            addMax: 0,
            temp: 0
        },
        // tracking uses
        uses: {
            spell6: {max: 0, value: 0, override: null},
            spell7: {max: 0, value: 0, override: null},
            spell8: {max: 0, value: 0, override: null},
            spell9: {max: 0, value: 0, override: null},
        }
    }

    // for debugging purposes
    static _deleteAllPointData() {
        game.actors.forEach((actor) => {
            this.deletePoints(actor);
            this.deleteUses(actor);
            this.deleteResources(actor);
        })
    }

    static initPoints(actor) {
        /** @type Resource */
        let actorResources = this.getResources(actor);
        VSpellPoints.log(actorResources)

        let isNotPresent = !actorResources || (actorResources && foundry.utils.isObjectEmpty(actorResources))
        
        let actor_classes = actor.classes; 
        if (!actor_classes) actor_classes = actor.data.data.classes;

        let [points, level] = VSpellPointsCalcs.getMaxSpellPointsAndLevel(actor_classes)

        /** @type Resource */
        let updateResources;
        if (isNotPresent) {
            console.log(`${VSpellPoints.ID} | Initializing spell points data for: ${actor.name}`)

            // Update Resources: take template and replace initial values
            // level and points
            updateResources = foundry.utils.deepClone(this.resourcesTemplate)
            updateResources.maxLevel = level;
            updateResources.points.max = points;
            updateResources.points.value = points;

            // spell uses
            for (let j = 6; j <= level; j++) {
                updateResources.uses[`spell${j}`].max = 1
                updateResources.uses[`spell${j}`].value = 1
            }

            // persist in actor
            actor.setFlag(VSpellPoints.ID, VSpellPoints.FLAGS.RESOURCES, updateResources);
        } else if (actorResources.points.max !== points || actorResources.maxLevel !== level) {
            VSpellPoints.log(`${VSpellPoints.ID} | Updating spell points data for: ${actor.name}`)

            // Update Resources
            // level and points
            updateResources = {
                maxLevel: level,
                points: { max: points },
                uses: {}
            }

            for (let j = 6; j <= 9; j++) {
                updateResources.uses[`spell${j}`] = {}
                if (j <= level) updateResources.uses[`spell${j}`].max = 1
                else updateResources.uses[`spell${j}`].max = 0
            }

            // persist
            actor.setFlag(VSpellPoints.ID, VSpellPoints.FLAGS.RESOURCES, updateResources);
        } else {
            VSpellPoints.log(`Nothing to do`)
        }

        // return default values
        let defaultResources = foundry.utils.mergeObject(this.resourcesTemplate, actorResources, {insertKeys: false, overwrite: true, recursive: true})
        return defaultResources
    }

    static deletePoints(actor) {
        return actor.unsetFlag(VSpellPoints.ID, VSpellPoints.FLAGS.POINTS)
    }

    static deleteUses(actor) {
        return actor.unsetFlag(VSpellPoints.ID, VSpellPoints.FLAGS.USES)
    }

    static deleteResources(actor) {
        return actor.unsetFlag(VSpellPoints.ID, VSpellPoints.FLAGS.RESOURCES)
    }

    static getResources(actor) {
        return actor.getFlag(VSpellPoints.ID, VSpellPoints.FLAGS.RESOURCES);
    }

    static getPointsEnabled(actor) {
        return actor.getFlag(VSpellPoints.ID, VSpellPoints.FLAGS.ENABLED);
    }
    static setPointsEnabled(actor, enable) {
        return actor.setFlag(VSpellPoints.ID, VSpellPoints.FLAGS.ENABLED, enable);
    }

    // check if actor is a player character
    static isCharacter(actor) {
        if (actor.data?.type !== "character") {
            VSpellPoints.log("Actor is not a player")
            return false
        }
        return true
    }

    // check if actor is spellcasters
    static isSpellcaster(actor) {
        let actor_classes = actor?.classes; 
        if (!actor_classes) actor_classes = actor?.data?.data?.classes;

        if (!actor_classes) {
            VSpellPoints.log("Actor doesn't have a class")
            return false;
        }

        let isCaster = VSpellPointsCalcs.getCombinedSpellCastingLevel(actor_classes)[0] > 0;
        if (!isCaster) {
            VSpellPoints.log("Actor is not a spellcaster")
            return false
        }
        return true
    }

    // check if actor is warlock
    static isWarlock(actor) {
        let actor_classes = actor?.classes; 
        if (!actor_classes) actor_classes = actor?.data?.data?.classes; 

        if (!(actor_classes)) {
            return false
        }

        if ('warlock' in actor_classes) {
            VSpellPoints.log("Actor is a Warlock")
            return true;
        }
        return false;
    }

    // check if module was enabled in the settings
    static moduleEnabled() {
        const useModule = game.settings.get(VSpellPoints.ID,VSpellPoints.SETTINGS.TOGGLEON);
        if (!useModule || !VSpellPoints.isActive) {
            VSpellPoints.log('Variant Spellpoints not used')
            return false;
        }
        return true
    }

    /**
     * Returns whether spell points were manually enabled for this specific character
     *
     * Returns undefined if default/no choice, true if manually enabled, false if manually disabled
     * @param actor
     * @returns {boolean|undefined}
     */
    static moduleManuallyEnabled(actor) {
        const actorSetting = VSpellPointsData.getPointsEnabled(actor);
        switch (actorSetting) {
            case undefined: return undefined;
            case VSpellPoints.STATUSCHOICES.enabled: return true;
            case VSpellPoints.STATUSCHOICES.disabled: return false;
            case VSpellPoints.STATUSCHOICES.default: return undefined;
            default: return undefined;
        }
    }

    /**
     * Handle enabling editing for a spell point override value
     * @param {MouseEvent} event The originating click event
     * @private
     */
    static async _onSpellUsesOverride (event) {
        const span = event.currentTarget.parentElement;
        const level = span.dataset.level;
        const override = this.data.flags[VSpellPoints.ID].resources.uses[level].override || span.dataset.slots;
        const input = document.createElement("INPUT");
        input.type = "text";
        input.name = `${VSpellPoints.resourcesPath()}.uses.${level}.override`;
        input.value = override;
        input.placeholder = span.dataset.slots;
        input.dataset.dtype = "Number";

        // Replace the HTML
        const parent = span.parentElement;
        parent.removeChild(span);
        parent.removeChild(parent.lastChild); // remove closing bracket
        parent.appendChild(input);
        parent.appendChild(document.createTextNode(")")); // add closing bracket
    }

    // TODO: editable tables
    // static updateGlobalSpellPointsTable(updateData) {}
    // static updateGlobalSpellCostTable(updateData) {}
}

class VSpellPointsCalcs {
    static NONE = 0;
    static THIRD = 1;
    static HALF = 2;
    static FULL = 3;
    static ART = 4;

    // map from caster name (String) to their spellcasting type
    static transformCasterType (casterType) {
        switch (casterType) {
            case 'none': return this.NONE;
            case 'pact': return this.NONE;
            case 'third': return this.THIRD;
            case 'artificer': return this.ART; // Artificer
            case 'half': return this.HALF;
            case 'full': return this.FULL;
            default: return this.NONE;
        }
    }

    // full caster use their class level for determining spell points, half caster use their class level / 2, third caster / 3
    static getSpellCastingLevel(casterType, classLevel) {
        let casterTypeNr = this.transformCasterType(casterType)
        switch (casterTypeNr) {
            case this.NONE: return 0;
            case this.THIRD: return Math.floor(classLevel / 3);
            case this.HALF: return Math.floor(classLevel / 2);
            case this.FULL: return classLevel;
            case this.ART: return Math.max(1, Math.floor(classLevel / 2)); // Artificers are half caster spellslots on lvl 1
            default: return 0;
        }
    }

    static getCombinedSpellCastingLevel (classes) {
        let allCastingLevels = {}
        Object.entries(classes).forEach( ([className, classProps]) =>  {
            let class_levels = classProps.levels;
            if (!class_levels) class_levels = classProps.data.data.levels;

            let class_progression = classProps.spellcasting?.progression;
            if (!class_progression) class_progression = classProps.data?.data?.spellcasting?.progression;
            allCastingLevels[className.capitalize()] = this.getSpellCastingLevel(class_progression, class_levels);
        });
        return [Object.values(allCastingLevels).reduce((a, b) => a + b, 0), allCastingLevels];
    }

    static getMaxSpellPointsAndLevel(classes) {
        let [spellCastingLevel, _] = this.getCombinedSpellCastingLevel(classes);
        return this.getSpellpointsByLevel(spellCastingLevel);
    }

    // point cost by spell level (starting with level 0 = cantrips)
    static _spellPointCost = [0, 2, 3, 5, 6, 7, 9, 10, 11, 13]
    static getSpellPointCost(i) {
        let clampedLevel = Math.clamped(i, 0, this._spellPointCost.length - 1)
        if (clampedLevel !== i )
            console.error(`${VSpellPoints.ID} - Spell level ${i} out of bounds: has no spell point cost`);
        return this._spellPointCost[clampedLevel];
    }

    // which spell levels can only be cast once per long rest
    static lockedSpellLevels = [6, 7, 8, 9];

    // TODO: editable
    // starting with character level 0
    // [max points, max spell level]
    static _spellPointsByLevelTable = [
        [0, 0],
        [4, 1],
        [6, 1],
        [14, 2],
        [17, 2],
        [27, 3],
        [32, 3],
        [38, 4],
        [44, 4],
        [57, 5],
        [64, 5],
        [73, 6],
        [73, 6],
        [83, 7],
        [83, 7],
        [94, 8],
        [94, 8],
        [107, 9],
        [114, 9],
        [123, 9],
        [133, 9]
    ];
    static getSpellpointsByLevel(i) {
        let clampedLevel = Math.clamped(i, 0, this._spellPointsByLevelTable.length - 1)
        if (clampedLevel !== i )
            console.error(`${VSpellPoints.ID} - Character level ${i} out of bounds: has no maximum spell points set`);
        return this._spellPointsByLevelTable[clampedLevel];
    }

    static async createSpellPointsInfo(actor, data, asResource= false) {
        // read from actor
        /** @type Resource */
        let userData = data;
        if (!userData) userData = {}

        let tempMax = userData.points.addMax > 0 ? userData.points.addMax : "";
        let tempPoints = userData.points.temp > 0 ? userData.points.temp : "";
        let actor_classes = actor.classes 
        if (!actor_classes) actor_classes = actor.data.data.classes

        let [combinedLevel, allCastingLevels] = VSpellPointsCalcs.getCombinedSpellCastingLevel(actor_classes)

        // TODO: with localization
        const template_data =  {
            spellPointsNameText: "Spell Points",
            maxSpellPointsTooltip: "Your maximum number of spell points",
            currentSpellpoints: userData.points.value,
            maxSpellPoints: userData.points.max,
            combinedLevel,
            allCastingLevels,
            asResource,
            resourcePath: VSpellPoints.resourcesPath(),
        }
        // TODO: tidy5e
        let tidy5e = `<div class="resource-value multiple">
            <input class="res-value" name="flags.spellpoints5e.resources.points.value" type="text" value="" data-dtype="Number" placeholder="0" maxlength="3">
            <span class="sep">/</span>
            <input class="res-max" name="flags.spellpoints5e.resources.points.max" type="text" value="" data-dtype="Number" placeholder="0" maxlength="3">
        </div>`

        let spellPointsInfo = await renderTemplate(VSpellPoints.TEMPLATES.ATTRIBUTE, template_data);
        return spellPointsInfo;
    }
}

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(VSpellPoints.ID);
});

/**
 * Once the game has initialized, set up our module
 */
Hooks.once('ready', () => {
    console.log(`${VSpellPoints.ID} | Initializing module`)
    VSpellPoints.initialize();

    // add a button to the top of the sheet that opens a dialog to enable/disable spellpoints per sheet
    // TODO: comments
    Hooks.on("getActorSheetHeaderButtons", (actorsheetCharacter, items) => {
        VSpellPoints.log("Add spellpoint button to header")
        VSpellPoints.log("RENDER", actorsheetCharacter, items)

        // disable for not trusted players
        if (!game.user.isTrusted && !game.user.isGM) return;

        let actor = actorsheetCharacter.object;

        // prevent execution if it's not a charactersheet
        if (!VSpellPointsData.isCharacter(actor)) return;

        function handleVariantChoice(choice, actor) {
            VSpellPoints.log("CLICKED ON UPDATE SHEET")
            VSpellPoints.log(choice, actor)
            VSpellPointsData.setPointsEnabled(actor, choice)
        }

        const spellPointsButton = {
            label: "",
            class: "spellpoints",
            icon: "fas fa-book",
            onclick: async (event) => {
                const clickedElement = $(event.currentTarget);
                const actorID = clickedElement.parents('[id]')?.attr("id")?.replace("actor-", "")
                const actor = game.actors.get(actorID)
                const previousChoice = VSpellPointsData.getPointsEnabled(actor)
                const selectedAttribute = `selected="selected"`

                let spellLvlDialog = new Dialog({
                    title: "Should spell points be used for this character?",
                    content: `
                      Select if spell points should be used for this character.
                      <form class="flexcol">
                        <div class="form-group">
                          <label>Selection:  </label>
                          <select id="spellSlotVariant">
                            <option value="${VSpellPoints.STATUSCHOICES.default}" ${previousChoice === VSpellPoints.STATUSCHOICES.default? selectedAttribute : ""}>
                                default (global setting)
                            </option>
                            <option value="${VSpellPoints.STATUSCHOICES.disabled}" ${previousChoice === VSpellPoints.STATUSCHOICES.disabled? selectedAttribute : ""}>
                                use slots
                            </option>
                            <option value="${VSpellPoints.STATUSCHOICES.enabled}" ${previousChoice === VSpellPoints.STATUSCHOICES.enabled? selectedAttribute : ""}>
                                use points
                            </option>
                          </select>
                        </div>
                      </form>`,
                    buttons: {
                        one: {
                            icon: '<i class="fas fa-save"></i>',
                            label: "Update Sheet",
                            callback: (html) => handleVariantChoice(html.find(`#spellSlotVariant`).val(), actor)
                        }
                    },
                    default: null,
                    render: html => VSpellPoints.log("Register interactivity in the rendered dialog"),
                });
                await spellLvlDialog.render(true);
            }
        }
        items.unshift(spellPointsButton);
    })

    // modify actorsheet after its rendered to show the spell points
    Hooks.on("renderActorSheet5e", (actorsheet, html, _options) => {
        VSpellPoints.log("Add spellpoint UI")
        VSpellPoints.log("RENDER", actorsheet, html, _options)

        let actor = actorsheet.object;
        // prevent execution if variant is disabled
        if (VSpellPointsData.moduleManuallyEnabled(actor) === false) return;
        if (!VSpellPointsData.moduleEnabled() && !VSpellPointsData.moduleManuallyEnabled(actor)) return;

        if (!VSpellPointsData.isCharacter(actor)) return;


        VSpellPoints.log("render actorsheet", actorsheet, "renderActor: ", foundry.utils.deepClone(actor))

        // initialize spellpoints data in the actor, if not yet present
        const defaultResources = VSpellPointsData.initPoints(actor)

        // removes non spellcasters and single-class warlocks
        VSpellPoints.log("Render Sheet: warlock, spellcaster:", VSpellPointsData.isWarlock(actor), VSpellPointsData.isSpellcaster(actor))
        if (!VSpellPointsData.isSpellcaster(actor)) return;
        
        let actor_classes = actor.classes; 
        if (!actor_classes) actor_classes = actor.data.data.classes; 

        // change header of sheet
        VSpellPoints.log("It's a caster! - Level " + VSpellPointsCalcs.getCombinedSpellCastingLevel(actor_classes)[0])
        let attributesList = html.find(".sheet-header").find(".attributes")
        let resourcesList = html.find(".sheet-body .center-pane").find("ul.attributes")
        if (resourcesList.length === 0) {
            resourcesList = html.find(".sheet-main-wrapper .sheet-main").find("ul.attributes")
        }

        let savedResourcesData = VSpellPointsData.getResources(actor) ?? {}

        /** @type Resource */
        let actorResources = foundry.utils.isObjectEmpty(savedResourcesData) ? defaultResources : savedResourcesData;
        VSpellPoints.log("Using pointData: ", actorResources)

        // create new attribute display in the header or the resource block
        // TODO: shorten this line
        if (Object.values(VSpellPoints.DISPLAY_CHOICE)[game.settings.get(VSpellPoints.ID,VSpellPoints.SETTINGS.DISPLAY)] === VSpellPoints.DISPLAY_CHOICE.resources) {
            let spellPointsAttribute = VSpellPointsCalcs.createSpellPointsInfo(actor, actorResources, true);
            spellPointsAttribute.then((spellPointsInfo) => {
                let newAttribute = resourcesList.append(spellPointsInfo);
                actorsheet.activateListeners($(newAttribute).find(".spellpoints"))
            })
        } else {
            let spellPointsAttribute = VSpellPointsCalcs.createSpellPointsInfo(actor, actorResources, false);
            spellPointsAttribute.then((spellPointsInfo) => {
                let newAttribute = attributesList.append(spellPointsInfo);
                actorsheet.activateListeners($(newAttribute).find(".spellpoints"))
            })
        }

        // add point cost and remaining spellpoints indicator to every spell category
        // also add remaining uses if 6th level or higher
        html.find(".tab.spellbook")
            .find(".items-header.spellbook-header")
            .find(".spell-slots")
            .each(function (i) {
                let dataLevel = $(this).find(".spell-max[data-level]").attr("data-level")

                // skip spells without limited uses and pact spells
                if (!dataLevel || !dataLevel.includes("spell") ) {
                    return true;
                }

                let newSlotInfo;
                let newUsesInfo;
                let spellLevel = parseInt(dataLevel.replace("spell",""));
                newSlotInfo = `
                    <span> ${VSpellPointsCalcs.getSpellPointCost(spellLevel)} </span>
                    <span class="sep"> / </span>
                    <span class="spell-max">${actorResources?.points?.value ?? 0} P</span>`;

                // for uses: skip spells under lvl 6
                if (spellLevel < 6) newUsesInfo = ""
                else {
                    newUsesInfo = `
                        <div class="spell-uses" title="remaining uses">
                            (<input type="text" 
                                    name="${VSpellPoints.resourcesPath()}.uses.${dataLevel}.value" 
                                    value="${actorResources.uses[dataLevel]?.value ?? 0}" placeholder="0" 
                                    data-dtype="Number">
                            <span class="sep"> / </span>
                            <span class="spell-max" data-level="${dataLevel}" data-slots="${actorResources.uses[dataLevel].override ?? actorResources.uses[dataLevel].max}">
                                ${actorResources.uses[dataLevel].override ?? actorResources.uses[dataLevel].max}
                                <a class="points-max-override" title="Override points">
                                    <i class="fas fa-edit"></i>
                                </a>
                            </span>)
                        </div>`
                }
                // account for multiple sheets that set different classnames etc.
                let parent;
                let parentOptions = ["spell-level-slots", "item-name"]
                for (let option of parentOptions) {
                    parent = $(this).parent().find(`.${option}`)
                    if (parent.length !== 0) break;
                    parent = $(this).parent().parent().find(`.${option}`)
                    if (parent.length !== 0) break;
                }

                // add uses indicator to the left of point cost indicator
                $(this).parent().find("h3").addClass("points-variant")
                $(this).attr('title', 'cost / remaining spell points');
                $(this).removeClass("spell-slots")
                $(this).addClass("spell-points")
                $(this).html(newSlotInfo)

                $(newUsesInfo).detach().appendTo(parent)
                $(this).detach().appendTo(parent)
                actorsheet.activateListeners($(this).parent())
            });
        // adds onclick function to change the max uses amount
        html.find('.tab.spellbook').find('.points-max-override').click(VSpellPointsData._onSpellUsesOverride.bind(actor));

        // set new min-width for the sheet if it hasn't been set yet
        let currentMinWidth = html.css("min-width").replace("px", "")
        if (currentMinWidth !== "auto" && currentMinWidth < actorsheet.options.width + 50) {
            html.css("min-width", `${actorsheet.options.width + 50}px`)
            actorsheet.setPosition({width: actorsheet.options.width + 50})
        }
    });

    Hooks.on("renderLongRestDialog", (dialog, html, options) => {
        // prevent execution if variant is disabled
        if (VSpellPointsData.moduleManuallyEnabled(dialog.actor) === false) return;
        if (!VSpellPointsData.moduleEnabled() && !VSpellPointsData.moduleManuallyEnabled(dialog.actor)) return;

        let text = $(html).find(".dialog-content").children("p").text().replace('spell slots', 'spell points');
        $(html).find(".dialog-content").children("p").text(text);
    })

    // TODO: use localization stuff
    // replace the spell slot reminder in the ability use dialog
    Hooks.on("renderAbilityUseDialog", (dialog, html, object) => {
        VSpellPoints.log(dialog, html, object)
        let item = dialog.item
        let actor = item.parent;

        // prevent execution if variant is disabled
        if (VSpellPointsData.moduleManuallyEnabled(actor) === false) return;
        if (!VSpellPointsData.moduleEnabled() && !VSpellPointsData.moduleManuallyEnabled(actor)) return;

        VSpellPoints.log("Render Ability Use: warlock, spellcaster:", VSpellPointsData.isWarlock(actor), VSpellPointsData.isSpellcaster(actor))
        // filters out npcs, non spellcasters and single-class warlocks
        if (!VSpellPointsData.isCharacter(actor) || !VSpellPointsData.isSpellcaster(actor)) return;

        // only apply on spells that cost resources
        if (item?.data?.type !== "spell"
            || item?.labels?.level === "Cantrip"
            || item?.data?.data?.preparation?.mode === "atwill"
            || item?.data?.data?.preparation?.mode === "innate"
            || html.find("#ability-use-form").find(".form-group").find("select[name=level]").length === 0){
            VSpellPoints.log("not using a resource spell")
            return;
        }

        // TODO: Show red warning box if it can't be cast

        VSpellPoints.log(dialog, html, object)
        /** @type Resource */
        let actorResources = VSpellPointsData.getResources(actor);
        if (!actorResources || foundry.utils.isObjectEmpty(actorResources))
            actorResources = VSpellPointsData.initPoints(actor);

        // change consume spell slot text
        let consumeText = $(html)
            .find("#ability-use-form")
            .find("input[name='consumeSlot']")
            .parent()
            .contents().filter(function () {
                // get only text elements
                return this.nodeType === 3;
            });

        if (VSpellPointsData.isWarlock(actor))
            $(consumeText)[0].textContent = "Consume Spell Points / Slots?";
        else
            $(consumeText)[0].textContent = "Consume Spell Points?";

        // modify the "cast at level" list
        $(html)
            .find("#ability-use-form")
            .find("select[name='level']")
            .find("option")
            .each(function (i) {
                let spellValue = $(this).attr("value")

                let isPact = spellValue === 'pact'
                if (isPact) {
                    // do nothing
                    return true;
                }

                let spellLevel = parseInt(spellValue)
                let cost = VSpellPointsCalcs.getSpellPointCost(spellLevel)

                // https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number
                function ordinal_suffix_of(i) {
                    var j = i % 10,
                        k = i % 100;
                    if (j === 1 && k !== 11) return i + "st";
                    if (j === 2 && k !== 12) return i + "nd";
                    if (j === 3 && k !== 13) return i + "rd";
                    return i + "th";
                }
                let new_text = ordinal_suffix_of(spellLevel) + " Level "

                // add spellpoint cost and spellpoints left
                new_text += `(${cost} / ${actorResources.points?.value ?? 0} Spell Points)`

                // add uses left
                if (spellLevel >= 6) {
                    let uses = actorResources?.uses[`spell${spellLevel}`]?.value ?? 0;
                    let usesMax = actorResources?.uses[`spell${spellLevel}`]?.override ?? actorResources?.uses[`spell${spellLevel}`]?.max ?? 0;
                    new_text += uses === 1 ? ` (${uses} use left)` : ` (${uses} uses left)`
                }
                $(this).text(new_text);
            })
    })

    /**
     * LibWrapper
     */
    if (typeof libWrapper === 'function') {
        VSpellPoints.log("Libwrapper found")

        /* Using libwrapper, if present,  to manage MonkeyPatched functions */
        libWrapper.register(VSpellPoints.ID, 'game.dnd5e.entities.Actor5e.prototype._getRestSpellRecovery',
            function (wrapped, ...args) {

                VSpellPoints.log('libwrapper: game.dnd5e.entities.Actor5e.prototype._getRestSpellRecovery was called');
                return override_getRestSpellRecovery(wrapped).bind(this)(...args)

        }, 'WRAPPER');

        libWrapper.register(VSpellPoints.ID, 'game.dnd5e.entities.Item5e.prototype._getUsageUpdates',
            function (wrapped, ...args) {

                VSpellPoints.log('libwrapper: game.dnd5e.entities.Item5e.prototype._getUsageUpdates was called');
                return override_getUsageUpdates(wrapped).bind(this)(...args)

        }, 'WRAPPER');

    } else {
        /* libWrapper is not available in global scope and can't be used */
        console.warn(`${VSpellPoints.ID} | Please install the module 'libWrapper' to avoid conflicts`)

        // Monkey patch the long rest function so it resets the spell points
        let oldRestSpellRecovery = game.dnd5e.entities.Actor5e.prototype._getRestSpellRecovery;
        game.dnd5e.entities.Actor5e.prototype._getRestSpellRecovery = override_getRestSpellRecovery(oldRestSpellRecovery);

        // Monkey patch the roll spell function so it consumes spell points
        let oldUsageUpdate = game.dnd5e.entities.Item5e.prototype._getUsageUpdates;
        game.dnd5e.entities.Item5e.prototype._getUsageUpdates = override_getUsageUpdates(oldUsageUpdate);
    }
})

function override_getRestSpellRecovery (oldRestSpellRecovery) {
    return function({recoverPact = true, recoverSpells = true}) {
        VSpellPoints.log("recover pact:", recoverPact, "recover spells:", recoverSpells)
        VSpellPoints.log("_getRestSpellRecovery: warlock, spellcaster", VSpellPointsData.isWarlock(this), VSpellPointsData.isSpellcaster(this))

        // use normal function if variant usage is disabled, no spells are being recovered, its an NPC or its not a spellcaster
        if (VSpellPointsData.moduleManuallyEnabled(this) === false || (!VSpellPointsData.moduleEnabled() && !VSpellPointsData.moduleManuallyEnabled(this)) || !recoverSpells || !VSpellPointsData.isCharacter(this) || !VSpellPointsData.isSpellcaster(this)) {
            return oldRestSpellRecovery.apply(this, arguments);
        }

        // call normal spell recovery
        let oldUpdate = oldRestSpellRecovery.apply(this, arguments);

        /** @type Resource */
        let actorResources = VSpellPointsData.getResources(this)
        if (!actorResources || foundry.utils.isObjectEmpty(actorResources))
            actorResources = VSpellPointsData.initPoints(actor);

        // and then add my own update: reset current, tempPoints, tempMax and uses
        if (actorResources?.points?.value !== undefined && actorResources?.points?.max !== undefined)
            oldUpdate[`${VSpellPoints.resourcesPath()}.points.value`] = actorResources?.points?.max ?? 0;
        oldUpdate[`${VSpellPoints.resourcesPath()}.points.temp`] = 0;
        oldUpdate[`${VSpellPoints.resourcesPath()}.points.addMax`] = 0;
        // reset uses for over 6th level spells
        Object.entries(actorResources?.uses ?? {}).forEach(([spellLevel, data]) => {
            VSpellPoints.log(`${VSpellPoints.resourcesPath()}.uses.${spellLevel}.value`, data.max)
            oldUpdate[`${VSpellPoints.resourcesPath()}.uses.${spellLevel}.value`] = data.override ?? data.max
        })

        return oldUpdate;
    }
}

function override_getUsageUpdates(oldUsageUpdate) {
    return function ({consumeQuantity, consumeRecharge, consumeResource, consumeSpellLevel, consumeUsage, ...args}) {
        let actor = this.parent;

        VSpellPoints.log("_getUsageUpdates", {
            consumeQuantity,
            consumeRecharge,
            consumeResource,
            consumeSpellLevel,
            consumeUsage
        }, this)

        /* consume Resource on non-spells. TODO: will maybe be changed in the future */
        // check if a resource gets consumed and that resource is the spell points
        let isResource = false;
        if(consumeResource && this.data?.data?.consume?.target?.includes(VSpellPoints.resourcesPath())) {
            isResource = true;
        }

        // use normal function if variant is disabled or because of other factors
        // do default behaviour if no spell level is used or module is deactivated
        VSpellPoints.log("_getUsageUpdates: warlock, spellcaster:", VSpellPointsData.isWarlock(actor), VSpellPointsData.isSpellcaster(actor))
        if (VSpellPointsData.moduleManuallyEnabled(actor) === false || !isResource && ( (!VSpellPointsData.moduleEnabled() && !VSpellPointsData.moduleManuallyEnabled(actor)) || !consumeSpellLevel || !VSpellPointsData.isCharacter(actor) || !VSpellPointsData.isSpellcaster(actor))) {
            VSpellPoints.log("Spell points not affected")
            return oldUsageUpdate.apply(this, arguments);
        }

        // Do default behaviour if spell is cast with pact magic
        const isPactMagic = consumeSpellLevel === "pact"
        if (isPactMagic) {
            VSpellPoints.log("Spell points not affected")
            return oldUsageUpdate.apply(this, arguments);
        }

        // get the spell level that is being cast
        let spellLevelStr = consumeSpellLevel;

        // prevent default behaviour by telling the function there is no spell being consumed
        consumeSpellLevel = null

        // call normal spell recovery
        let oldUpdate = oldUsageUpdate.apply(this, [{
            consumeQuantity,
            consumeRecharge,
            consumeResource,
            consumeSpellLevel,
            consumeUsage
        }]);

        VSpellPoints.log(oldUpdate)

        /** @type Resource */
        let actorResources = VSpellPointsData.getResources(actor);
        if (!actorResources || foundry.utils.isObjectEmpty(actorResources))
            actorResources = VSpellPointsData.initPoints(actor);

        // define when spells start to cost uses
        let usesSpellLevel = 6

        let spellCost;
        let currentNotOk;
        let spellLevelNotOk;
        let noUsesRemaining;
        let spellLevel;
        // normal use or used as resource?
        if (isResource) {
            spellCost = 0;
            spellLevel = 0;
            // is the resource a spell slot or the points?
            if (this.data?.data?.consume?.target?.includes("uses")) {
                spellLevelStr = this.data?.data?.consume?.target?.replace(VSpellPoints.resourcesPath(), "").replace(".uses.", "").replace(".value", "")
                spellLevel = parseInt("" + spellLevelStr?.replace("spell", "")) || 0

                currentNotOk = false;
                spellLevelNotOk = !spellLevel || !actorResources?.maxLevel || spellLevel > actorResources?.maxLevel;
                noUsesRemaining = spellLevel >= usesSpellLevel ? actorResources?.uses[spellLevelStr]?.value === 0 : false;
            } else {
                spellCost = this.data?.data?.consume?.amount;

                currentNotOk = !spellCost || !actorResources?.points?.value || actorResources?.points?.value < spellCost;
                spellLevelNotOk = false;
                noUsesRemaining = false;
            }
        } else {
            // string of spell level to number
            spellLevel = parseInt("" + spellLevelStr?.replace("spell", "")) || 0

            // get point cost of spell level
            spellCost = VSpellPointsCalcs.getSpellPointCost(spellLevel)
            VSpellPoints.log("spelllevel: " + spellLevel, "spellCost: " + spellCost, "currentPoint: " + actorResources?.points?.value, "maxSpellLevel: " + actorResources?.maxLevel)
            if (spellLevel >= usesSpellLevel) VSpellPoints.log(`usesRemaining-${spellLevelStr}: ` + actorResources?.uses[spellLevelStr]?.value ?? 0)

            // error if no or not enough spell points are left, or if level is too high, or if uses remaining
            currentNotOk = !spellCost || !actorResources?.points?.value || actorResources?.points?.value < spellCost
            spellLevelNotOk = !spellLevel || !actorResources?.maxLevel || spellLevel > actorResources?.maxLevel;
            noUsesRemaining = spellLevel >= usesSpellLevel ? actorResources?.uses[spellLevelStr]?.value === 0 : false
        }

        VSpellPoints.log(`Enough points: ${!currentNotOk}, level ok: ${!spellLevelNotOk}, uses ok: ${!noUsesRemaining}`)

        // show error
        const id = this.data.data;
        if (currentNotOk || spellLevelNotOk || noUsesRemaining) {
            // TODO: localize
            // const label = game.i18n.localize(spellLevelStr === "pact" ? "DND5E.SpellProgPact" : `DND5E.SpellLevel${id.level}`);
            // ui.notifications.warn(game.i18n.format("DND5E.SpellCastNoSlots", {name: this.name, level: label}));

            if (currentNotOk) ui.notifications.warn(`You don't have enough spell points to cast ${this.name}`);
            else if (spellLevelNotOk) ui.notifications.warn(`The spell level of ${this.name} is too high`);
            else if (noUsesRemaining) ui.notifications.warn(`You have no uses left for level ${spellLevel} spells`);
            else ui.notifications.warn(`You can't cast ${this.name} at level ${spellLevel} right now`);

            return false;
        }

        // if can be cast: use spell points
        // => adjust oldUpdate data to include the new current spellpoints
        oldUpdate.actorUpdates[`${VSpellPoints.resourcesPath()}.points.value`] = Math.max((actorResources?.points?.value ?? 0) - spellCost, 0);

        // update uses of the spell
        if (spellLevel >= usesSpellLevel) oldUpdate.actorUpdates[`${VSpellPoints.resourcesPath()}.uses.${spellLevelStr}.value`] = (actorResources?.uses[spellLevelStr]?.value ?? 0) - 1
        return oldUpdate;
    }
}