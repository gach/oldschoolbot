import { CommandStore, KlasaMessage } from 'klasa';
import { cleanString } from 'oldschooljs/dist/util';

import { BotCommand } from '../../lib/BotCommand';
import pets from '../../lib/data/pets';
import { roll } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			oneAtTime: true,
			description: 'Rolls a singular pet until you get it and shows the KC/Rolls',
			usage: '<petName:str>',
			examples: ['+pet smolcano', '+pet hunter'],
			categoryFlags: ['fun', 'simulation']
		});
	}

	async run(msg: KlasaMessage, [petName]: [string]) {
		const cleanName = cleanString(petName);

		const pet = pets.find(
			_pet => cleanString(_pet.name) === cleanName || _pet.altNames.includes(cleanName)
		);
		if (!pet) return msg.send("I don't recognize that pet!");

		let count = 0;
		let hasPet = false;
		while (!hasPet) {
			count++;
			if (roll(pet.chance)) hasPet = true;
		}

		return msg.send(pet.formatFinish(count));
	}
}
