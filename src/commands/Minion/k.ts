import { MessageAttachment } from 'discord.js';
import { calcWhatPercent, increaseNumByPercent, objectKeys, reduceNumByPercent, round } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import {Activity, Time} from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { AttackStyles, resolveAttackStyles } from '../../lib/minions/functions';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { calcPOHBoosts } from '../../lib/poh';
import { getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { Monsters } from 'oldschooljs';
import MonsterAttribute from 'oldschooljs/dist/meta/monsterData';

import findMonster, {
	addArrayOfNumbers,
	formatDuration,
	isWeekend,
	itemNameFromID,
	randomVariation,
	removeDuplicatesFromArray
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';
import {SkillsEnum} from "../../lib/skilling/types";
import {UserSettings} from "../../lib/settings/types/UserSettings";
import {SlayerTaskUnlocksEnum} from "../../lib/slayer/slayerUnlocks";

const validMonsters = killableMonsters.map(mon => mon.name).join(`\n`);
const invalidMonsterMsg = (prefix: string) =>
	`That isn't a valid monster.\n\nFor example, \`${prefix}minion kill 5 zulrah\`` +
	`\n\nTry: \`${prefix}k --monsters\` for a list of killable monsters.`;

const { floor } = Math;

function applySkillBoost(
	user: KlasaUser,
	duration: number,
	styles: AttackStyles[]
): [number, string] {
	const skillTotal = addArrayOfNumbers(styles.map(s => user.skillLevel(s)));

	let newDuration = duration;
	let str = '';
	let percent = round(calcWhatPercent(skillTotal, styles.length * 99), 2);

	if (percent < 50) {
		percent = 50 - percent;
		newDuration = increaseNumByPercent(newDuration, percent);
		str = `-${percent.toFixed(2)}% for low stats`;
	} else {
		percent = Math.min(15, percent / 6.5);
		newDuration = reduceNumByPercent(newDuration, percent);
		str = `${percent.toFixed(2)}% for stats`;
	}

	return [newDuration, str];
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to kill monsters.'
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		const { minionName } = msg.author;

		const boosts = [];
		let messages: string[] = [];

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		if (msg.flagArgs.monsters) {
			return msg.channel.send(
				new MessageAttachment(Buffer.from(validMonsters), 'validMonsters.txt')
			);
		}
		if (!name) return msg.channel.send(invalidMonsterMsg(msg.cmdPrefix));
		const monster = findMonster(name);
		if (!monster) return msg.channel.send(invalidMonsterMsg(msg.cmdPrefix));

		const usersTask = await getUsersCurrentSlayerInfo(msg.author.id);
		const isOnTask =
			usersTask.assignedTask !== null &&
			usersTask.currentTask !== null &&
			usersTask.assignedTask.monsters.includes(monster.id);

		if (monster.slayerOnly && !isOnTask) {
			return msg.channel.send(
				`You can't kill ${monster.name}, because you're not on a slayer task.`
			);
		}

		// Check requirements
		const [hasReqs, reason] = msg.author.hasMonsterRequirements(monster);
		if (!hasReqs) throw reason;

		let [timeToFinish, percentReduced] = reducedTimeFromKC(
			monster,
			msg.author.getKC(monster.id)
		);

		const [, osjsMon, attackStyles ] = resolveAttackStyles(msg.author, monster.id);
		const [newTime, skillBoostMsg] = applySkillBoost(msg.author, timeToFinish, attackStyles);

		timeToFinish = newTime;
		boosts.push(skillBoostMsg);

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for KC`);

		if (monster.pohBoosts) {
			const [boostPercent, messages] = calcPOHBoosts(
				await msg.author.getPOH(),
				monster.pohBoosts
			);
			if (boostPercent > 0) {
				timeToFinish = reduceNumByPercent(timeToFinish, boostPercent);
				boosts.push(messages.join(' + '));
			}
		}

		for (const [itemID, boostAmount] of Object.entries(
			msg.author.resolveAvailableItemBoosts(monster)
		)) {
			timeToFinish *= (100 - boostAmount) / 100;
			boosts.push(`${boostAmount}% for ${itemNameFromID(parseInt(itemID))}`);
		}

		const maxTripLength = msg.author.maxTripLength(Activity.MonsterKilling);

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = floor(maxTripLength / timeToFinish);
		}
		if (typeof quantity !== 'number') quantity = parseInt(quantity);
		if (isOnTask) {
			// Todo: Probably handle this in a separate function to make everything easier.
			let effectiveQtyRemaining = usersTask.currentTask!.quantityRemaining;
			if (
				monster.id === Monsters.KrilTsutsaroth.id
				&& usersTask.currentTask!.monsterID !== Monsters.KrilTsutsaroth.id
			) {
				effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 2);
			} else if (
				monster.id === Monsters.Kreearra.id
				&& usersTask.currentTask!.monsterID !== Monsters.Kreearra.id
			) {
				effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 4);
			} else if (
				monster.id === Monsters.GrotesqueGuardians.id
				&& msg.author.settings
					.get(UserSettings.Slayer.SlayerUnlocks)
					.includes(SlayerTaskUnlocksEnum.DoubleTrouble)
			) {
				effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 2);
			}
			quantity = Math.min(quantity, effectiveQtyRemaining);
		}

		// Dragonbane, in the worst way possible. We need to add dragonbane to monsters.
		// Removed vorkath because he has a special boost.
/*		if (
			monster.name.toLowerCase().includes('dragon')
			|| monster.name.toLowerCase() === 'drake'
			|| monster.name.toLowerCase().includes('hydra')
			|| monster.name.toLowerCase() === ('wyrm')
			|| monster.name.toLowerCase().includes('wyvern')
		) {

 */
		if (osjsMon?.data?.attributes?.includes(MonsterAttribute.Dragon))
		{
			if (
				msg.author.hasItemEquippedOrInBank('Dragon hunter lance')
				&& !attackStyles.includes(SkillsEnum.Ranged)
				&& !attackStyles.includes(SkillsEnum.Magic)
			) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				boosts.push('15% for Dragon hunter lance');
			} else if (
				msg.author.hasItemEquippedOrInBank('Dragon hunter crossbow')
				&& attackStyles.includes(SkillsEnum.Ranged)
			) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				boosts.push('15% for Dragon hunter crossbow');
			}
		}
		// Add 15% slayer boost on task if they have black mask or similar
		if (attackStyles.includes(SkillsEnum.Ranged) || attackStyles.includes(SkillsEnum.Magic)) {
			if (isOnTask && msg.author.hasItemEquippedOrInBank(itemID('Black mask (i)'))) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				boosts.push('15% for Black mask (i) on non-melee task');
			}
		} else {
			if (isOnTask && msg.author.hasItemEquippedOrInBank(itemID('Black mask'))) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				boosts.push('15% for Black mask on melee task');
			}
		}

		// Check food
		let foodStr: undefined | string = undefined;
		if (monster.healAmountNeeded && monster.attackStyleToUse && monster.attackStylesUsed) {
			const [healAmountNeeded, foodMessages] = calculateMonsterFood(monster, msg.author);
			messages = messages.concat(foodMessages);

			const [result] = await removeFoodFromUser({
				client: this.client,
				user: msg.author,
				totalHealingNeeded: healAmountNeeded * quantity,
				healPerAction: Math.ceil(healAmountNeeded / quantity),
				activityName: monster.name,
				attackStylesUsed: removeDuplicatesFromArray([
					...objectKeys(monster.minimumGearRequirements ?? {}),
					monster.attackStyleToUse
				]),
				learningPercentage: percentReduced
			});

			foodStr = result;
		}

		let duration = timeToFinish * quantity;
		if (duration > maxTripLength) {
			return msg.send(
				`${minionName} can't go on PvM trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount you can do for ${
					monster.name
				} is ${floor(maxTripLength / timeToFinish)}.`
			);
		}

		duration = randomVariation(duration, 3);

		if (isWeekend()) {
			boosts.push(`10% for Weekend`);
			duration *= 0.9;
		}

		// Todo add a new 'recurring cost' field to the KillableMonster that loops and does this.
		// Needs some thinking, because it needs to have 1 per qty, and then timed ones.
		// Remove antidote++(4) from hydras + alchemical hydra
		if (['hydra','alchemical hydra'].includes(monster.name.toLowerCase())) {
			const potsTotal = await msg.author.numberOfItemInBank(itemID('Antidote++(4)'));
			//Potions actually last 36+ minutes for a 4-dose, but we want item sink
			const potsToRemove = Math.ceil(duration / (15 * Time.Minute));
			if (potsToRemove > potsTotal) {
				return msg.channel.send(
					`You don't have enough Antidote++(4) to kill ${quantity}x ${monster.name}.`
				);
			}
			await msg.author.removeItemFromBank(itemID('Antidote++(4)'), potsToRemove);
		}
		// Check for enough totems and remove them
		if (monster.name.toLowerCase() === 'skotizo') {
			const darkTotemsInBank = await msg.author.numberOfItemInBank(itemID('Dark totem'));
			if (quantity > darkTotemsInBank) {
				return msg.channel.send(
					`You don't have enough Dark totems to kill ${quantity}x Skotizo.`
				);
			}
			await msg.author.removeItemFromBank(itemID('Dark totem'), quantity);
		}
		// Check for enough giant keys and remove them
		if (monster.name.toLowerCase() === 'obor') {
			const costQtyBank = await msg.author.numberOfItemInBank(itemID('Giant key'));
			if (quantity > costQtyBank) {
				return msg.channel.send(
					`You don't have enough Giant keys to kill ${quantity}x Obor.`
				);
			}
			await msg.author.removeItemFromBank(itemID('Giant key'), quantity);
		}
		// Check for enough mossy keys and remove them
		if (monster.name.toLowerCase() === 'bryophyta') {
			const costQtyBank = await msg.author.numberOfItemInBank(itemID('Mossy key'));
			if (quantity > costQtyBank) {
				return msg.channel.send(
					`You don't have enough Mossy keys to kill ${quantity}x Bryophyta.`
				);
			}
			await msg.author.removeItemFromBank(itemID('Mossy key'), quantity);
		}

		await addSubTaskToActivityTask<MonsterActivityTaskOptions>(this.client, {
			monsterID: monster.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.MonsterKilling
		});

		let response = `${minionName} is now killing ${quantity}x ${
			monster.name
		}, it'll take around ${formatDuration(
			duration
		)} to finish. Attack styles used: ${attackStyles.join(', ')}.`;
		if (foodStr) {
			response += ` Removed ${foodStr}.\n`;
		}

		if (boosts.length > 0) {
			response += `\n**Boosts:** ${boosts.join(', ')}.`;
		}

		if (messages.length > 0) {
			response += `\n**Messages:** ${messages.join('\n')}.`;
		}

		return msg.send(response);
	}
}
