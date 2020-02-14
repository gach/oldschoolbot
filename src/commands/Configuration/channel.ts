import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { GuildSettings } from '../../lib/GuildSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			permissionLevel: 6,
			usage: '<disable|enable>'
		});
	}

	async run(msg: KlasaMessage, [input]: [string]) {
		const isDisabled = msg.guild?.settings
			.get(GuildSettings.StaffOnlyChannels)
			.includes(msg.channel.id);

		if (input === 'disable') {
			if (isDisabled) throw `This channel is already disabled.`;

			await msg.guild!.settings.update(GuildSettings.StaffOnlyChannels, msg.channel.id, {
				arrayAction: 'add'
			});

			return msg.sendLocale('CHANNEL_DISABLED');
		}
		if (!isDisabled) throw `This channel is already enabled.`;

		await msg.guild!.settings.update(GuildSettings.StaffOnlyChannels, msg.channel.id, {
			arrayAction: 'remove'
		});

		return msg.sendLocale('CHANNEL_ENABLED');
	}
}
