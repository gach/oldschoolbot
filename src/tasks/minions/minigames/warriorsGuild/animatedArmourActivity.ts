import { Task } from 'klasa';

import { Armours } from '../../../../commands/Minion/warriorsguild';
import { AnimatedArmourActivityTaskOptions } from '../../../../lib/types/minions';
import { resolveNameBank } from '../../../../lib/util';
import { handleTripFinish } from '../../../../lib/util/handleTripFinish';
import { MinigameIDsEnum } from './../../../../lib/minions/data/minigames';

export default class extends Task {
	async run({
		armourID,
		userID,
		channelID,
		quantity,
		duration
	}: AnimatedArmourActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const armour = Armours.find(armour => armour.name === armourID)!;

		const str = `${user}, ${user.minionName} finished killing ${quantity}x animated ${
			armour.name
		} armour and received ${quantity * armour.tokens}x Warrior guild tokens.`;

		user.incrementMinigameScore(MinigameIDsEnum.AnimatedArmour, quantity);

		await user.addItemsToBank(
			resolveNameBank({
				'Warrior guild token': quantity * armour.tokens
			}),
			true
		);

		handleTripFinish(this.client, user, channelID, str, res => {
			user.log(`continued trip of animated armor`);
			return this.client.commands.get('warriorsguild')!.run(res, [quantity, 'tokens']);
		});
	}
}
