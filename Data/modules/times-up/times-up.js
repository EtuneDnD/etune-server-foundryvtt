/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module
 */
// Import TypeScript modules
import { registerSettings, effectQueue, fetchParams, fetchQueue, clearQueue } from './module/settings.js';
import { preloadTemplates } from './module/preloadTemplates.js';
import { initTimesUpSetup, readyTimesUpSetup, purgeDeletedActors, setupSocket } from './module/timeUpdates.js';
import { readyCombatSetup } from './module/combatUpdate.js';
import { initPatching } from './module/patching.js';
export let setDebugLevel = (debugText) => {
    debugEnabled = { "none": 0, "warn": 1, "debug": 2, "all": 3 }[debugText] || 0;
    // 0 = none, warnings = 1, debug = 2, all = 3
    if (debugEnabled >= 3)
        CONFIG.debug.hooks = true;
};
export var debugEnabled = 0;
// 0 = none, warnings = 1, debug = 2, all = 3
export let debug = (...args) => { if (debugEnabled > 1)
    console.log("DEBUG: times-up | ", ...args); };
export let log = (...args) => console.log("times-up | ", ...args);
export let warn = (...args) => { if (debugEnabled > 0)
    console.warn("times-up | ", ...args); };
export let error = (...args) => console.error("times-up | ", ...args);
export let i18n = key => {
    return game.i18n.localize(key);
};
/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
    console.log('times-up | Initializing times-up');
    initTimesUpSetup();
    // Assign custom classes and constants here
    // Register custom module settings
    registerSettings();
    // Preload Handlebars templates
    await preloadTemplates();
    initPatching();
});
/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
    // Do anything after initialization but before
    // ready
});
/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
export var dae;
Hooks.once('ready', function () {
    // Do anything once the module is ready
    registerSettings();
    fetchParams();
    fetchQueue();
    //@ts-ignore
    window.TimesUp = {
        effectQueue: () => { return effectQueue; },
        clearQueue: clearQueue,
        purgeDeletedActors: purgeDeletedActors
    };
    readyTimesUpSetup();
    readyCombatSetup();
    purgeDeletedActors();
    dae = globalThis.DAE;
    setupSocket();
});
// Add any additional hooks if necessary
