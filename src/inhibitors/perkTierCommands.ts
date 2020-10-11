import { Command, Inhibitor, InhibitorStore, KlasaMessage } from 'klasa';

import getUsersPerkTier from '../lib/util/getUsersPerkTier';

export default class extends Inhibitor {
	public constructor(store: InhibitorStore, file: string[], directory: string) {
		super(store, file, directory);
	}

	public async run(msg: KlasaMessage, command: Command) {
		if (!command.perkTier) return;

		if (getUsersPerkTier(msg.author) < command.perkTier) {
			throw `You need to be a tier ${command.perkTier - 1} patron to use this command. You can become this patron tier at https://www.patreon.com/oldschoolbot`;
		}

		return false;
	}
}
