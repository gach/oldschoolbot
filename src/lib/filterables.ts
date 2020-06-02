import resolveItems from './util/resolveItems';

const barrows = resolveItems([
	"Ahrim's hood",
	"Ahrim's robetop",
	"Ahrim's robeskirt",
	"Ahrim's staff",
	"Ahrim's armour set",
	"Dharok's helm",
	"Dharok's platebody",
	"Dharok's platelegs",
	"Dharok's greataxe",
	"Dharok's armour set",
	"Guthan's helm",
	"Guthan's platebody",
	"Guthan's chainskirt",
	"Guthan's warspear",
	"Guthan's armour set",
	"Karil's coif",
	"Karil's leathertop",
	"Karil's leatherskirt",
	"Karil's crossbow",
	"Karil's armour set",
	"Torag's helm",
	"Torag's platebody",
	"Torag's platelegs",
	"Torag's hammers",
	"Torag's armour set",
	"Verac's helm",
	"Verac's brassard",
	"Verac's plateskirt",
	"Verac's flail",
	"Verac's armour set",
	'Bolt rack'
]);

const skilling = resolveItems([
	'Rune essence',
	'Copper ore',
	'Tin ore',
	'Iron ore',
	'Silver ore',
	'Pure essence',
	'Coal',
	'Gold ore',
	'Mithril ore',
	'Adamantite ore',
	'Runite ore',
	'Bronze bar',
	'Iron bar',
	'Silver bar',
	'Steel bar',
	'Gold bar',
	'Mithril bar',
	'Adamantite bar',
	'Runite bar',
	'Uncut sapphire',
	'Uncut emerald',
	'Uncut ruby',
	'Uncut diamond',
	'Uncut dragonstone',
	'Uncut onyx',
	'Sapphire',
	'Emerald',
	'Ruby',
	'Diamond',
	'Dragonstone',
	'Onyx',
	'Logs',
	'Oak logs',
	'Willow logs',
	'Teak logs',
	'Maple logs',
	'Bark',
	'Mahogany logs',
	'Yew logs',
	'Mushroom',
	'Magic logs',
	'Redwood logs',
	'Green dragonhide',
	'Blue dragonhide',
	'Red dragonhide',
	'Black dragonhide',
	'Green dragon leather',
	'Blue dragon leather',
	'Red dragon leather',
	'Black dragon leather',
	'Grimy guam leaf',
	'Grimy marrentill',
	'Grimy tarromin',
	'Grimy harralander',
	'Grimy ranarr weed',
	'Grimy irit leaf',
	'Grimy avantoe',
	'Grimy kwuarm',
	'Grimy cadantine',
	'Grimy dwarf weed',
	'Grimy torstol',
	'Grimy lantadyme',
	'Grimy toadflax',
	'Grimy snapdragon',
	'Guam leaf',
	'Marrentill',
	'Tarromin',
	'Harralander',
	'Ranarr weed',
	'Toadflax',
	'Irit leaf',
	'Avantoe',
	'Kwuarm',
	'Snapdragon',
	'Cadantine',
	'Lantadyme',
	'Dwarf weed',
	'Torstol',
	'Ashes',
	'Cactus spine',
	'Crushed nest',
	'Desert goat horn',
	'Limpwurt root',
	'Mort myre fungus',
	'Potato cactus',
	"Red spiders' eggs",
	'Snape grass',
	'White berries',
	"Zulrah's scales",
	'Bones',
	'Dagannoth bones',
	'Dragon bones',
	'Superior dragon bones',
	'Wyvern bones',
	'Plank',
	'Oak plank',
	'Teak plank',
	'Mahogany plank',
	'Guam seed',
	'Marrentill seed',
	'Tarromin seed',
	'Harralander seed',
	'Ranarr seed',
	'Toadflax seed',
	'Irit seed',
	'Avantoe seed',
	'Kwuarm seed',
	'Snapdragon seed',
	'Cadantine seed',
	'Lantadyme seed',
	'Dwarf weed seed',
	'Torstol seed',
	'Willow seed',
	'Maple seed',
	'Yew seed',
	'Magic seed',
	'Palm tree seed',
	'Dragonfruit tree seed',
	'Spirit seed',
	'Celastrus seed',
	'Redwood tree seed',
	'Raw shark',
	'Grapes',
	'Feather',
	'Big bones',
	'Bronze dart tip',
	'Iron dart tip',
	'Steel dart tip',
	'Mithril dart tip',
	'Adamant dart tip',
	'Rune dart tip',
	'Dragon dart tip'
]);

const gear = resolveItems([
	'Armadyl helmet',
	'Armadyl chestplate',
	'Armadyl chainskirt',
	'Armadyl godsword',
	'Bandos chestplate',
	'Bandos tassets',
	'Bandos boots',
	'Bandos godsword',
	'Saradomin sword',
	'Armadyl crossbow',
	'Saradomin godsword',
	'Zamorakian spear',
	'Staff of the dead',
	'Zamorak godsword',
	'Arcane sigil',
	'Elysian sigil',
	'Spectral sigil',
	'Dragonfire shield',
	'Dragonfire ward',
	"Ahrim's robetop",
	"Ahrim's robeskirt",
	"Ahrim's armour set",
	"Dharok's helm",
	"Dharok's platebody",
	"Dharok's platelegs",
	"Dharok's greataxe",
	"Dharok's armour set",
	"Guthan's armour set",
	"Karil's leathertop",
	"Karil's leatherskirt",
	"Karil's crossbow",
	"Karil's armour set",
	"Torag's armour set",
	"Verac's helm",
	"Verac's brassard",
	"Verac's plateskirt",
	"Verac's flail",
	"Verac's armour set",
	'Anti-dragon shield',
	'Dragon warhammer'
]);

const cluesAndCaskets = resolveItems([
	'Clue scroll (beginner)',
	'Clue scroll (easy)',
	'Clue scroll (medium)',
	'Clue scroll (hard)',
	'Clue scroll (elite)',
	'Clue scroll (master)',
	'Reward casket (beginner)',
	'Reward casket (easy)',
	'Reward casket (medium)',
	'Reward casket (hard)',
	'Reward casket (elite)',
	'Reward casket (master)'
]);

const godwars = resolveItems([
	'Bandos tassets',
	'Bandos chestplate',
	'Bandos boots',
	'Bandos hilt',
	'Bandos godsword',
	'Pet general graardor',
	'Armadyl helmet',
	'Armadyl chestplate',
	'Armadyl chainskirt',
	'Armadyl hilt',
	'Armadyl godsword',
	"Pet kree'arra",
	'Zamorakian spear',
	'Zamorak hilt',
	'Zamorak godsword',
	'Staff of the dead',
	'Steam battlestaff',
	"Pet k'ril tsutsaroth",
	'Saradomin sword',
	"Saradomin's light",
	'Armadyl crossbow',
	'Saradomin hilt',
	'Saradomin godsword',
	'Pet zilyana',
	'Godsword shard 1',
	'Godsword shard 2',
	'Godsword shard 3',
	'Godsword blade'
]);

const dagannothkings = resolveItems([
	'Berserker ring',
	'Warrior ring',
	'Archers ring',
	'Seers ring',
	'Dragon axe',
	'Fremennik helm',
	'Fremennik blade',
	'Fremennik shield',
	'Rock-shell helm',
	'Rock-shell plate',
	'Rock-shell legs',
	'Rock-shell boots',
	'Rock-shell gloves',
	'Berserker helm',
	'Warrior helm',
	'Pet dagannoth rex',
	'Seercull',
	'Spined helm',
	'Spined body',
	'Spined chaps',
	'Spined boots',
	'Spined gloves',
	'Archer helm',
	'Pet dagannoth supreme',
	'Skeletal helm',
	'Skeletal top',
	'Skeletal bottoms',
	'Skeletal boots',
	'Skeletal gloves',
	'Mud battlestaff',
	'Pet dagannoth prime'
]);

const cerberus = resolveItems([
	'Primordial crystal',
	'Pegasian crystal',
	'Eternal crystal',
	'Smouldering stone',
	'Key master teleport',
	'Jar of souls',
	'Hellpuppy'
]);

const zulrah = resolveItems([
	"Zulrah's scales",
	'Tanzanite mutagen',
	'Magma mutagen',
	'Tanzanite fang',
	'Magic fang',
	'Serpentine visage',
	'Uncut onyx',
	'Zul-andra teleport',
	'Jar of swamp',
	'Pet snakeling',
	'Tanzanite helm',
	'Magma helm',
	'Toxic blowpipe',
	'Uncharged toxic trident',
	'Trident of the swamp',
	'Serpentine helm'
]);

const corporealbeast = resolveItems([
	'Spectral sigil',
	'Arcane sigil',
	'Elysian sigil',
	'Spirit shield',
	'Holy elixir',
	'Pet dark core',
	'Onyx bolts (e)',
	'Blessed spirit shield',
	'Spectral spirit shield',
	'Arcane spirit shield',
	'Elysian spirit shield'
]);

const kalphitequeen = resolveItems([
	'Dragon chainbody',
	'Dragon 2h sword',
	'Kq head',
	'Jar of sand',
	'Kalphite princess'
]);

const vorkath = resolveItems([
	'Superior dragon bones',
	"Vorkath's head",
	'Wrath talisman',
	'Dragonbone necklace',
	'Jar of decay',
	'Vorki',
	'Draconic visage',
	'Skeletal visage'
]);

const herblore = resolveItems([
	'Grimy guam leaf',
	'Grimy marrentill',
	'Grimy tarromin',
	'Grimy harralander',
	'Grimy ranarr weed',
	'Grimy irit leaf',
	'Grimy avantoe',
	'Grimy kwuarm',
	'Grimy cadantine',
	'Grimy dwarf weed',
	'Grimy torstol',
	'Grimy lantadyme',
	'Grimy toadflax',
	'Grimy snapdragon',
	'Guam leaf',
	'Marrentill',
	'Tarromin',
	'Harralander',
	'Ranarr weed',
	'Toadflax',
	'Irit leaf',
	'Avantoe',
	'Kwuarm',
	'Snapdragon',
	'Cadantine',
	'Lantadyme',
	'Dwarf weed',
	'Torstol',
	'Ashes',
	'Cactus spine',
	'Crushed nest',
	'Desert goat horn',
	'Limpwurt root',
	'Mort myre fungus',
	'Potato cactus',
	"Red spiders' eggs",
	'Snape grass',
	'White berries',
	'Avantoe potion (unf)',
	'Cadantine potion (unf)',
	'Dwarf weed potion (unf)',
	'Guam potion (unf)',
	'Harralander potion (unf)',
	'Irit potion (unf)',
	'Kwuarm potion (unf)',
	'Lantadyme potion (unf)',
	'Marrentill potion (unf)',
	'Ranarr potion (unf)',
	'Snapdragon potion (unf)',
	'Tarromin potion (unf)',
	'Toadflax potion (unf)',
	'Torstol potion (unf)',
	'Vial of water',
	'Eye of newt',
	'Unicorn horn dust',
	'Volcanic ash',
	'Chocolate dust',
	"Toad's legs",
	'Dragon scale dust',
	'Wine of zamorak',
	'Amylase crystal',
	'Jangerberries',
	'Poison ivy berries',
	"Zulrah's scales",
	'Crushed superior dragon bones',
	'Restore potion(1)',
	'Restore potion(2)',
	'Restore potion(3)',
	'Restore potion(4)',
	'Super restore(1)',
	'Super restore(2)',
	'Super restore(3)',
	'Super restore(4)',
	'Super attack(1)',
	'Super attack(2)',
	'Super attack(3)',
	'Super attack(4)',
	'Super defense(1)',
	'Super defense(2)',
	'Super defense(3)',
	'Super defense(4)',
	'Super strength(1)',
	'Super strength(2)',
	'Super strength(3)',
	'Super strength(4)',
	'Ranging potion(1)',
	'Ranging potion(2)',
	'Ranging potion(3)',
	'Ranging potion(4)',
	'Super energy(1)',
	'Super energy(2)',
	'Super energy(3)',
	'Super energy(4)',
	'Magic potion(1)',
	'Magic potion(2)',
	'Magic potion(3)',
	'Magic potion(4)',
	'Coconut milk',
	'Vial of blood',
	'Antifire potion(1)',
	'Antifire potion(2)',
	'Antifire potion(3)',
	'Antifire potion(4)',
	'Bastion potion(1)',
	'Bastion potion(2)',
	'Bastion potion(3)',
	'Bastion potion(4)',
	'Battlemage potion(1)',
	'Battlemage potion(2)',
	'Battlemage potion(3)',
	'Battlemage potion(4)',
	'Antidote++(1)',
	'Antidote++(2)',
	'Antidote++(3)',
	'Antidote++(4)',
	'Anti-venom(1)',
	'Anti-venom(2)',
	'Anti-venom(3)',
	'Anti-venom(4)',
	'Super combat potion(1)',
	'Super combat potion(2)',
	'Super combat potion(3)',
	'Super combat potion(4)',
	'Super antifire potion(1)',
	'Super antifire potion(2)',
	'Super antifire potion(3)',
	'Super antifire potion(4)'
]);

const farming = resolveItems([
	'Magic seed',
	'Yew seed',
	'Maple seed',
	'Willow seed',
	'Acorn',
	'Dragonfruit tree seed',
	'Palm tree seed',
	'Papaya tree seed',
	'Curry tree seed',
	'Orange tree seed',
	'Banana tree seed',
	'Apple tree seed',
	'Torstol seed',
	'Dwarf weed seed',
	'Lantadyme seed',
	'Cadantine seed',
	'Snapdragon seed',
	'Kwuarm seed',
	'Avantoe seed',
	'Irit seed',
	'Toadflax seed',
	'Ranarr seed',
	'Harralander seed',
	'Tarromin seed',
	'Marrentill seed',
	'Guam seed',
	'Spirit seed',
	'Celastrus seed',
	'Redwood tree seed',
	'Potato cactus seed',
	'Cactus seed',
	'Calquat tree seed',
	'Mahogany tree seed',
	'Teak tree seed',
	'Attas seed',
	'Iasor seed',
	'Kronos seed',
	'Hespori seed',
	'Belladonna seed',
	'Mushroom spore',
	'Grape seed',
	'Seaweed spore',
	'Poison ivy seed',
	'Whiteberry seed',
	'Jangerberry seed',
	'Dwellberry seed',
	'Cadavaberry seed',
	'Redberry seed',
	'Wildblood seed',
	'Krandorian seed',
	'Yanillian seed',
	'Jute seed',
	'Asgarnian seed',
	'Hammerstone seed',
	'Barley seed',
	'White lily seed',
	'Limpwurt seed',
	'Woad seed',
	'Nasturtium seed',
	'Rosemary seed',
	'Marigold seed',
	'Snape grass seed',
	'Watermelon seed',
	'Strawberry seed',
	'Sweetcorn seed',
	'Tomato seed',
	'Cabbage seed',
	'Onion seed',
	'Potato seed'
]);

const fletching = resolveItems([
	'Logs',
	'Oak logs',
	'Willow logs',
	'Teak logs',
	'Maple logs',
	'Mahogany logs',
	'Yew logs',
	'Magic logs',
	'Redwood logs',
	'Bronze dart tip',
	'Iron dart tip',
	'Steel dart tip',
	'Mithril dart tip',
	'Adamant dart tip',
	'Rune dart tip',
	'Dragon dart tip',
	'Feather',
	'Bronze bolts (unf)',
	'Blurite bolts (unf)',
	'Iron bolts (unf)',
	'Silver bolts (unf)',
	'Steel bolts (unf)',
	'Mithril bolts (unf)',
	'Adamant bolts (unf)',
	'Rune bolts (unf)',
	'Dragon bolts (unf)',
	'Unfinished broad bolts',
	'Opal bolt tips',
	'Jade bolt tips',
	'Pearl bolt tips',
	'Topaz bolt tips',
	'Sapphire bolt tips',
	'Emerald bolt tips',
	'Ruby bolt tips',
	'Diamond bolt tips',
	'Dragonstone bolt tips',
	'Headless arrow',
	'Bronze arrowtips',
	'Iron arrowtips',
	'Steel arrowtips',
	'Mithril arrowheads',
	'Broad arrowtips',
	'Adamant arrowtips',
	'Rune arrowtips',
	'Amethyst arrowtips',
	'Dragon arrowtips',
	'Arrow shaft',
	'Shortbow (u)',
	'Longbow (u)',
	'Oak shortbow (u)',
	'Oak longbow (u)',
	'Willow shortbow (u)',
	'Willow longbow (u)',
	'Maple shortbow (u)',
	'Maple longbow (u)',
	'Yew shortbow (u)',
	'Yew longbow (u)',
	'Magic shortbow (u)',
	'Magic longbow (u)',
	'Bow string',
	'Crossbow string',
	'flax',
	'Sinew',
	'Tanzanite fang',
	'Celastrus bark',
	'Wooden stock',
	'Oak stock',
	'Willow stock',
	'Teak stock',
	'Maple stock',
	'Mahogany stock',
	'Yew stock',
	'Magic stock',
	'Bronze limbs',
	'Blurite limbs',
	'Iron limbs',
	'Steel limbs',
	'Mithril limbs',
	'Adamantite limbs',
	'Runite limbs',
	'Dragon limbs'
]);

const agility = resolveItems([
	'Mark of grace',
	'Graceful hood',
	'Graceful cape',
	'Graceful gloves',
	'Graceful boots',
	'Graceful legs',
	'Graceful top',
	'Amylase crystal'
]);

const prayer = resolveItems([
	'Ensouled golbin head',
	'Ensouled monkey head',
	'Ensouled imp head',
	'Ensouled minotaur head',
	'Ensouled scorpion head',
	'Ensouled bear head',
	'Ensouled unicorn head',
	'Ensouled dog head',
	'Ensouled chaos druid head',
	'Ensouled giant head',
	'Ensouled ogre head',
	'Ensouled elf head',
	'Ensouled troll head',
	'Ensouled horror head',
	'Ensouled kalphite head',
	'Ensouled dagannoth head',
	'Ensouled bloodveld head',
	'Ensouled tzhaar head',
	'Ensouled demon head',
	'Ensouled aviansie head',
	'Ensouled abyssal head',
	'Ensouled dragon head',
	'Bones',
	'Babydragon bones',
	'Bat bones',
	'Big bones',
	'Burnt bones',
	'Chewed bones',
	'Curved bone',
	'Dagannoth bones',
	'Dragon bones',
	'Drake bones',
	'Fayrg bones',
	'Hydra bones',
	'Jogre bones',
	'Lava dragon bones',
	'Long bone',
	'Mangled bones',
	'Monkey bones',
	'Ourg bones',
	'Raurg bones',
	'Shaikahan bones',
	'Superior dragon bones',
	'Wolf bones',
	'Wyrm bones',
	'Wyvern bones',
	'Zogre bones'
]);

const potions = resolveItems([
	'Attack potion(1)',
	'Attack potion(2)',
	'Attack potion(3)',
	'Attack potion(4)',
	'Antipoison(1)',
	'Antipoison(2)',
	'Antipoison(3)',
	'Antipoison(4)',
	'Strength potion(1)',
	'Strength potion(2)',
	'Strength potion(3)',
	'Strength potion(4)',
	'Compost potion(1)',
	'Compost potion(2)',
	'Compost potion(3)',
	'Compost potion(4)',
	'Restore potion(1)',
	'Restore potion(2)',
	'Restore potion(3)',
	'Restore potion(4)',
	'Energy potion(1)',
	'Energy potion(2)',
	'Energy potion(3)',
	'Energy potion(4)',
	'Defense potion(1)',
	'Defense potion(2)',
	'Defense potion(3)',
	'Defense potion(4)',
	'Agility potion(1)',
	'Agility potion(2)',
	'Agility potion(3)',
	'Agility potion(4)',
	'Combat potion(1)',
	'Combat potion(2)',
	'Combat potion(3)',
	'Combat potion(4)',
	'Prayer potion(1)',
	'Prayer potion(2)',
	'Prayer potion(3)',
	'Prayer potion(4)',
	'Super attack(1)',
	'Super attack(2)',
	'Super attack(3)',
	'Super attack(4)',
	'Superantipoison(1)',
	'Superantipoison(2)',
	'Superantipoison(3)',
	'Superantipoison(4)',
	'Fishing potion(1)',
	'Fishing potion(2)',
	'Fishing potion(3)',
	'Fishing potion(4)',
	'Super energy(1)',
	'Super energy(2)',
	'Super energy(3)',
	'Super energy(4)',
	'Hunter potion(1)',
	'Hunter potion(2)',
	'Hunter potion(3)',
	'Hunter potion(4)',
	'Super strength(1)',
	'Super strength(2)',
	'Super strength(3)',
	'Super strength(4)',
	'Weapon poison',
	'Super restore (1)',
	'Super restore (2)',
	'Super restore (3)',
	'Super restore(4)',
	'Sanfew serum(1)',
	'Sanfew serum(2)',
	'Sanfew serum(3)',
	'Sanfew serum(4)',
	'Super defense(1)',
	'Super defense(2)',
	'Super defense(3)',
	'Super defense(4)',
	'Antidote+(1)',
	'Antidote+(2)',
	'Antidote+(3)',
	'Antidote+(4)',
	'Antifire potion(1)',
	'Antifire potion(2)',
	'Antifire potion(3)',
	'Antifire potion(4)',
	'Divine super attack potion(1)',
	'Divine super attack potion(2)',
	'Divine super attack potion(3)',
	'Divine super attack potion(4)',
	'Divine super defense potion(1)',
	'Divine super defense potion(2)',
	'Divine super defense potion(3)',
	'Divine super defense potion(4)',
	'Divine super strength potion(1)',
	'Divine super strength potion(2)',
	'Divine super strength potion(3)',
	'Divine super strength potion(4)',
	'Ranging potion(1)',
	'Ranging potion(2)',
	'Ranging potion(3)',
	'Ranging potion(4)',
	'Weapon poison+',
	'Diving ranging potion(1)',
	'Diving ranging potion(2)',
	'Diving ranging potion(3)',
	'Diving ranging potion(4)',
	'Magic potion(1)',
	'Magic potion(2)',
	'Magic potion(3)',
	'Magic potion(4)',
	'Stamina potion(1)',
	'Stamina potion(2)',
	'Stamina potion(3)',
	'Stamina potion(4)',
	'Zamorak brew(1)',
	'Zamorak brew(2)',
	'Zamorak brew(3)',
	'Zamorak brew(4)',
	'Divine magic potion(1)',
	'Divine magic potion(2)',
	'Divine magic potion(3)',
	'Divine magic potion(4)',
	'Antidote++(1)',
	'Antidote++(2)',
	'Antidote++(3)',
	'Antidote++(4)',
	'Bastion potion(1)',
	'Bastion potion(2)',
	'Bastion potion(3)',
	'Bastion potion(4)',
	'Battlemage potion(1)',
	'Battlemage potion(2)',
	'Battlemage potion(3)',
	'Battlemage potion(4)',
	'Saradomin brew(1)',
	'Saradomin brew(2)',
	'Saradomin brew(3)',
	'Saradomin brew(4)',
	'Weapon poison++',
	'Extended antifire(1)',
	'Extended antifire(2)',
	'Extended antifire(3)',
	'Extended antifire(4)',
	'Divine bastion potion(1)',
	'Divine bastion potion(2)',
	'Divine bastion potion(3)',
	'Divine bastion potion(4)',
	'Divine battlemage potion(1)',
	'Divine battlemage potion(2)',
	'Divine battlemage potion(3)',
	'Divine battlemage potion(4)',
	'Anti-venom(1)',
	'Anti-venom(2)',
	'Anti-venom(3)',
	'Anti-venom(4)',
	'Super combat potion(1)',
	'Super combat potion(2)',
	'Super combat potion(3)',
	'Super combat potion(4)',
	'Super antifire potion(1)',
	'Super antifire potion(2)',
	'Super antifire potion(3)',
	'Super antifire potion(4)',
	'Anti-venom+(1)',
	'Anti-venom+(2)',
	'Anti-venom+(3)',
	'Anti-venom+(4)',
	'Divine super combat potion(1)',
	'Divine super combat potion(2)',
	'Divine super combat potion(3)',
	'Divine super combat potion(4)',
	'Extended super antifire(1)',
	'Extended super antifire(2)',
	'Extended super antifire(3)',
	'Extended super antifire(4)'
]);

export const filterableTypes = [
	{
		name: 'Barrows',
		aliases: ['barrows', 'br'],
		items: barrows
	},
	{
		name: 'Skilling',
		aliases: ['skilling', 'skill'],
		items: skilling
	},
	{
		name: 'Gear',
		aliases: ['gear', 'gr'],
		items: gear
	},
	{
		name: 'Clues and Caskets',
		aliases: ['clues', 'caskets', 'cl', 'clue', 'casket', 'tt'],
		items: cluesAndCaskets
	},
	{
		name: 'God wars',
		aliases: ['gwd', 'godwars', 'gw'],
		items: godwars
	},
	{
		name: 'Dagannoth kings',
		aliases: ['dks', 'dk', 'dagannoth', 'kings'],
		items: dagannothkings
	},
	{
		name: 'Cerberus',
		aliases: ['cerb', 'ce'],
		items: cerberus
	},
	{
		name: 'Zulrah',
		aliases: ['zul', 'zulr'],
		items: zulrah
	},
	{
		name: 'Corporeal beast',
		aliases: ['corp', 'co', 'corporeal'],
		items: corporealbeast
	},
	{
		name: 'Kalphite queen',
		aliases: ['kq', 'ka', 'kalphite', 'queen'],
		items: kalphitequeen
	},
	{
		name: 'Vorkath',
		aliases: ['vorkath', 'vork'],
		items: vorkath
	},
	{
		name: 'Farming',
		aliases: ['farming', 'farm', 'seeds'],
		items: farming
	},
	{
		name: 'Herblore',
		aliases: ['herblore', 'herbs', 'unf'],
		items: herblore
	},
	{
		name: 'Fletching',
		aliases: ['fletching', 'fletch'],
		items: fletching
	},
	{
		name: 'Agility',
		aliases: ['agility', 'agi'],
		items: agility
	},
	{
		name: 'Prayer',
		aliases: ['prayer', 'pray'],
		items: prayer
	},
	{
		name: 'Potions',
		aliases: ['potions', 'pots'],
		items: potions
	}
];
