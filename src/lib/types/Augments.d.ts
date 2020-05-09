import { Db } from 'mongodb';
import { Settings, SettingsUpdateResult } from 'klasa';
import { FSWatcher } from 'fs';
import { CommentStream, SubmissionStream } from 'snoostorm';
import { Limit } from 'p-limit';
import { Image } from 'canvas';
import Monster from 'oldschooljs/dist/structures/Monster';

import { CustomGet } from '../settings/types/UserSettings';
import { Bank, MakePartyOptions } from '.';
import { SkillsEnum } from '../skilling/types';
import { KillableMonster } from '../minions/types';

declare module 'klasa' {
	interface KlasaClient {
		public oneCommandAtATimeCache: Set<string>;
		public secondaryUserBusyCache: Set<string>;
		public queuePromise: Limit;
		public fetchItemPrice(itemID: number | string): Promise<number>;
		public settings: Settings;
		public production: boolean;
		public _fileChangeWatcher?: FSWatcher;
		public _badgeCache: Map<string, string>;
		public killWorkerThread?: ArbitraryThreadType;
		twitchClientID?: string;
		osggDB?: Db;
		commentStream?: CommentStream;
		submissionStream?: SubmissionStream;
	}

	interface Command {
		altProtection?: boolean;
		oneAtTime?: boolean;
		guildOnly?: boolean;
		perkTier?: number;
		ironCantUse?: boolean;
	}

	interface Task {
		generateBankImage(
			bank: Bank,
			title?: string,
			showValue?: boolean,
			flags?: { [key: string]: string | number },
			bankBackgroundID = 1
		): Promise<Buffer>;
		generateCollectionLogImage(
			collectionLog: Bank,
			title: string = '',
			type: any
		): Promise<Buffer>;
		getItemImage(itemID: number): Promise<Image>;
	}
	interface Command {
		kill(message: KlasaMessage, [quantity, monster]: [number | string, string]): Promise<any>;
	}
	interface KlasaMessage {
		cmdPrefix: string;
		sendBankImage(options: {
			bank: Bank;
			content?: string;
			title?: string;
		}): Promise<KlasaMessage>;
		makePartyAwaiter(options: MakePartyOptions): Promise<KlasaUser[]>;
		removeAllReactions(): void;
	}

	interface SettingsFolder {
		get<K extends string, S>(key: CustomGet<K, S>): S;
	}
}

declare module 'discord.js' {
	interface User {
		addItemsToBank(items: Bank, collectionLog?: boolean): Promise<SettingsUpdateResult>;
		addItemsToCollectionLog(items: Bank): Promise<SettingsUpdateResult>;
		removeItemFromBank(itemID: number, numberToRemove?: number): Promise<SettingsUpdateResult>;
		incrementMonsterScore(
			monsterID: number,
			numberToAdd?: number
		): Promise<SettingsUpdateResult>;
		incrementClueScore(clueID: number, numberToAdd?: number): Promise<SettingsUpdateResult>;
		hasItem(itemID: number, amount = 1, sync = true): Promise<boolean>;
		numberOfItemInBank(itemID: number, sync = true): Promise<number>;
		log(stringLog: string): void;
		addGP(amount: number): Promise<SettingsUpdateResult>;
		removeGP(amount: number): Promise<SettingsUpdateResult>;
		addQP(amount: number): Promise<SettingsUpdateResult>;
		addXP(skillName: SkillsEnum, amount: number): Promise<SettingsUpdateResult>;
		skillLevel(skillName: SkillsEnum): number;
		incrementMinionDailyDuration(duration: number): Promise<SettingsUpdateResult>;
		toggleBusy(busy: boolean): void;
		/**
		 * Returns how many of an item a user owns, checking their bank and all equipped gear.
		 * @param itemID The item ID.
		 */
		numOfItemsOwned(itemID: number): number;
		/**
		 * Returns true if the user has this item equipped in any of their setups.
		 * @param itemID The item ID.
		 */
		hasItemEquippedAnywhere(itemID: number): boolean;
		/**
		 * Checks whether they have the given item in their bank OR equipped.
		 * @param item
		 */
		hasItemEquippedOrInBank(item: number | string): boolean;
		/**
		 * Returns how many of the item the user has in their bank.
		 * @param itemID The item ID.
		 */
		numItemsInBankSync(itemID: number): number;
		/**
		 * Returns a tuple where the first item is true/false if they have the requirements,
		 * the second item is a string containing the reason they don't have the requirements.
		 */
		hasMonsterRequirements(monster: KillableMonster): [false, string] | [true];
		/**
		 * Returns the KC the user has for this monster.
		 */
		getKC(monster: Monster): number;
		/**
		 * Returns this users Collection Log bank.
		 */
		collectionLog: Bank;
		sanitizedName: string;
		badges: string;
		/**
		 * If they are currently locked into a economy command, or
		 * locked from being targeted in an economy command by another (duel, sellto, etc)
		 */
		isBusy: boolean;
		minionIsBusy: boolean;
		minionStatus: string;
		minionName: string;
		hasMinion: boolean;
		isIronman: boolean;
		maxTripLength: number;
	}
}

declare module 'klasa-dashboard-hooks' {
	interface AuthData {
		user_id: string;
	}
}
