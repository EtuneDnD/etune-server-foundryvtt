import { info } from "./lib/lib.js";
export const ResetDoorsAndFog = {
    resetDoorsAndFog: async function (isCurrentScene, id) {
        await ResetDoorsAndFog.resetDoors(isCurrentScene, id);
        await ResetDoorsAndFog.resetFog(isCurrentScene, id);
    },
    resetDoors: async function (isCurrentScene, id) {
        const updates = [];
        if (isCurrentScene) {
            const wallsToUpdate = 
            //@ts-ignore
            canvas.walls?.doors.filter((wall) => wall.document.ds === 1);
            for (let i = 0; i < wallsToUpdate.length; i++) {
                const doorControl = wallsToUpdate[i];
                updates.push({ _id: doorControl.id, ds: 0 });
            }
            await canvas.scene?.updateEmbeddedDocuments("Wall", updates);
        }
        else {
            if (id) {
                const scene = game.scenes?.get(id);
                const scenesToUpdate = 
                //@ts-ignore
                scene.data.walls.filter((wall) => wall.document.ds === 1);
                for (let i = 0; i < scenesToUpdate.length; i++) {
                    const sceneToUpdate = scenesToUpdate[i];
                    updates.push({ _id: sceneToUpdate.id, ds: 0 });
                }
                await scene.updateEmbeddedDocuments("Wall", updates);
            }
        }
        info(`Doors have been shut.`, true);
    },
    resetFog: async function (isCurrentScene, id) {
        if (isCurrentScene) {
            // canvas.sight?.resetFog();
            //@ts-ignore
            canvas.fog.reset();
        }
        else {
            if (id) {
                await SocketInterface.dispatch("modifyDocument", {
                    type: "FogExploration",
                    action: "delete",
                    data: { scene: id },
                    options: { reset: true },
                    parentId: "",
                    parentType: "",
                });
                info(`Fog of War exploration progress was reset.`, true);
            }
        }
    },
    getContextOption: function (idField) {
        return {
            name: "Reset Doors & Fog",
            icon: '<i class="fas fa-dungeon"></i>',
            condition: (li) => {
                return game.user?.isGM;
            },
            callback: async (li) => {
                let scene;
                if (idField) {
                    scene = game.scenes?.get(li.data(idField));
                }
                else {
                    scene = game.scenes?.get(li.data("entityId"));
                    if (!scene) {
                        scene = game.scenes?.get(li.data("documentId"));
                    }
                }
                if (!scene) {
                    return;
                }
                const isCurrentScene = scene.id === canvas.scene?.id;
                await ResetDoorsAndFog.resetDoorsAndFog(isCurrentScene, scene.id);
            },
        };
    },
};
