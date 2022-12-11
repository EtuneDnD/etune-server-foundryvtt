# etune-shared-compendium

# What is etune-shared-compendium?
Etune Shared Compendium is a mod that synchronizes several Foundry Instances through a Git Repository. Thought for communities with several Dungeon Masters to share always the latest updated changes of their players' characters sheet.

# Pre-Requisites
1. You need will a GitHub account as you will need permissions to upload changes to the repo/database.
2. You need GIT installed in your machine:
    * [Git for Windows](https://github.com/git-for-windows/git/releases/download/v2.38.1.windows.1/Git-2.38.1-64-bit.exe)
    * [Git for MacOS](https://git-scm.com/download/mac)
    * [Git for Linux](https://git-scm.com/download/linux)
3. You need Node:
    * [Node installation for any OS](https://nodejs.org/en/download/)
   
# How to install this mod
1. Click on the `code` button and click on download zip.

![image](https://user-images.githubusercontent.com/25609497/198889217-e85ff255-2c86-482d-9ba7-e74d9fb516d6.png)

2. Once the zip is downloaded unzip it into your modules folder in your Foundry Data Folder.
    * Default Windows folder location `%localappdata%/FoundryVTT/Data/modules` (Press WIN + R and paste this path, then press enter)
    * Default MacOS folder location `~/Library/Application Support/FoundryVTT/Data/modules`
    * Default Linux folder locations:
        * `/home/$USER/.local/share/FoundryVTT/Data/modules`
        * `/home/$USER/FoundryVTT/Data/modules`
        * `/local/FoundryVTT/Data/modules`

> WARNING: You should unzip it always inside a folder

![image](https://user-images.githubusercontent.com/25609497/198891881-d4776fa7-c78b-4de9-837d-ed73cf004add.png)

# How to use this mod
1. Start the Git Server by going into the `etune-shared-compendium` module folder placed in the modules folder described in step 2 and double click on:
   * `start-git-server.bat` if you are on Windows
   * `start-git-server.sh` if you are on MacOS or Linux
   
   A terminal will appear, don't close it, this is the server, just ignore it.
   
2. Activate the mod in your FoundryVTT as any normal mod.

3. Now this icon should appear:
   
   ![image](https://user-images.githubusercontent.com/25609497/198892295-343de5ea-c3d1-4e9c-9b75-75e314f1141c.png)
   
   If you click on this icon a sub menu will appear with 2 more icons:
   
   ![image](https://user-images.githubusercontent.com/25609497/198892480-fa760643-ffd8-48bd-bb43-773719eaaa83.png)
   
   The first one is the upload **button** and the second one is the **download** button. Press the download button to get the last changes.
   
4. You should find a new compendium called `Etune actors`.

   ![image](https://user-images.githubusercontent.com/25609497/198892572-7eb01621-7ce6-43d6-b8b4-c9695d9094e3.png)
   
5. Open the compendium and import the desired actor to your world:
   
   ![image](https://user-images.githubusercontent.com/25609497/198893049-b76c60d1-fe48-4593-b68b-c376c80b3533.png)
   
6. Now it should already exist under your Actors tab:
   
   ![image](https://user-images.githubusercontent.com/25609497/198893140-bf459e62-0db5-4740-8a72-9f1b34225cd2.png)

7. Play your session as usual but with the newly imported character. 
8. At the end of your session just open again the compendium `Etune actors`, delete the actor from the compendium and add the actor that you used for this session to the compendium.
9. Then push the upload button:

   ![image](https://user-images.githubusercontent.com/25609497/198893777-4b8906a6-183e-45a2-bc0c-167d3f5c355f.png)

