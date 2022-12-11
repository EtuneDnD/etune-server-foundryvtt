export class EditOwnedItemEffects {
    static log(...args) {
        if (game.modules.get('_dev-mode')?.api?.getPackageDebugValue("midi-qol")) {
            console.log(this.MODULE_TITLE, '|', ...args);
        }
    }
}
EditOwnedItemEffects.MODULE_NAME = "dae";
EditOwnedItemEffects.MODULE_TITLE = "Dynamic Effects using Active Effects";
/*
Hooks.on("ready", async () => {

  // initialize item sheet hooks
  // EditOwnedItemEffectsItemSheet.init();
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  // registerPackageDebugFlag(EditOwnedItemEffects.MODULE_NAME);
});
*/ 
