import { Event, EventStore } from 'klasa';
import { MessageEmbed, TextChannel } from 'discord.js';
import * as he from 'he';
import * as Twit from 'twit';

import { privateConfig } from '../config';

const ALL_TWITTERS = [
	/* OSRS Streamers/Youtubers */
	'940563176', // SoupRS
	'184349515', // MmorpgCP
	'557647030', // Skiddler
	'525302599', // Sick_Nerd
	'3187663593', // WooxSolo
	'2169865003', // RSAlfierules
	'1894180640', // B0atyOSRS
	'2462052530', // afriendrs
	'1634264438', // Hey_Jase
	'1569065179', // monnixxx
	'3589736181', // Kacy
	'2307540361', // Faux_Freedom
	'2411777869', // Mr_Mammal
	'3256936132', // Dalek_Cookie
	'3318825773', // Knightenator
	'1307366604', // MatK
	'702224459491647488', // rsnRRobert
	'803844588100325376', // ZuluOnly
	'709141790503211008', // LakeOSRS,
	'868269438394675201', // SettledRS
	'786858980400390144', // Wolf
	/* OSRS Jagex Mods */
	'2726160938', // JagexCurse
	'3362141061', // JagexKieren
	'3870174875', // JagexSween
	'2818884683', // JagexArchie
	'1858363524', // JagexWeath
	'2279036881', // JagexJohnC
	'1205666185', // OldSchoolRS
	'1712662364', // JagexAsh
	'794223611297091584', // JagexLottie
	'734716002831900672', // JagexWest
	'824932930787094528', // JagexLenny
	'998580261137911808', // JagexBruno
	'732227342144307200', // JagexRoq
	'740546260533383168', // JagexEd
	'849322141002727425', // JagexRy
	'889399884788453376', // JagexAcorn
	'1088015657982152706', // JagexTide
	'1008655742428221440', // JagexMunro
	'1001866988803772416', // JagexGambit
	'1090608917560901632', // JagexNasty
	'1067444118765412352', // JagexGee
	'1102924576449880064', // JagexHusky
	'1158375416467509248', // JagexFlippy
	'1178684006352719873', // JagexOasis
	/* HCIM Deaths */
	'797859891373371392', // HCIM_Deaths
	/* Hexis */
	'760605320108310528'
];

const JMOD_TWITTERS = [
	'1205666185',
	'3362141061',
	'3870174875',
	'2818884683',
	'1858363524',
	'2279036881',
	'1712662364',
	'2726160938',
	'824932930787094528',
	'740546260533383168',
	'998580261137911808',
	'794223611297091584',
	'734716002831900672',
	'732227342144307200',
	'849322141002727425',
	'889399884788453376',
	'1090608917560901632',
	'1001866988803772416',
	'1067444118765412352',
	'1088015657982152706',
	'1008655742428221440',
	'1102924576449880064',
	'1158375416467509248',
	'1178684006352719873'
];

const STREAMER_TWITTERS = [
	'786858980400390144',
	'3589736181',
	'1894180640',
	'184349515',
	'2307540361',
	'557647030',
	'525302599',
	'3187663593',
	'2169865003',
	'940563176',
	'1569065179',
	'2411777869',
	'3256936132',
	'3318825773',
	'2462052530',
	'803844588100325376',
	'1634264438',
	'709141790503211008',
	'702224459491647488',
	'868269438394675201',
	'1307366604'
];

const HCIM_DEATHS = ['797859891373371392'];
const HEXIS = ['760605320108310528'];
const HEXIS_CHANNEL = '626168717004242953';

interface Tweet {
	text: string;
	url: string;
	name: string;
	avatar: string;
	image: string;
	id: string;
	authorURL: string;
}

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { once: true, event: 'klasaReady' });
		this.enabled = this.client.production;
	}

	async init() {
		if (!privateConfig!.twitterApp) {
			this.disable();
		}
	}

	run() {
		const twitter = new Twit(privateConfig!.twitterApp);

		const stream = twitter.stream('statuses/filter', { follow: ALL_TWITTERS });

		stream.on('tweet', this.handleTweet.bind(this));
	}

	handleTweet(tweet: any) {
		// If its a retweet, return.
		if (tweet.retweeted || tweet.delete) {
			return;
		}

		// If it's a reply, return.
		if (tweet.in_reply_to_status_id_str || tweet.in_reply_to_user_id_str) {
			return;
		}

		if (tweet.retweeted_status && !HEXIS.includes(tweet.user.id_str)) {
			return;
		}

		const _tweet = tweet.extended_tweet ? tweet.extended_tweet : tweet;

		const formattedTweet = {
			text: he.decode(tweet.extended_tweet ? tweet.extended_tweet.full_text : tweet.text),
			url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
			name: he.decode(tweet.user.name),
			avatar: tweet.user.profile_image_url_https,
			image: (_tweet.entities.media && _tweet.entities.media[0].media_url_https) || null,
			id: tweet.user.id_str,
			authorURL: `https://twitter.com/${tweet.user.screen_name}/`
		};

		this.sendTweet(formattedTweet);
	}

	sendTweet({ text, url, name, avatar, image, id, authorURL }: Tweet) {
		const embed = new MessageEmbed()
			.setDescription(`\n ${text}`)
			.setColor(1942002)
			.setThumbnail(avatar)
			.setAuthor(name, undefined, authorURL)
			.setImage(image);

		let key: string;
		if (JMOD_TWITTERS.includes(id)) key = 'tweetchannel';
		else if (STREAMER_TWITTERS.includes(id)) key = 'streamertweets';
		else if (HCIM_DEATHS.includes(id)) key = 'hcimdeaths';
		else if (HEXIS.includes(id)) key = 'hexis';
		else return;

		if (key === 'hexis') {
			return (this.client.channels.get(HEXIS_CHANNEL) as TextChannel)!
				.send(`<${url}>`, { embed })
				.catch(() => null);
		}

		this.client.guilds
			.filter(guild => Boolean(guild.settings.get(key as string)))
			.map(guild => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore
				const channel = guild.channels.get(guild.settings.get(key));
				if (channel && channel instanceof TextChannel && channel.postable) {
					channel.send(`<${url}>`, { embed }).catch(() => null);
				}
			});
	}
}
