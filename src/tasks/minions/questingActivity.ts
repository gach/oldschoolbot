import { KlasaMessage, Task } from 'klasa';

import { MAX_QP } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { QuestingActivityTaskOptions } from '../../lib/types/minions';
import { rand, roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run({ userID, channelID, duration }: QuestingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentQP = user.settings.get(UserSettings.QP);

		// This assumes you do quests in order of scaling difficulty, ~115 hours for max qp
		let qpRecieved = rand(1, 30);

		// The minion could be at (MAX_QP - 1) QP, but gain 4 QP here, so we'll trim that down from 4 to 1.
		if (currentQP + qpRecieved > MAX_QP) {
			qpRecieved -= currentQP + qpRecieved - MAX_QP;
		}

		let str = `${user}, ${
			user.minionName
		} finished questing, you received ${qpRecieved.toLocaleString()} QP. Your current QP is ${currentQP +
			qpRecieved}.`;

		const hasMaxQP = currentQP + qpRecieved >= MAX_QP;
		if (hasMaxQP) {
			str += `\n\nYou have achieved the maximum amount of ${MAX_QP} Quest Points!`;
		}

		await user.addQP(qpRecieved);

		if (roll(180)) {
			str += `\n<:zippy:749240799090180196> While you walk through the forest north of falador, a small ferret jumps onto your back and joins you on your adventures!`;
			user.addItemsToBank({ 10092: 1 });
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			hasMaxQP
				? undefined
				: res => {
						user.log(`continued trip of Questing.`);
						return this.client.commands.get('quest')!.run(res as KlasaMessage, []);
				  }
		);
	}
}
