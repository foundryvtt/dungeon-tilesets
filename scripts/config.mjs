
import constants from "./constants.mjs";
import Tileset from "./tileset.mjs"
import Generator from "./generator.mjs";

export default class DungeonTilesetsConfig extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "dungeon-generator-settings-form",
            template: constants.modulePath + '/templates/generator-config.html',
            classes: ["sheet"],
            width: 500,
            height: 200,
            closeOnSubmit: false,
            submitOnClose: true
        });
    }

    /**
     * Executes on form submission.
     *
     * @param {Event} event - the form submission event
     * @param {object} data - the form data
     * @memberof SettingsForm
     */
    async _updateObject(event, data) {
        console.log(data);
        const tileset = new Tileset("dungeon");
        const generator = new Generator(tileset);
        const configuration = generator.generate({ size: data.size });
        generator.commit(configuration);
    }
}