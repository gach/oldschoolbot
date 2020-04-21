import {
	ProviderConfig,
	RedditAppConfig,
	TwitterAppConfig,
	MongoDBConfig,
	PatreonConfig
} from './lib/types';
import { KlasaClientOptions } from 'klasa';

export const botToken = '';
export const providerConfig: ProviderConfig | null = {
	default: 'json'
};
export const production = require('os').platform() === 'linux';

export const clientSecret = '';
export const clientID = '';
export const KDHPort = null;

export const twitchClientID: string | null = null;
export const redditAppConfig: RedditAppConfig = null;
export const twitterAppConfig: TwitterAppConfig = null;
export const mongoDBConfig: MongoDBConfig = null;
export const patreonConfig: PatreonConfig = null;
export const customClientOptions: KlasaClientOptions = {
	prefix: '-'
};
