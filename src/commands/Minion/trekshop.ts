import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Time } from '../../lib/constants';
import TrekShopItems, { TrekExperience } from '../../lib/data/buyables/trekBuyables';
import { rewardTokens } from '../../lib/minions/data/templeTrekking';
import { AddXpParams } from '../../lib/minions/types';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { percentChance, rand, reduceNumByPercent, stringMatches, toTitleCase } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<easy|medium|hard> [quantity:integer{1,2147483647}] <item:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true,
			aliases: ['ts'],
			categoryFlags: ['minion'],
			description: 'Allows you to redeem reward tokens from Temple Trekking.',
			examples: ['+ts easy bowstring', '+ts 5 hard herbs']
		});
	}

	async run(msg: KlasaMessage, [type = 'easy', quantity, name]: ['easy' | 'medium' | 'hard', number, string]) {
		const user = msg.author;
		await user.settings.sync(true);

		const userBank = user.bank();

		const specifiedItem = TrekShopItems.find(
			item =>
				stringMatches(name, item.name) ||
				(item.aliases && item.aliases.some(alias => stringMatches(alias, name)))
		);

		if (!specifiedItem) {
			return msg.send(
				`Item not recognized. Possible items: ${TrekShopItems.map(item => {
					return item.name;
				}).join(', ')}.`
			);
		}

		if (quantity === undefined) {
			quantity =
				type === 'easy'
					? userBank.amount(rewardTokens.easy)
					: type === 'medium'
					? userBank.amount(rewardTokens.medium)
					: userBank.amount(rewardTokens.hard);
		}

		let outItems = new Bank();

		let inItems = new Bank();

		let outXP: AddXpParams[] = [
			{
				skillName: SkillsEnum.Agility,
				amount: 0,
				minimal: true
			},
			{
				skillName: SkillsEnum.Thieving,
				amount: 0,
				minimal: true
			},
			{
				skillName: SkillsEnum.Slayer,
				amount: 0,
				minimal: true
			},
			{
				skillName: SkillsEnum.Firemaking,
				amount: 0,
				minimal: true
			},
			{
				skillName: SkillsEnum.Fishing,
				amount: 0,
				minimal: true
			},
			{
				skillName: SkillsEnum.Woodcutting,
				amount: 0,
				minimal: true
			},
			{
				skillName: SkillsEnum.Mining,
				amount: 0,
				minimal: true
			}
		];

		for (let i = 0; i < quantity; i++) {
			let outputTotal = 0;

			switch (type) {
				case 'easy':
					inItems.addItem(rewardTokens.easy, 1);
					outputTotal = rand(specifiedItem.easyRange[0], specifiedItem.easyRange[1]);
					break;
				case 'medium':
					inItems.addItem(rewardTokens.medium, 1);
					outputTotal = rand(specifiedItem.medRange[0], specifiedItem.medRange[1]);
					break;
				case 'hard':
					inItems.addItem(rewardTokens.hard, 1);
					outputTotal = rand(specifiedItem.hardRange[0], specifiedItem.hardRange[1]);
					break;
			}

			if (specifiedItem.name === 'Herbs') {
				outItems.add(
					percentChance(50) ? 'Tarromin' : 'Harralander',
					Math.floor(reduceNumByPercent(outputTotal, 34))
				);
				outItems.add('Toadflax', Math.floor(reduceNumByPercent(outputTotal, 66)));
			} else if (specifiedItem.name === 'Ore') {
				outItems.add('Coal', Math.floor(reduceNumByPercent(outputTotal, 34)));
				outItems.add('Iron ore', Math.floor(reduceNumByPercent(outputTotal, 66)));
			} else if (specifiedItem.name === 'Experience') {
				(
					outXP.find(
						item => item.skillName === TrekExperience[Math.floor(Math.random() * TrekExperience.length)]
					) || outXP[0]
				).amount += outputTotal;
			} else {
				outItems.add(specifiedItem.name, outputTotal);
			}
		}

		if (!userBank.has(inItems.bank)) {
			return msg.send("You don't have enough reward tokens for that.");
		}

		if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
			const sellMsg = await msg.channel.send(
				`${user}, say \`confirm\` to confirm that you want to use ${quantity} ${type} reward tokens to buy sets of ${specifiedItem.name}.`
			);

			// Confirm the user wants to buy
			try {
				await msg.channel.awaitMessages(
					_msg => _msg.author.id === user.id && _msg.content.toLowerCase() === 'confirm',
					{
						max: 1,
						time: Time.Second * 15,
						errors: ['time']
					}
				);
			} catch (err) {
				return sellMsg.edit(`Cancelling purchase of ${quantity} sets of ${toTitleCase(specifiedItem.name)}.`);
			}
		}

		if (outItems.length > 0) await user.addItemsToBank(outItems);
		await user.removeItemsFromBank(inItems);

		let ret = `You redeemed **${inItems}** for `;
		if (outItems.length > 0) {
			ret += `**${outItems}**`;
		} else {
			ret += 'XP. You received: ';
		}

		ret += (await Promise.all(outXP.filter(xp => xp.amount > 0).map(xp => user.addXP(xp))))
			.join(', ');

		return msg.send(`${ret}.`);
	}
}
