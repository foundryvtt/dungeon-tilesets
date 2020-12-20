/**
 * Provides functionality for interaction with module settings
 */
export class Settings {

    static get(setting) {
        return game.settings.get(mod, setting);
    }

    static set(setting, value) {
        game.settings.set(mod, setting, value);
    }

    /**
     * Registers all of the necessary game settings for the module
     */
    static registerSettings() {

        // game.settings.register(mod, "debugMode", {
        //     name: game.i18n.localize("VINO.SETTINGS.ShowDebugLogsName"),
        //     hint: game.i18n.localize("VINO.SETTINGS.ShowDebugLogsHint"),
        //     scope: 'client',
        //     config: true,
        //     type: Boolean,
        //     default: false
        // });
    }
}