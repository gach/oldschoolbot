import { CommandStore, KlasaUser, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import { minionNotBusy } from '../../lib/minions/decorators';
import { GroupMonsterActivityTaskOptions, KillableMonster } from '../../lib/minions/types';
import { Activity, Tasks, Emoji } from '../../lib/constants';
import { rand, formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { reducedTimeForGroup, findMonster } from '../../lib/minions/functions';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<mass|party> [quantity:int] <monster:string> [users:...user]',
			usageDelim: ' ',
			cooldown: 5,
			oneAtTime: true,
			altProtection: true,
			subcommands: true
		});
	}

	calcDurQty(users: KlasaUser[], monster: KillableMonster, quantity: number | undefined) {
		const perKillTime = reducedTimeForGroup(users, monster);
		const maxQty = Math.floor(users[0].maxTripLength / (perKillTime + monster.respawnTime!));
		if (!quantity) quantity = maxQty;
		if (quantity > maxQty) {
			throw `The max amount of ${monster.name} this party can kill per trip is ${maxQty}.`;
		}
		const duration = maxQty * (perKillTime + monster.respawnTime!) - monster.respawnTime!;
		return [quantity, duration, perKillTime];
	}

	checkReqs(users: KlasaUser[], monster: KillableMonster) {
		// Check if every user has the requirements for this monster.
		for (const user of users) {
			const [hasReqs, reason] = user.hasMonsterRequirements(monster);
			if (!hasReqs && 1 < 0) {
				throw `${user.username} doesn't have the requirements for this monster: ${reason}`;
			}
		}
	}

	@minionNotBusy
	async mass(msg: KlasaMessage, [inputQuantity, monsterName]: [number | undefined, string]) {
		if (msg.author.id !== '157797566833098752') throw `deez nuts <:acHam:704315552809877524>`;
		const monster = findMonster(monsterName);
		if (!monster) throw `That monster doesn't exist!`;
		if (!monster.groupKillable) throw `This monster can't be killed in groups!`;

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 1,
			maxSize: 50,
			message: `${msg.author.username} is doing a ${monster.name} mass! Anyone can click the ${Emoji.Tick} reaction to join.`
		};

		const users = await msg.makePartyAwaiter(partyOptions);

		this.checkReqs(users, monster);

		const [quantity, duration, perKillTime] = this.calcDurQty(users, monster, inputQuantity);

		const data: GroupMonsterActivityTaskOptions = {
			monsterID: monster.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.GroupMonsterKilling,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + 1000,
			leader: msg.author.id,
			users: users.map(u => u.id)
		};

		await addSubTaskToActivityTask(this.client, Tasks.MonsterKillingTicker, data);
		for (const user of users) user.incrementMinionDailyDuration(duration);

		return msg.channel.send(
			`${partyOptions.leader.username}'s party (${users
				.map(u => u.username)
				.join(', ')}) is now off to kill ${quantity}x ${
				monster.name
			}. Each kill takes ${formatDuration(perKillTime)} instead of ${formatDuration(
				monster.timeToFinish
			)}, and waiting ${formatDuration(
				monster.respawnTime!
			)} between kills. - the total trip will take ${formatDuration(duration)}`
		);
	}

	@minionNotBusy
	async party(
		msg: KlasaMessage,
		[inputQuantity, monsterName, usersInput = []]: [number | undefined, string, KlasaUser[]]
	) {
		if (msg.author.id !== '157797566833098752') throw `deez nuts <:acHam:704315552809877524>`;
		const monster = findMonster(monsterName);
		if (!monster) throw `That monster doesn't exist!`;
		if (!monster.groupKillable) throw `This monster can't be killed in groups!`;

		if (usersInput.length === 0) throw `You need to invite some people to your party!`;
		if (usersInput.includes(msg.author)) {
			throw `You can't invite yourself to your own party!`;
		}

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			usersAllowed: usersInput.map(u => u.id),
			minSize: 1,
			maxSize: 50,
			message: `${msg.author.username} has invited ${usersInput.length} people to join their party to kill ${monster.name}! Click the ${Emoji.Tick} reaction to join.`
		};

		const users = await msg.makePartyAwaiter(partyOptions);

		this.checkReqs(users, monster);

		const [quantity, duration, perKillTime] = this.calcDurQty(users, monster, inputQuantity);

		const data: GroupMonsterActivityTaskOptions = {
			monsterID: monster.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.GroupMonsterKilling,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + 1000,
			leader: msg.author.id,
			users: users.map(u => u.id)
		};

		await addSubTaskToActivityTask(this.client, Tasks.MonsterKillingTicker, data);
		for (const user of users) user.incrementMinionDailyDuration(duration);

		return msg.channel.send(
			`${partyOptions.leader.username}'s party (${users
				.map(u => u.username)
				.join(', ')}) is now off to kill ${quantity}x ${
				monster.name
			}. Each kill takes ${formatDuration(perKillTime)} instead of ${formatDuration(
				monster.timeToFinish
			)}, and waiting ${formatDuration(
				monster.respawnTime!
			)} between kills. - the total trip will take ${formatDuration(duration)}`
		);
	}
}
