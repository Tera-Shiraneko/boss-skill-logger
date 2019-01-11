String.prototype.clr = function(hexColor) {return `<font color="#${hexColor}">${this}</font>`};

const SettingsUI = require('tera-mod-ui').Settings;
const format = require('./format.js');
const path = require('path');
const fs = require('fs');
const logfolder = path.join(__dirname, 'Bosslogs');

if (!fs.existsSync(logfolder)) fs.mkdirSync(logfolder);

module.exports = function Bosslogger(mod) {

    if (mod.proxyAuthor !== 'caali' || !global.TeraProxy)
        mod.warn('You are trying to use this module on an unsupported version of tera-proxy. It may not work as expected, and even if it does now it may break at any point in the future.');

    let createlog = false,
        bossid, bosshp;

    var stream;

    mod.command.add('logboss', () => {
        if (ui) {
            ui.show();
        } else {
            mod.settings.logboss = !mod.settings.logboss;
            mod.command.message(`Boss skill logger is now ${mod.settings.logboss ? "enabled" : "disabled"}.`);
        }
    });

    mod.command.add('logmessage', () => {
        if (ui) {
            ui.show();
        } else {
            mod.settings.logmessage = !mod.settings.logmessage;
            mod.command.message(`Message logger is now ${mod.settings.logmessage ? "enabled" : "disabled"}.`);
        }
    });

    mod.command.add('logabnormal', () => {
        if (ui) {
            ui.show();
        } else {
            mod.settings.logabnormal = !mod.settings.logabnormal;
            mod.command.message(`Abnormality logger is now ${mod.settings.logabnormal ? "enabled" : "disabled"}.`);
        }
    });

    mod.command.add('writelog', () => {
        if (ui) {
            ui.show();
        } else {
            mod.settings.writelog = !mod.settings.writelog;
            mod.command.message(`Log writing is now ${mod.settings.writelog ? "enabled" : "disabled"}.`);
        }
    });

    mod.command.add('createlog', () => {
        createlog = !createlog;
        togglemode();
        if (mod.settings.writelog && (mod.settings.logboss || mod.settings.logabnormal || mod.settings.logmessage)) {
            mod.command.message(`Logfile has been generated into the modules sub folder.`);
        }
        if (!mod.settings.logboss && !mod.settings.logabnormal && !mod.settings.logmessage) {
            mod.command.message(`Logfile cannot be created you need to activate some logging stuff first.`);
        }
        if (!mod.settings.writelog) {
            mod.command.message(`Logfile cannot be created you need to activate writelog function first.`);
        }
    });

    function togglemode() {
        if (mod.settings.writelog) {
            if (mod.settings.logboss || mod.settings.logabnormal || mod.settings.logmessage) {
                let filename = path.join(logfolder, Date.now() + '.js');
                stream = fs.createWriteStream(filename, {
                    flags: 'a'
                });
            } else {
                if (stream) {
                    try {
                        stream.end();
                    } catch (e) {
                        mod.log(e);
                    }
                }
            }
        }
    }

    mod.game.on('enter_game', () => {
        togglemode();
    });

    mod.game.on('leave_game', () => {
        if (stream) {
            try {
                stream.end();
            } catch (e) {
                mod.log(e);
            }
        }
    });

    mod.hook('S_BOSS_GAGE_INFO', 3, (event) => {
        bosshp = Math.floor((Number.parseInt(event.curHp) / Number.parseInt(event.maxHp)) * 10000) / 100;
        bossid = event.id;
    });

    mod.hook('S_DUNGEON_EVENT_MESSAGE', 2, (event) => {
        if (mod.settings.logmessage) {
            sendchat('Message: ' + `${event.message}`.clr('ff00e8') + '.');
        }
        if (mod.settings.writelog && mod.settings.logmessage) {
            stream.write(new Date().toLocaleTimeString() + ' |S_DUNGEON_EVENT_MESSAGE| >> ' + 'Message: ' + event.message + '.' + '\n');
        }
    });

    mod.hook('S_ABNORMALITY_BEGIN', 3, (event) => {
        if (!mod.settings.logabnormal || mod.settings.blacklist.includes(event.id)) return;
        if (event.target === bossid && (event.source === bossid || event.source === 0n) || mod.game.me.is(event.target) && event.source === bossid) {
            sendchat('Abnormality: ' + `${event.id}`.clr('00e8ff') + ' Stacks: ' + `${event.stacks}`.clr('00ffc5') + '.');
        }
        if (mod.settings.writelog && mod.settings.logabnormal) {
            if (event.target === bossid && (event.source === bossid || event.source === 0n) || mod.game.me.is(event.target) && event.source === bossid) {
                stream.write(new Date().toLocaleTimeString() + ' |S_ABNORMALITY_BEGIN| >> ' + 'Abnormality: ' + event.id + ' Stacks: ' + event.stacks + ' Source: ' + event.source + ' Target: ' + event.target + '.' + '\n');
            }
        }
    });

    mod.hook('S_ACTION_STAGE', 9, (event) => {
        if (!mod.settings.logboss || mod.game.me.is(event.gameId) || event.stage > 0) return;
        if (mod.settings.whitelist.includes(event.templateId)) {
            sendchat('Action Stage: ' + `${event.skill}`.clr('ffe800') + ' Skill ID: ' + `${event.skill.id}`.clr('ff8000') + ' Health: ' + `${bosshp}`.clr('17ff00') + '%' + '.');
        }
        if (mod.settings.writelog && mod.settings.logboss) {
            if (mod.settings.whitelist.includes(event.templateId)) {
                stream.write(new Date().toLocaleTimeString() + ' |S_ACTION_STAGE| >> ' + 'Boss ID: ' + event.gameId + ' Skill: ' + event.skill + ' ID: ' + event.id + ' Stage: ' + event.stage + ' Template ID: ' + event.templateId + ' Health: ' + bosshp + '.' + '\n');
            }
        }
    });

    function gettime() {
        var time = new Date();
        var timeStr = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + ":" + ("0" + time.getSeconds()).slice(-2);
        return timeStr;
    }

    function sendchat(msg) {
        mod.command.message(
            msg
        );
    }

    let ui = null;
    if (global.TeraProxy.GUIMode) {
        ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, {height: 285}, {alwaysOnTop: true});
        ui.on('update', settings => {mod.settings = settings;});

        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }
};
