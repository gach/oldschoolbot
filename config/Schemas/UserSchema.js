const { Client } = require('klasa');

Client.defaultUserSchema
	.add('totalCommandsUsed', 'integer', { default: 0 })
	.add('GP', 'integer', { default: 0 })
	.add('autoupdate', 'boolean', { default: false })
	.add('RSN', 'string', { min: 1, max: 12, default: null })
	.add('pets', 'any', { default: {} });
