import { reduceNumByPercent } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { Activity, Emoji, Time } from '../../lib/constants';
import { getSimilarItems } from '../../lib/data/similarItems';
import { hasArrayOfItemsEquipped } from '../../lib/gear';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { pernixOutfit, torvaOutfit, virtusOutfit } from '../../lib/nex';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import { RaidsActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, rand } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';
import itemID from '../../lib/util/itemID';

const meleeGearBonus = [
	{
		itemID: itemID('Neitiznot faceguard'),
		itemPoint: 5
	},
	{
		itemID: itemID('Serpentine helm'),
		itemPoint: 4
	},
	{
		itemID: itemID('Helm of neitiznot'),
		itemPoint: 3
	},
	{
		itemID: itemID('Void melee helm'),
		itemPoint: 2
	},
	{
		itemID: itemID('Void melee helm (l)'),
		itemPoint: 2
	},
	{
		itemID: itemID('Amulet of torture'),
		itemPoint: 5
	},
	{
		itemID: itemID('Amulet of torture (or)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Amulet of fury'),
		itemPoint: 4
	},
	{
		itemID: itemID('Amulet of fury (or)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Amulet of blood fury'),
		itemPoint: 4
	},
	{
		itemID: itemID('Amulet of glory'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(1)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(2)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(3)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(4)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(5)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(6)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t1)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t2)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t3)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t4)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t5)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t6)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of eternal glory'),
		itemPoint: 3
	},
	{
		itemID: itemID('Infernal cape'),
		itemPoint: 5
	},
	{
		itemID: itemID('Infernal cape (l)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Infernal max cape'),
		itemPoint: 5
	},
	{
		itemID: itemID('Infernal max cape (l)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Fire cape'),
		itemPoint: 4
	},
	{
		itemID: itemID('Fire cape (l)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Fire max cape'),
		itemPoint: 4
	},
	{
		itemID: itemID('Fire max cape (l)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Bandos chestplate'),
		itemPoint: 5
	},
	{
		itemID: itemID('Fighter torso'),
		itemPoint: 4
	},
	{
		itemID: itemID('Elite void top'),
		itemPoint: 4
	},
	{
		itemID: itemID('Elite void top (l)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Void knight top'),
		itemPoint: 3
	},
	{
		itemID: itemID('Void knight top (l)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Bandos tassets'),
		itemPoint: 5
	},
	{
		itemID: itemID('Elite void robe'),
		itemPoint: 4
	},
	{
		itemID: itemID('Elite void robe (l)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Void knight robe'),
		itemPoint: 3
	},
	{
		itemID: itemID('Void knight robe (l)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Scythe of vitur'),
		itemPoint: 10
	},
	{
		itemID: itemID('Dragon hunter lance'),
		itemPoint: 4
	},
	{
		itemID: itemID('Zamorakian hasta'),
		itemPoint: 3
	},
	{
		itemID: itemID('Abyssal tentacle'),
		itemPoint: 2
	},
	{
		itemID: itemID('Abyssal whip'),
		itemPoint: 1
	},
	{
		itemID: itemID('Volcanic abyssal whip'),
		itemPoint: 1
	},
	{
		itemID: itemID('Frozen abyssal whip'),
		itemPoint: 1
	},
	{
		itemID: itemID('Avernic defender'),
		itemPoint: 5
	},
	{
		itemID: itemID('Avernic defender (l)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Dragon defender'),
		itemPoint: 4
	},
	{
		itemID: itemID('Dragon defender (l)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Dragon defender (t)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Ferocious gloves'),
		itemPoint: 5
	},
	{
		itemID: itemID('Barrows gloves'),
		itemPoint: 4
	},
	{
		itemID: itemID('Void knight gloves'),
		itemPoint: 3
	},
	{
		itemID: itemID('Void knight gloves (l)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Primordial boots'),
		itemPoint: 5
	},
	{
		itemID: itemID('Dragon boots'),
		itemPoint: 4
	},
	{
		itemID: itemID('Dragon boots (g)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Berserker ring (i)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Brimstone ring'),
		itemPoint: 4
	},
	{
		itemID: itemID('Drygore rapier'),
		itemPoint: 15
	},
	{
		itemID: itemID('Offhand drygore rapier'),
		itemPoint: 10
	},
	{
		itemID: itemID('Torva full helm'),
		itemPoint: 6
	},
	{
		itemID: itemID('Torva platebody'),
		itemPoint: 6
	},
	{
		itemID: itemID('Torva platelegs'),
		itemPoint: 6
	},
	{
		itemID: itemID('Torva boots'),
		itemPoint: 6
	},
	{
		itemID: itemID('Torva gloves'),
		itemPoint: 6
	}
];

const rangeGearBonus = [
	{
		itemID: itemID('Armadyl helmet'),
		itemPoint: 5
	},
	{
		itemID: itemID('Void ranger helm'),
		itemPoint: 3
	},
	{
		itemID: itemID('Void ranger helm (l)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Necklace of anguish'),
		itemPoint: 5
	},
	{
		itemID: itemID('Necklace of anguish (or)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Amulet of fury'),
		itemPoint: 4
	},
	{
		itemID: itemID('Amulet of fury (or)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Amulet of blood fury'),
		itemPoint: 4
	},
	{
		itemID: itemID('Amulet of glory'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(1)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(2)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(3)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(4)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(5)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(6)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t1)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t2)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t3)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t4)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t5)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t6)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of eternal glory'),
		itemPoint: 3
	},
	{
		itemID: itemID("Ava's assembler"),
		itemPoint: 5
	},
	{
		itemID: itemID("Ava's assembler (l)"),
		itemPoint: 5
	},
	{
		itemID: itemID('Assembler max cape'),
		itemPoint: 5
	},
	{
		itemID: itemID('Assembler max cape (l)'),
		itemPoint: 5
	},
	{
		itemID: itemID("Ava's accumulator"),
		itemPoint: 4
	},
	{
		itemID: itemID('Armadyl chestplate'),
		itemPoint: 5
	},
	{
		itemID: itemID('Elite void top'),
		itemPoint: 4
	},
	{
		itemID: itemID('Elite void top (l)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Void knight top'),
		itemPoint: 3
	},
	{
		itemID: itemID('Void knight top (l)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Armadyl chainskirt'),
		itemPoint: 5
	},
	{
		itemID: itemID('Elite void robe'),
		itemPoint: 4
	},
	{
		itemID: itemID('Elite void robe (l)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Void knight robe'),
		itemPoint: 3
	},
	{
		itemID: itemID('Void knight robe (l)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Twisted bow'),
		itemPoint: 14
	},
	{
		itemID: itemID('Dragon hunter crossbow'),
		itemPoint: 4
	},
	{
		itemID: itemID('Armadyl crossbow'),
		itemPoint: 3
	},
	{
		itemID: itemID('Dragon crossbow'),
		itemPoint: 2
	},
	{
		itemID: itemID('Rune crossbow'),
		itemPoint: 1
	},
	{
		itemID: itemID('Twisted buckler'),
		itemPoint: 5
	},
	{
		itemID: itemID('Book of law'),
		itemPoint: 4
	},
	{
		itemID: itemID('Dragon arrow'),
		itemPoint: 5
	},
	{
		itemID: itemID('Amethyst arrow'),
		itemPoint: 5
	},
	{
		itemID: itemID('Ruby dragon bolts (e)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Ruby bolts (e)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Barrows gloves'),
		itemPoint: 5
	},
	{
		itemID: itemID('Void knight gloves'),
		itemPoint: 4
	},
	{
		itemID: itemID('Void knight gloves (l)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Pegasian boots'),
		itemPoint: 5
	},
	{
		itemID: itemID("Ancient d'hide boots"),
		itemPoint: 4
	},
	{
		itemID: itemID("Armadyl d'hide boots"),
		itemPoint: 4
	},
	{
		itemID: itemID("Bandos d'hide boots"),
		itemPoint: 4
	},
	{
		itemID: itemID("Guthix d'hide boots"),
		itemPoint: 4
	},
	{
		itemID: itemID("Saradomin d'hide boots"),
		itemPoint: 4
	},
	{
		itemID: itemID("Zamorak d'hide boots"),
		itemPoint: 4
	},
	{
		itemID: itemID('Pernix cowl'),
		itemPoint: 6
	},
	{
		itemID: itemID('Pernix body'),
		itemPoint: 6
	},
	{
		itemID: itemID('Pernix chaps'),
		itemPoint: 6
	},
	{
		itemID: itemID('Pernix boots'),
		itemPoint: 6
	},
	{
		itemID: itemID('Pernix gloves'),
		itemPoint: 6
	}
];

const mageGearBonus = [
	{
		itemID: itemID('Ancestral hat'),
		itemPoint: 5
	},
	{
		itemID: itemID('Twisted ancestral hat'),
		itemPoint: 5
	},
	{
		itemID: itemID("Ahrim's hood"),
		itemPoint: 4
	},
	{
		itemID: itemID('Void mage helm'),
		itemPoint: 3
	},
	{
		itemID: itemID('Void mage helm (l)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Occult necklace'),
		itemPoint: 5
	},
	{
		itemID: itemID('Occult necklace (or)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Amulet of fury'),
		itemPoint: 4
	},
	{
		itemID: itemID('Amulet of fury (or)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Amulet of blood fury'),
		itemPoint: 4
	},
	{
		itemID: itemID('Amulet of glory'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(1)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(2)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(3)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(4)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(5)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory(6)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t1)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t2)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t3)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t4)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t5)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of glory (t6)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Amulet of eternal glory'),
		itemPoint: 3
	},
	{
		itemID: itemID('Imbued saradomin cape'),
		itemPoint: 5
	},
	{
		itemID: itemID('Imbued zamorak cape'),
		itemPoint: 5
	},
	{
		itemID: itemID('Imbued guthix cape'),
		itemPoint: 5
	},
	{
		itemID: itemID('Imbued saradomin cape (l)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Imbued zamorak cape (l)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Imbued guthix cape (l)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Imbued saradomin max cape'),
		itemPoint: 5
	},
	{
		itemID: itemID('Imbued zamorak max cape'),
		itemPoint: 5
	},
	{
		itemID: itemID('Imbued guthix max cape'),
		itemPoint: 5
	},
	{
		itemID: itemID('Imbued saradomin max cape (l)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Imbued zamorak max cape (l)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Imbued guthix max cape (l)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Saradomin cape'),
		itemPoint: 4
	},
	{
		itemID: itemID('Zamorak cape'),
		itemPoint: 4
	},
	{
		itemID: itemID('Guthix cape'),
		itemPoint: 4
	},
	{
		itemID: itemID('Saradomin max cape'),
		itemPoint: 4
	},
	{
		itemID: itemID('Zamorak max cape'),
		itemPoint: 4
	},
	{
		itemID: itemID('Guthix max cape'),
		itemPoint: 4
	},
	{
		itemID: itemID('Ancestral robe top'),
		itemPoint: 5
	},
	{
		itemID: itemID('Twisted ancestral robe top'),
		itemPoint: 5
	},
	{
		itemID: itemID("Ahrim's robetop"),
		itemPoint: 4
	},
	{
		itemID: itemID('Elite void top'),
		itemPoint: 4
	},
	{
		itemID: itemID('Elite void top (l)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Void knight top'),
		itemPoint: 3
	},
	{
		itemID: itemID('Void knight top (l)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Ancestral robe bottom'),
		itemPoint: 5
	},
	{
		itemID: itemID('Twisted ancestral robe bottom'),
		itemPoint: 5
	},
	{
		itemID: itemID("Ahrim's robeskirt"),
		itemPoint: 4
	},
	{
		itemID: itemID('Elite void robe'),
		itemPoint: 4
	},
	{
		itemID: itemID('Elite void robe (l)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Void knight robe'),
		itemPoint: 3
	},
	{
		itemID: itemID('Void knight robe (l)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Harmonised nightmare staff'),
		itemPoint: 5
	},
	{
		itemID: itemID('Sanguinesti staff'),
		itemPoint: 4
	},
	{
		itemID: itemID('Trident of the swamp'),
		itemPoint: 3
	},
	{
		itemID: itemID('Trident of the swamp (e)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Trident of the seas'),
		itemPoint: 2
	},
	{
		itemID: itemID('Trident of the seas (full)'),
		itemPoint: 2
	},
	{
		itemID: itemID('Trident of the seas (e)'),
		itemPoint: 2
	},
	{
		itemID: itemID('Arcane spirit shield'),
		itemPoint: 5
	},
	{
		itemID: itemID('Book of darkness'),
		itemPoint: 4
	},
	{
		itemID: itemID('Tormented bracelet'),
		itemPoint: 5
	},
	{
		itemID: itemID('Tormented bracelet (or)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Barrows gloves'),
		itemPoint: 4
	},
	{
		itemID: itemID('Void knight gloves'),
		itemPoint: 3
	},
	{
		itemID: itemID('Void knight gloves (l)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Virtus mask '),
		itemPoint: 6
	},
	{
		itemID: itemID('Virtus robe top'),
		itemPoint: 6
	},
	{
		itemID: itemID('Virtus robe legs'),
		itemPoint: 6
	},
	{
		itemID: itemID('Virtus boots'),
		itemPoint: 6
	},
	{
		itemID: itemID('Virtus gloves'),
		itemPoint: 6
	},
	{
		itemID: itemID('Virtus wand'),
		itemPoint: 6
	},
	{
		itemID: itemID('Virtus book'),
		itemPoint: 6
	}
];
// Melee + Ranged + Mage + Special weps
const MAX_itemPoints = 192;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES'],
			oneAtTime: true,
			usage: '[solo]'
		});
	}

	checkReqs(users: KlasaUser[]) {
		// Check if every user has the requirements for this raid.
		for (const user of users) {
			if (!user.hasMinion) {
				throw `${user.username} can't do raids, because they don't have a minion.`;
			}

			if (user.minionIsBusy) {
				throw `${user.username} is busy and can't join the raid.`;
			}
		}
	}

	gearPointCalc(user: KlasaUser) {
		// Calculates the amount of raid points based on current gear
		const currentEquippedMeleeGear = user.getGear('melee');
		const currentEquippedRangeGear = user.getGear('range');
		const currentEquippedMageGear = user.getGear('mage');
		let meleeGearPoints = 0;
		let rangeGearPoints = 0;
		let mageGearPoints = 0;
		// Scores the melee gear
		for (const key of Object.values(EquipmentSlot) as EquipmentSlot[]) {
			// Get the item equipped in that slot...
			const itemSlot = currentEquippedMeleeGear[key];
			if (!itemSlot) continue;
			const item = getOSItem(itemSlot.item);
			if (!item.equipment) continue;
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			meleeGearPoints +=
				meleeGearBonus.find(_item => getSimilarItems(_item.itemID).includes(item.id))
					?.itemPoint ?? 0;
		}
		// Scores the range gear
		for (const key of Object.values(EquipmentSlot) as EquipmentSlot[]) {
			// Get the item equipped in that slot...
			const itemSlot = currentEquippedRangeGear[key];
			if (!itemSlot) continue;
			const item = getOSItem(itemSlot.item);
			if (!item.equipment) continue;
			rangeGearPoints +=
				rangeGearBonus.find(_item => getSimilarItems(_item.itemID).includes(item.id))
					?.itemPoint ?? 0;
		}
		// Scores the mage gear
		for (const key of Object.values(EquipmentSlot) as EquipmentSlot[]) {
			// Get the item equipped in that slot...
			const itemSlot = currentEquippedMageGear[key];
			if (!itemSlot) continue;
			const item = getOSItem(itemSlot.item);
			if (!item.equipment) continue;
			mageGearPoints +=
				mageGearBonus.find(_item => getSimilarItems(_item.itemID).includes(item.id))
					?.itemPoint ?? 0;
		}

		let totalGearPoints = meleeGearPoints + rangeGearPoints + mageGearPoints;

		// Check spec weapons
		// DWH
		if (user.hasItemEquippedOrInBank(13576)) {
			totalGearPoints += 5;
		}
		// BGS or BGS (or)
		if (user.hasItemEquippedOrInBank(11804) || user.hasItemEquippedOrInBank(20370)) {
			totalGearPoints += 5;
		}
		// Toxic blowpipe
		if (user.hasItemEquippedOrInBank(12926)) {
			totalGearPoints += 5;
		}
		// Returns base raid points based on gear and gear score.
		return [totalGearPoints * 100 + 12500, totalGearPoints];
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [input]: ['solo' | undefined]) {
		this.checkReqs([msg.author]);

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: (await msg.author.getMinigameScore('Raids')) > 199 ? 1 : 2,
			maxSize: 50,
			ironmanAllowed: true,
			message: `${msg.author.username} is starting a party to defeat the Chambers of Xeric! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			customDenier: user => {
				if (!user.hasMinion) {
					return [true, "you don't have a minion."];
				}
				if (user.minionIsBusy) {
					return [true, 'your minion is busy.'];
				}
				return [false];
			}
		};

		const users = input === 'solo' ? [msg.author] : await msg.makePartyAwaiter(partyOptions);

		// Gives experienced players a small time boost to raid
		let teamKCBoost = 0;
		for (const user of users) {
			teamKCBoost += Math.floor((await user.getMinigameScore('Raids')) / 10);
		}

		let duration = Time.Hour;
		if (users.length === 1) {
			duration = Time.Minute * 50 + rand(Time.Minute * 2, Time.Minute * 10);
		} else {
			duration =
				Time.Minute * 55 -
				(users.length % 10) * 2 * Time.Minute +
				rand(Time.Minute * 2, Time.Minute * 10);
		}
		// Max 25% boost for experienced raiders
		if (teamKCBoost > 25) {
			teamKCBoost = 25;
		}
		duration *= (100 - teamKCBoost) / 100;
		this.checkReqs(users);

		const gearSpeedBoosts = [];
		let gearSpeedBoost = 0;

		for (const u of users) {
			let uBoost = 0;
			if (hasArrayOfItemsEquipped(torvaOutfit, u.getGear('melee'))) {
				uBoost += 2 / users.length;
			}
			if (hasArrayOfItemsEquipped(virtusOutfit, u.getGear('mage'))) {
				uBoost += 2 / users.length;
			}
			if (hasArrayOfItemsEquipped(pernixOutfit, u.getGear('range'))) {
				uBoost += 2 / users.length;
			}
			if (u.hasItemEquippedAnywhere('Drygore rapier')) {
				uBoost += 5 / users.length;
			}
			if (u.hasItemEquippedAnywhere('Offhand drygore rapier')) {
				uBoost += 2 / users.length;
			}
			if (u.hasItemEquippedAnywhere('Twisted bow')) {
				uBoost += 4 / users.length;
			}
			gearSpeedBoost += uBoost;
			gearSpeedBoosts.push(`${uBoost.toFixed(2)}% from ${u.username}`);
		}

		duration = reduceNumByPercent(duration, gearSpeedBoost);

		const data: RaidsActivityTaskOptions = {
			duration,
			challengeMode: false,
			channelID: msg.channel.id,
			quantity: 1,
			partyLeaderID: msg.author.id,
			userID: msg.author.id,
			type: Activity.Raids,
			id: rand(1, 10_000_000).toString(),
			finishDate: Date.now() + (duration as number),
			users: users.map(u => u.id),
			team: await Promise.all(
				users.map(async u => {
					let points = (this.gearPointCalc(u)[0] * (100 - rand(0, 20))) / 100;
					const kc = await msg.author.getMinigameScore('Raids');
					if (kc < 5) {
						points /= 5;
					} else if (kc < 20) {
						points /= 3;
					} else if (kc > 1000) {
						points *= 1.2;
					}
					points = Math.round(points);
					return {
						id: u.id,
						personalPoints: points,
						canReceiveDust: rand(1, 10) <= 7,
						canReceiveAncientTablet: u.hasItemEquippedOrInBank('Ancient tablet')
					};
				})
			)
		};

		await addSubTaskToActivityTask(this.client, data);

		gearSpeedBoosts.push(`${teamKCBoost}% for team KC`);

		let str = `<:Olmlet:324127376873357316> ${msg.author.username}'s raid with ${
			users.length
		} minions is starting! <:Olmlet:324127376873357316>

**Team:** ${users
			.map(u => `${u.username} (${this.gearPointCalc(u)[1]}/${MAX_itemPoints})`)
			.join(', ')}
**Boosts:** ${gearSpeedBoosts.join(', ')}.

The total trip will take ${formatDuration(duration)}.
		
Your personal points are mainly based off the gear you're wearing. For more information, see <https://oldschool.runescape.wiki/w/Chambers_of_Xeric/Strategies>`;

		return msg.channel.send(str);
	}
}
