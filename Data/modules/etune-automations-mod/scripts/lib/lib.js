// import { Base64 } from "https://cdn.jsdelivr.net/npm/js-base64@3.7.2/base64.mjs";

class EtuneAutomations {
  static SETTINGS = {
    TOKEN: "github-token",
  };

  static ID = "etune-automations";

  static async _injectRewards(actorSheet5eCharacter, buttons) {
    buttons.unshift({
      label: "Rewards",
      class: "text1",
      icon: "fas fa-gift",
      onclick: async () => {
        await EtuneRewards.getRewards(actorSheet5eCharacter);
      },
    });
  }

  static _checkActorNameExists(actor5e) {
    if(game.actors.find(e => e.name.toLowerCase() === actor5e.name.toLowerCase()) !== undefined) {
      ui.notifications.info(`El nombre ${actor5e.name.toUpperCase()} ya está elegido por otro usuario`);
      return false;
    }
    if(!/^[a-zA-Z]+$/.test(actor5e.name) || actor5e.name.icludes(" ")){
      ui.notifications.info(`Elige un nombre que solo contenga una palabra y letras`);
      return false;
    }
    if(actor5e.name. length > 100){
      ui.notifications.info(`Elige un nombre más corto.`);
      return false;
    }
  }
}

class EtuneRewards {
  static SERVER_URL = "http://localhost:8000/";

  static async checkRewards(actorSheet5eCharacter) {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    let response = await fetch(
      `${EtuneRewards.SERVER_URL}has-rewards?character_name=${actorSheet5eCharacter.actor.name}`,
      requestOptions
    );
    let responseJson = await response.json();

    return responseJson["has_rewards_available"];
  }

  static async getRewards(actorSheet5eCharacter) {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    let response = await fetch(
      `${EtuneRewards.SERVER_URL}rewards?character_name=${actorSheet5eCharacter.actor.name}`,
      requestOptions
    );
    let responseJson = await response.json();

    if (responseJson.length != 0) {
      let reward = {
        ACPs: 0,
        TCPs: 0,
        money: 0,
      };

      responseJson.forEach((element) => {
        reward.ACPs = reward.ACPs + element.time_played;
        reward.TCPs =
          reward.TCPs + element.time_played + (element.soul_stone ? 0 : 60);
        reward.money = reward.money + element.money;
      });

      let addedXP =
        actorSheet5eCharacter.actor.system.details.xp.value + reward.ACPs;
      let addedTCPs =
        actorSheet5eCharacter.actor.system.currency.tcp + reward.TCPs;
      let addedCps =
        actorSheet5eCharacter.actor.system.currency.cp + reward.money;

      await actorSheet5eCharacter.actor.update({
        "system.details.xp.value": addedXP,
      });
      await actorSheet5eCharacter.actor.update({
        "system.currency.tcp": addedTCPs,
      });
      await actorSheet5eCharacter.actor.update({
        "system.currency.cp": addedCps,
      });

      ui.notifications.info(
        `Has obtenido | XP: ${reward.ACPs} | TCPs: ${reward.TCPs} | CPs: ${reward.money}`
      );
    } else {
      ui.notifications.info("No hay recompensas esperándote :(");
    }
  }
}

class EtuneChecks {
  
}

Hooks.on(
  "getActorSheet5eCharacterHeaderButtons",
  EtuneAutomations._injectRewards
);

Hooks.on(
  "preCreateActor",
  EtuneAutomations._checkActorNameExists
);
 