const moduleID = 'fail-save-lrmtfy-midi';

let rollMethodMap;
let failRoll;


Hooks.once('setup', async () => {

    rollMethodMap = {
        'lmrtfy-ability-check': CONFIG.Actor.documentClass.prototype.rollAbilityTest,
        'lmrtfy-ability-save': CONFIG.Actor.documentClass.prototype.rollAbilitySave,
        'lmrtfy-skill-check': CONFIG.Actor.documentClass.prototype.rollSkill
    };

    failRoll = await new Roll('-1').roll();
});


Hooks.on('renderLMRTFYRoller', (app, html, data) => {
    const buttons = Array.from(html[0].getElementsByTagName('button'));
    
    for (const button of buttons) {
        const lmrtfyClass = button.classList[0];
        const rollMethod = rollMethodMap[lmrtfyClass];
        if (!rollMethod) continue;

        const failButton = document.createElement('button');
        failButton.classList.add(lmrtfyClass);
        failButton.type = 'button';
        failButton.style.color = 'red';
        failButton.innerText = 'FAIL ' + button.innerText;
        failButton.addEventListener('click', ev => {
            failButton.disabled = true;
            button.disabled = true;
            for (const actor of app.actors) {
                const ablSkl = button.dataset.ability || button.dataset.skill;
                Hooks.once('preCreateChatMessage', (message, data, options, userID) => {
                    const chatData = foundry.utils.deepClone(data);
                    chatData.roll = failRoll;
                    chatData.content = '-1';
                    chatData.flags['lmrtfy'] = {
                        message: app.data.message,
                        data: app.data.attach
                    };

                    ChatMessage.create(chatData);

                    return false;
                });
                rollMethod.call(actor, ablSkl, { fastForward: true })    
            }

            LMRTFYRoller.prototype._checkClose.call(app);
        });

        button.addEventListener('click', ev => {
            failButton.disabled = true;
        });
        button.after(failButton);
    }

    app.setPosition({ height: 'auto' });
});
