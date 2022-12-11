// import { Base64 } from "https://cdn.jsdelivr.net/npm/js-base64@3.7.2/base64.mjs";

class EtuneSharedCompendium {
  static SETTINGS = {
    TOKEN: "github-token",
  };

  static ID = "etune-shared-compendium";

  static log(force, ...args) {
    const shouldLog =
      force ||
      game.modules.get("_dev-mode")?.api?.getPackageDebugValue(this.ID);

    if (shouldLog) {
      console.log(this.ID, "|", ...args);
    }
  }

  static initialize() {
    game.settings.register(
      EtuneSharedCompendium.ID,
      EtuneSharedCompendium.SETTINGS.TOKEN,
      {
        name: "Token",
        default: "",
        type: String,
        scope: "client",
        config: true,
        hint: "Token de Github para poder subir cambios al repositorio.",
      }
    );
  }

  static _inject(compendium, buttons) {
    if (!game.user.isGM) return;
    if (compendium.title != "Etune actors") return;

    buttons.unshift({
      label: "Update Etune",
      class: "text1",
      icon: "fas fa-download",
      onclick: async () => {
        await EtuneSharedCompendiumLogic.pull();
      },
    });

    if (
      game.settings.get(
        EtuneSharedCompendium.ID,
        EtuneSharedCompendium.SETTINGS.TOKEN
      ) != ""
    ) {
      buttons.unshift({
        label: "Push to Etune",
        class: "text2",
        icon: "fas fa-upload",
        onclick: async () => {
          await EtuneSharedCompendiumLogic.push();
        },
      });
    }
  }

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

  // Actor.deleteDocuments(["et87x2QPO6nSkYCZ"], {pack: "etune-shared-compendium.actors"})
}

class EtuneRewards {
  static SERVER_URL = "http://localhost:8000/";
  static REWARDS_PER_LEVEL = {
    1: 250,
    2: 250,
    3: 250,
    4: 250,
    5: 400,
    6: 400,
    7: 400,
    8: 400,
    9: 400,
    10: 400,
    11: 550,
    11: 550,
    11: 550,
    11: 550,
    11: 550,
    11: 550,
    17: 700,
    18: 700,
    19: 700,
    20: 700,
  }

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

    if(responseJson.length != 0) {
      let reward = {
        ACPs: 0,
        TCPs: 0,
        money: 0,
      };
  
      responseJson.forEach((element) => {
        if(element.money) {
          reward.money = reward.money + 1;
        }
        reward.ACPs = reward.ACPs + element.time_played;
        reward.TCPs =
          reward.TCPs + element.time_played + (element.soul_stone ? 0 : 60);
      });
  
      let addedXP =
        actorSheet5eCharacter.actor.system.details.xp.value + reward.ACPs;
      let addedTCPs =
        actorSheet5eCharacter.actor.system.currency.tcp + reward.TCPs;
      let addedCps =
          actorSheet5eCharacter.actor.system.currency.tcp + reward.TCPs;
  
      await actorSheet5eCharacter.actor.update({
        "system.details.xp.value": addedXP,
      });
      await actorSheet5eCharacter.actor.update({
        "system.currency.tcp": addedTCPs,
      });
      await actorSheet5eCharacter.actor.update({
        "system.currency.cp": addedCps,
      });
      
      if(reward.ACPs > 0 || reward.TCPs > 0) {
        ui.notifications.info(`Has obtenido | XP: ${reward.ACPs} | TCPs: ${reward.TCPs} |`);  
      } else if(reward.money > 0) {

      }
      
    } else {
      ui.notifications.info("No hay recompensas esperándote :(");
    }

    
  }
}

class EtuneSharedCompendiumLogic {
  static ACTORS_COMPENDIUM_NAME = "etune-shared-compendium.actors";

  static async pull() {
    this._deleteSharedCompendiumData(this.ACTORS_COMPENDIUM_NAME);
    const actors =
      await EtuneSharedCompendiumGithubFacade.getActorsJsonsNoAPI();
    this._populateSharedCompendium(actors, this.ACTORS_COMPENDIUM_NAME);
  }

  static async push() {
    const actors = await this._getDataFromCompendium(
      this.ACTORS_COMPENDIUM_NAME
    );

    for (let actor of actors) {
      await EtuneSharedCompendiumGithubFacade.pushActor(await actor);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  static async _getDataFromCompendium(compendiumName) {
    const pack = await game.packs.get(compendiumName);
    return await pack.index.map(async (i) => await pack.getDocument(i._id));
  }

  static async _deleteSharedCompendiumData(compendiumName) {
    const pack = game.packs.get(compendiumName);
    const ids = pack.index.map((i) => i._id);
    await Actor.deleteDocuments(ids, { pack: compendiumName });
  }

  static async _populateSharedCompendium(objects, compendiumName) {
    objects.forEach(async (element) => {
      const actor = await Actor.create(element, {
        pack: compendiumName,
      });
    });
  }
}

class EtuneSharedCompendiumGithubFacade {
  static REPO_URL =
    "https://api.github.com/repos/EtuneDnD/etune-shared-compendium-db/contents/actors/";

  static async pushActor(actor5e) {
    let actorFile = await this.getActorFileAPI(actor5e.name);

    let sha = null;

    if (actorFile != null) {
      sha = actorFile.sha;
    }

    await this.updateActorFileAPI(sha, actor5e);
  }

  static async getAvailableActorsNamesAPI() {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/vnd.github.v3.raw");

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetch(
      "https://api.github.com/repos/EtuneDnD/etune-shared-compendium-db/contents/actors",
      requestOptions
    );

    const responseJson = await response.json();

    return responseJson
      .filter((element) => element.name != "README.md")
      .map((element) => element.name);
  }

  static async getActorsJsonsNoAPI() {
    let actorsJsonArray = [];
    const actorsDbUrl =
      "https://raw.githubusercontent.com/EtuneDnD/etune-shared-compendium-db/main/actors/";
    const actorNames = await this.getAvailableActorsNamesAPI();

    for (let actorName of actorNames) {
      const response = await fetch(`${actorsDbUrl}${actorName}`);
      let jsonResponse = await response.json();
      actorsJsonArray.push(jsonResponse);
    }

    return actorsJsonArray;
  }

  static async getActorFileAPI(actorName) {
    let requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    try {
      let response = await fetch(
        this.REPO_URL + this.formatActorName(actorName) + ".json",
        requestOptions
      );

      if (response.ok) {
        let actorJson = await response.json();
        return actorJson;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  static async updateActorFileAPI(sha, actor5e) {
    let Base64 = {
      // private property
      _keyStr:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

      // public method for encoding
      encode: function (input) {
        let output = "";
        let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        let i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;

          if (isNaN(chr2)) {
            enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
            enc4 = 64;
          }

          output =
            output +
            this._keyStr.charAt(enc1) +
            this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) +
            this._keyStr.charAt(enc4);
        }
        return output;
      },

      // public method for decoding
      decode: function (input) {
        let output = "";
        let chr1, chr2, chr3;
        let enc1, enc2, enc3, enc4;
        let i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {
          enc1 = this._keyStr.indexOf(input.charAt(i++));
          enc2 = this._keyStr.indexOf(input.charAt(i++));
          enc3 = this._keyStr.indexOf(input.charAt(i++));
          enc4 = this._keyStr.indexOf(input.charAt(i++));

          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;

          output = output + String.fromCharCode(chr1);

          if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
          }
          if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
          }
        }

        output = Base64._utf8_decode(output);

        return output;
      },

      // private method for UTF-8 encoding
      _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        let utftext = "";

        for (let n = 0; n < string.length; n++) {
          let c = string.charCodeAt(n);

          if (c < 128) {
            utftext += String.fromCharCode(c);
          } else if (c > 127 && c < 2048) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
          } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
          }
        }
        return utftext;
      },

      // private method for UTF-8 decoding
      _utf8_decode: function (utftext) {
        let string = "";
        let i = 0;
        let c = (c1 = c2 = 0);

        while (i < utftext.length) {
          c = utftext.charCodeAt(i);

          if (c < 128) {
            string += String.fromCharCode(c);
            i++;
          } else if (c > 191 && c < 224) {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
          } else {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(
              ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
            );
            i += 3;
          }
        }
        return string;
      },
    };

    let myHeaders = new Headers();

    const bearerToken = game.settings.get(
      EtuneSharedCompendium.ID,
      EtuneSharedCompendium.SETTINGS.TOKEN
    );

    myHeaders.append("Authorization", bearerToken);
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
      message:
        "Updating actors collection by " + game.users.get(game.userId).name,
      sha: sha,
      content: Base64.encode(JSON.stringify(actor5e, null, 4)),
    });

    let requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    await fetch(
      this.REPO_URL + this.formatActorName(actor5e.name) + ".json",
      requestOptions
    );
  }

  static formatActorName(actorName) {
    return actorName.replace(" ", "-").toLowerCase();
  }
}

Hooks.on("getCompendiumHeaderButtons", EtuneSharedCompendium._inject);
Hooks.on(
  "getActorSheet5eCharacterHeaderButtons",
  EtuneSharedCompendium._injectRewards
);
Hooks.once("init", EtuneSharedCompendium.initialize);
