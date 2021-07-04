import { Intents } from 'discord.js';
import { KlasaClient, KlasaClientOptions } from 'klasa';

import { customClientOptions, production, providerConfig } from '../../config';
import permissionLevels from './permissionLevels';

export const clientOptions: KlasaClientOptions = {
	/* Discord.js Options */
	messageCacheMaxSize: 200,
	messageCacheLifetime: 120,
	messageSweepInterval: 120,
	owners: ['157797566833098752'],
	// disableEveryone: true,
	shards: 'auto',
	http: {
		api: 'https://discord.com/api'
	},
	intents: new Intents([
		'GUILDS',
		'GUILD_MEMBERS',
		'GUILD_MESSAGES',
		'GUILD_MESSAGE_REACTIONS',
		'DIRECT_MESSAGES',
		'DIRECT_MESSAGE_REACTIONS'
	]),
	/* Klasa Options */
	createPiecesFolders: false,
	prefix: '+',
	providers: providerConfig ?? undefined,
	permissionLevels,
	pieceDefaults: { commands: { deletable: true } },
	readyMessage: (client: KlasaClient) => `[Old School Bot] Ready to serve ${client.guilds.cache.size} guilds.`,
	partials: ['USER'],
	production,
	...customClientOptions
};
