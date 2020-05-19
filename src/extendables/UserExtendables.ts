import { Extendable, KlasaClient, ExtendableStore } from 'klasa';
import { User, Util, TextChannel } from 'discord.js';

import { Events, Emoji, Channel, Time, MAX_QP, PerkTier } from '../lib/constants';
import { Bank } from '../lib/types';
import {
	addBankToBank,
	removeItemFromBank,
	addItemToBank,
	formatDuration,
	convertXPtoLVL,
	toTitleCase
} from '../lib/util';
import clueTiers from '../lib/minions/data/clueTiers';
import { UserSettings } from '../lib/settings/types/UserSettings';
import Skills from '../lib/skilling/skills';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';
import { SkillsEnum } from '../lib/skilling/types';
import getActivityOfUser from '../lib/util/getActivityOfUser';
import { production } from '../config';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	get sanitizedName(this: User) {
		return `(${this.username.replace(/[()]/g, '')})[${this.id}]`;
	}

	get isBusy(this: User) {
		const client = this.client as KlasaClient;
		return (
			client.oneCommandAtATimeCache.has(this.id) || client.secondaryUserBusyCache.has(this.id)
		);
	}

	public get isIronman(this: User) {
		return this.settings.get(UserSettings.Minion.Ironman);
	}

	/**
	 * Toggle whether this user is busy or not, this adds another layer of locking the user
	 * from economy actions.
	 *
	 * @param busy boolean Whether the new toggled state will be busy or not busy.
	 */
	public toggleBusy(this: User, busy: boolean) {
		const client = this.client as KlasaClient;

		if (busy) {
			client.secondaryUserBusyCache.add(this.id);
		} else {
			client.secondaryUserBusyCache.delete(this.id);
		}
	}

	public log(this: User, stringLog: string) {
		this.client.emit(Events.Log, `${this.sanitizedName} ${stringLog}`);
	}

	public async removeGP(this: User, amount: number) {
		await this.settings.sync(true);
		const currentGP = this.settings.get(UserSettings.GP);
		if (currentGP < amount) throw `${this.sanitizedName} doesn't have enough GP.`;
		this.log(
			`had ${amount} GP removed. BeforeBalance[${currentGP}] NewBalance[${currentGP -
				amount}]`
		);
		return this.settings.update(UserSettings.GP, currentGP - amount);
	}

	public async addGP(this: User, amount: number) {
		await this.settings.sync(true);
		const currentGP = this.settings.get(UserSettings.GP);
		this.log(
			`had ${amount} GP added. BeforeBalance[${currentGP}] NewBalance[${currentGP + amount}]`
		);
		return this.settings.update(UserSettings.GP, currentGP + amount);
	}

	public async addQP(this: User, amount: number) {
		await this.settings.sync(true);
		const currentQP = this.settings.get(UserSettings.QP);
		const newQP = Math.min(MAX_QP, currentQP + amount);

		if (currentQP < MAX_QP && newQP === MAX_QP) {
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.QuestIcon} **${this.username}'s** minion, ${this.minionName}, just achieved the maximum amount of Quest Points!`
			);
		}

		this.log(`had ${newQP} QP added. Before[${currentQP}] New[${newQP}]`);
		return this.settings.update(UserSettings.QP, newQP);
	}

	public async addItemsToBank(this: User, _items: Bank, collectionLog = false) {
		await this.settings.sync(true);
		for (const { scrollID } of clueTiers) {
			// If they didnt get any of this clue scroll in their loot, continue to next clue tier.
			if (!_items[scrollID]) continue;
			const alreadyHasThisScroll = await this.hasItem(scrollID);
			if (alreadyHasThisScroll) {
				// If they already have this scroll in their bank, delete it from the loot.
				delete _items[scrollID];
			} else {
				// If they dont have it in their bank, reset the amount to 1 incase they got more than 1 of the clue.
				_items[scrollID] = 1;
			}
		}

		const items = {
			..._items
		};

		if (collectionLog) this.addItemsToCollectionLog(items);

		if (items[995]) {
			await this.addGP(items[995]);
			delete items[995];
		}

		this.log(`Had items added to bank - ${JSON.stringify(items)}`);

		return this.settings.update(
			UserSettings.Bank,
			addBankToBank(items, {
				...this.settings.get(UserSettings.Bank)
			})
		);
	}

	public async removeItemFromBank(this: User, itemID: number, amountToRemove = 1) {
		await this.settings.sync(true);
		const bank = { ...this.settings.get(UserSettings.Bank) };
		if (typeof bank[itemID] === 'undefined' || bank[itemID] < amountToRemove) {
			this.client.emit(
				Events.Wtf,
				`${this.username}[${this.id}] [NEI] ${itemID} ${amountToRemove}`
			);

			throw `${this.username}[${this.id}] doesn't have enough of item[${itemID}] to remove ${amountToRemove}.`;
		}

		this.log(`had Quantity[${amountToRemove}] of ItemID[${itemID}] removed from bank.`);

		return this.settings.update(
			UserSettings.Bank,
			removeItemFromBank(bank, itemID, amountToRemove)
		);
	}

	public async addItemsToCollectionLog(this: User, items: Bank) {
		await this.settings.sync(true);
		this.log(`had following items added to collection log: [${JSON.stringify(items)}`);

		return this.settings.update(
			UserSettings.CollectionLogBank,
			addBankToBank(items, {
				...this.settings.get(UserSettings.CollectionLogBank)
			})
		);
	}

	public async incrementMonsterScore(this: User, monsterID: number, amountToAdd = 1) {
		await this.settings.sync(true);
		const currentMonsterScores = this.settings.get(UserSettings.MonsterScores);

		this.log(`had Quantity[${amountToAdd}] KC added to Monster[${monsterID}]`);

		return this.settings.update(
			UserSettings.MonsterScores,
			addItemToBank(currentMonsterScores, monsterID, amountToAdd)
		);
	}

	public async incrementClueScore(this: User, clueID: number, amountToAdd = 1) {
		await this.settings.sync(true);
		const currentClueScores = this.settings.get(UserSettings.ClueScores);

		this.log(`had Quantity[${amountToAdd}] KC added to Clue[${clueID}]`);

		return this.settings.update(
			UserSettings.ClueScores,
			addItemToBank(currentClueScores, clueID, amountToAdd)
		);
	}

	public async hasItem(this: User, itemID: number, amount = 1, sync = true) {
		if (sync) await this.settings.sync(true);

		const bank = this.settings.get(UserSettings.Bank);
		return typeof bank[itemID] !== 'undefined' && bank[itemID] >= amount;
	}

	public async numberOfItemInBank(this: User, itemID: number, sync = true) {
		if (sync) await this.settings.sync(true);

		const bank = this.settings.get(UserSettings.Bank);
		return typeof bank[itemID] !== 'undefined' ? bank[itemID] : 0;
	}

	public skillLevel(this: User, skillName: SkillsEnum) {
		return convertXPtoLVL(this.settings.get(`skills.${skillName}`) as number);
	}

	public async addXP(this: User, skillName: SkillsEnum, amount: number) {
		await this.settings.sync(true);
		const currentXP = this.settings.get(`skills.${skillName}`) as number;
		if (currentXP >= 200_000_000) return;

		const skill = Skills.find(skill => skill.id === skillName);
		if (!skill) return;

		const newXP = Math.min(200_000_000, currentXP + amount);

		// If they reached a XP milestone, send a server notification.
		for (const XPMilestone of [50_000_000, 100_000_000, 150_000_000, 200_000_000]) {
			if (newXP < XPMilestone) break;

			if (currentXP < XPMilestone && newXP >= XPMilestone) {
				this.client.emit(
					Events.ServerNotification,
					`${skill.emoji} **${this.username}'s** minion, ${
						this.minionName
					}, just achieved ${newXP.toLocaleString()} XP in ${toTitleCase(skillName)}!`
				);
				break;
			}
		}

		// If they just reached 99, send a server notification.
		if (convertXPtoLVL(currentXP) < 99 && convertXPtoLVL(newXP) >= 99) {
			this.client.emit(
				Events.ServerNotification,
				`${skill.emoji} **${this.username}'s** minion, ${
					this.minionName
				}, just achieved level 99 in ${toTitleCase(skillName)}!`
			);
		}

		return this.settings.update(`skills.${skillName}`, Math.floor(newXP));
	}

	public get badges(this: User) {
		const username = this.settings.get(UserSettings.RSN);
		if (!username) return '';
		return (this.client as KlasaClient)._badgeCache.get(username.toLowerCase()) || '';
	}

	public get minionIsBusy(this: User): boolean {
		const usersTask = getActivityOfUser(this.client, this);
		return Boolean(usersTask);
	}

	public get minionName(this: User): string {
		const name = this.settings.get(UserSettings.Minion.Name);
		const prefix = this.settings.get(UserSettings.Minion.Ironman) ? Emoji.Ironman : '';

		const icon = this.settings.get(UserSettings.Minion.Icon) ?? Emoji.Minion;

		return name
			? `${prefix} ${icon} **${Util.escapeMarkdown(name)}**`
			: `${prefix} ${icon} Your minion`;
	}

	public get hasMinion(this: User) {
		return this.settings.get(UserSettings.Minion.HasBought);
	}

	public get maxTripLength(this: User) {
		const perkTier = getUsersPerkTier(this);
		if (perkTier === PerkTier.Two) return Time.Minute * 33;
		if (perkTier === PerkTier.Three) return Time.Minute * 36;
		if (perkTier >= PerkTier.Four) return Time.Minute * 40;

		return Time.Minute * 30;
	}

	public async incrementMinionDailyDuration(this: User, duration: number) {
		await this.settings.sync(true);

		const currentDuration = this.settings.get(UserSettings.Minion.DailyDuration);
		const newDuration = currentDuration + duration;
		if (newDuration > Time.Hour * 16) {
			const log = `[MOU] Minion has been active for ${formatDuration(newDuration)}.`;

			this.log(log);
			if (production) {
				(this.client.channels.get(Channel.ErrorLogs) as TextChannel).send(
					`${this.sanitizedName} ${log}`
				);
			}
		}

		return this.settings.update(UserSettings.Minion.DailyDuration, newDuration);
	}
}
