import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			subcommands: true,
			enabled: true,
			runIn: ['text'],
			usage: '<on|off>',
			permissionLevel: 7,
			description: 'Sends all reddit comments and posts made by OSRS Jmods to your channel.',
			examples: ['+jmodcomments on', '+jmodcomments off']
		});
	}

	async on(msg: KlasaMessage) {
		if (msg.guild!.settings.get(GuildSettings.JMODComments) === msg.channel.id) {
			return msg.sendLocale('JMOD_COMMENTS_ALREADY_ENABLED');
		}
		if (msg.guild!.settings.get(GuildSettings.JMODComments) !== null) {
			await msg.guild!.settings.update(GuildSettings.JMODComments, msg.channel.id);
			return msg.sendLocale('JMOD_COMMENTS_ENABLED_OTHER');
		}
		await msg.guild!.settings.update(GuildSettings.JMODComments, msg.channel.id);
		return msg.sendLocale('JMOD_COMMENTS_ENABLED');
	}

	async off(msg: KlasaMessage) {
		if (msg.guild!.settings.get(GuildSettings.JMODComments) === null) {
			return msg.sendLocale('JMOD_COMMENTS_ARENT_ENABLED');
		}
		await msg.guild!.settings.reset(GuildSettings.JMODComments);
		return msg.sendLocale('JMOD_COMMENTS_DISABLED');
	}
}
