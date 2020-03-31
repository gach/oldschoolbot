import { Inhibitor, KlasaMessage, Command } from 'klasa';
import { UserSettings } from '../lib/UserSettings';

export default class extends Inhibitor {
	public async run(msg: KlasaMessage, command: Command) {
		if (command.ironCantUse && msg.author.settings.get(UserSettings.Minion.Ironman)) {
			throw `Ironman players can't use this command.`;
		}
	}
}
