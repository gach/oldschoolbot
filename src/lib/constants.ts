import { join } from 'path';

export const enum Time {
	Millisecond = 1,
	Second = 1000,
	Minute = 1000 * 60,
	Hour = 1000 * 60 * 60,
	Day = 1000 * 60 * 60 * 24,
	Month = 1000 * 60 * 60 * 24 * 31,
	Year = 1000 * 60 * 60 * 24 * 365
}

export const enum Channel {
	Notifications = '469523207691436042',
	ErrorLogs = '665678499578904596',
	Suggestions = '668441710703149074'
}

export const enum Roles {
	Booster = '665908237152813057',
	Contributor = '456181501437018112',
	Moderator = '622806157563527178',
	PatronTier1 = '678970545789730826',
	PatronTier2 = '678967943979204608',
	PatronTier3 = '687408140832342043',
	Patron = '679620175838183424'
}

export const enum Emoji {
	MoneyBag = '<:MoneyBag:493286312854683654>',
	OSBot = '<:OSBot:601768469905801226>',
	Joy = '😂',
	Bpaptu = '<:bpaptu:660333438292983818>',
	Diamond = '💎',
	Dice = '<:dice:660128887111548957>',
	Minion = '<:minion:660517408968146946>',
	Fireworks = '🎆',
	Tick = '✅',
	Search = '🔎',
	FancyLoveheart = '💝',
	Gift = '🎁',
	Sad = '<:RSSad:380915244652036097>',
	Happy = '<:RSHappy:380915244760825857>',
	PeepoOSBot = '<:peepoOSBot:601695641088950282>',
	PeepoSlayer = '<:peepoSlayer:644411576425775104>',
	PeepoRanger = '<:peepoRanger:663096705746731089>',
	PeepoNoob = '<:peepoNoob:660712001500086282>',
	XP = '<:xp:630911040510623745>',
	GP = '<:RSGP:369349580040437770>',
	ThumbsUp = '👍',
	ThumbsDown = '👎',
	Casket = '<:Casket:365003978678730772>',
	Mining = '<:mining:630911040128811010>',
	Smithing = '<:smithing:630911040452034590>',
	Woodcutting = '<:woodcutting:630911040099450892>',
	Diango = '<:diangoChatHead:678146375300415508>',
	BirthdayPresent = '<:birthdayPresent:680041979710668880>',
	MysteryBox = '<:mysterybox:680783258488799277>',
	QuestIcon = '<:questIcon:690191385907036179>'
}

export const enum Image {
	DiceBag = 'https://i.imgur.com/sySQkSX.png'
}

export const enum Color {
	Orange = 16098851
}

export const SupportServer = '342983479501389826';

export const enum Tasks {
	MonsterActivity = 'monsterActivity',
	ClueActivity = 'clueActivity',
	MiningActivity = 'miningActivity',
	SmithingActivity = 'smithingActivity',
	WoodcuttingActivity = 'woodcuttingActivity',
	QuestingActivity = 'questingActivity',
	MonsterKillingTicker = 'monsterKillingTicker',
	ClueTicker = 'clueTicker',
	SkillingTicker = 'skillingTicker'
}

export const enum Activity {
	MonsterKilling = 'MonsterKilling',
	ClueCompletion = 'ClueCompletion',
	Mining = 'Mining',
	Smithing = 'Smithing',
	Woodcutting = 'Woodcutting',
	Questing = 'Questing'
}

export const enum Events {
	Debug = 'debug',
	Error = 'error',
	Log = 'log',
	Verbose = 'verbose',
	Warn = 'warn',
	Wtf = 'wtf',
	ServerNotification = 'serverNotification',
	SkillLevelUp = 'skillLevelUp'
}

export const enum BadgesEnum {
	Developer = 0,
	Booster = 1,
	LimitedPatron = 2,
	Patron = 3
}

export const enum PermissionLevelsEnum {
	Zero = 0,
	Moderator = 6,
	Admin = 7,
	Owner = 10
}

export const rootFolder = join(__dirname, '..', '..', '..');

export const COINS_ID = 995;

export const enum PerkTier {
	/**
	 * Boosters
	 */
	One = 1,
	/**
	 * Tier 1 Patron
	 */
	Two = 2,
	/**
	 * Tier 2 Patron, Contributors, Mods
	 */
	Three = 3,
	/**
	 * Tier 3 Patron
	 */
	Four = 4
}

export const enum BitField {
	HasGivenBirthdayPresent = 1,
	IsPatronTier1 = 2,
	IsPatronTier2 = 3,
	IsPatronTier3 = 4
}

export const enum PatronTierID {
	One = '4608201',
	Two = '4608226',
	Three = '4720356'
}

export const MAX_QP = 275;
