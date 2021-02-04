import { client } from '../../../..';
import PatreonTask from '../../../../tasks/patreon';
import { Channel } from '../../../constants';
import { sendToChannelID } from '../../../util/webhook';
import { GithubSponsorsWebhookData } from '../../githubApiTypes';
import { FastifyServer } from '../../types';
import { getUserFromGithubID, parseStrToTier, verifyGithubSecret } from '../../util';

const githubSponsors = (server: FastifyServer) =>
	server.route({
		method: 'POST',
		url: '/webhooks/github_sponsors',
		async handler(request, reply) {
			const isVerified = verifyGithubSecret(
				JSON.stringify(request.body),
				request.headers['x-hub-signature']
			);
			if (!isVerified) {
				throw reply.badRequest();
			}
			const data = request.body as GithubSponsorsWebhookData;
			console.log(JSON.stringify(data, null, 4));
			console.log(`Received webhook from Github sponsors`);
			const user = await getUserFromGithubID(data.sender.id.toString());
			switch (data.action) {
				case 'created': {
					const tier = parseStrToTier(data.sponsorship.tier.name);
					sendToChannelID(client, Channel.NewSponsors, {
						content: `${data.sender.login}[${data.sender.id}] became a Tier ${
							tier - 1
						} sponsor.`
					});
					if (user) {
						await (client.tasks.get('patreon') as PatreonTask)!.givePerks(
							user.id,
							tier
						);
					}
					break;
				}
				case 'tier_changed':
				case 'pending_tier_change': {
					const from = parseStrToTier(data.changes!.tier.from.name);
					const to = parseStrToTier(data.sponsorship.tier.name);
					sendToChannelID(client, '357422607982919680', {
						content: `${data.sender.login}[${
							data.sender.id
						}] changed their sponsorship from Tier ${from - 1} to Tier ${to - 1}.`
					});
					if (user) {
						await (client.tasks.get('patreon') as PatreonTask)!.changeTier(
							user.id,
							from,
							to
						);
					}
					break;
				}
				case 'cancelled': {
					if (user) {
						await (client.tasks.get('patreon') as PatreonTask)!.removePerks(user.id);
					}

					sendToChannelID(client, '357422607982919680', {
						content: `${data.sender.login}[${data.sender.id}] cancelled being a Tier ${
							parseStrToTier(data.sponsorship.tier.name) - 1
						} sponsor. ${
							user
								? 'Removing perks.'
								: "Cant remove perks because couldn't find discord user."
						}`
					});

					break;
				}
			}

			return reply.send({});
		},
		config: {}
	});

export default githubSponsors;
