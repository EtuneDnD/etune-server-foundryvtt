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

class Base64 {
  // private property
  static _keyStr =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  // public method for encoding
  encode = function (input) {
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
  };

  // public method for decoding
  decode = function (input) {
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
  };

  // private method for UTF-8 encoding
  _utf8_encode = function (string) {
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
  };

  // private method for UTF-8 decoding
  _utf8_decode = function (utftext) {
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
  };
}

Hooks.on("getCompendiumHeaderButtons", EtuneSharedCompendium._inject);
Hooks.once("init", EtuneSharedCompendium.initialize);
