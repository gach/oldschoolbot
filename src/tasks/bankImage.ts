import { Task, util, KlasaClient, TaskStore } from 'klasa';
import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, Image, registerFont } from 'canvas';
import fetch from 'node-fetch';
import { toKMB } from 'oldschooljs/dist/util/util';
import { Util, Items } from 'oldschooljs';

import {
	generateHexColorForCashStack,
	canvasImageFromBuffer,
	formatItemStackQuantity,
	cleanString,
	saveCtx,
	restoreCtx
} from '../lib/util';
import { Bank } from '../lib/types';

registerFont('./resources/osrs-font.ttf', { family: 'Regular' });
registerFont('./resources/osrs-font-compact.otf', { family: 'Regular' });
registerFont('./resources/osrs-font-bold.ttf', { family: 'Regular' });

const bankImageFile = fs.readFileSync('./resources/images/bank.png');
const bankRepeaterFile = fs.readFileSync('./resources/images/repeating.png');

const CACHE_DIR = './icon_cache';
const spacer = 12;
const itemSize = 32;
const distanceFromTop = 32;
const distanceFromSide = 16;

export default class BankImageTask extends Task {
	public itemIconsList: Set<number>;
	public itemIconImagesCache: Map<number, Image>;

	public constructor(client: KlasaClient, store: TaskStore, file: string[], directory: string) {
		super(client, store, file, directory, {});

		// This tells us simply whether the file exists or not on disk.
		this.itemIconsList = new Set();

		// If this file does exist, it might be cached in this, or need to be read from fs.
		this.itemIconImagesCache = new Map();
	}

	async init() {
		this.run();
	}

	async run() {
		this.cacheFiles();
	}

	async cacheFiles() {
		// Ensure that the icon_cache dir exists.
		fs.promises.mkdir(CACHE_DIR).catch(() => null);

		// Get a list of all files (images) in the dir.
		const filesInDir = await fs.promises.readdir(CACHE_DIR);

		// For each one, set a cache value that it exists.
		for (const fileName of filesInDir) {
			this.itemIconsList.add(parseInt(path.parse(fileName).name));
		}
	}

	async getItemImage(itemID: number): Promise<Image> {
		const isOnDisk = this.itemIconsList.has(itemID);
		const cachedImage = this.itemIconImagesCache.get(itemID);

		if (!isOnDisk) {
			await this.fetchAndCacheImage(itemID);
			return this.getItemImage(itemID);
		}

		if (!cachedImage) {
			const imageBuffer = await fs.promises.readFile(path.join(CACHE_DIR, `${itemID}.png`));
			const image = await canvasImageFromBuffer(imageBuffer);

			this.itemIconImagesCache.set(itemID, image);
			return this.getItemImage(itemID);
		}

		return cachedImage;
	}

	async fetchAndCacheImage(itemID: number) {
		const imageBuffer = await fetch(
			`https://static.runelite.net/cache/item/icon/${itemID}.png`
		).then(result => result.buffer());

		fs.promises.writeFile(path.join(CACHE_DIR, `${itemID}.png`), imageBuffer);

		const image = await canvasImageFromBuffer(imageBuffer);

		this.itemIconsList.add(itemID);
		this.itemIconImagesCache.set(itemID, image);
	}

	async generateBankImage(
		itemLoot: Bank,
		title: string = '',
		showValue = true,
		flags: { [key: string]: string | number } = {}
	): Promise<Buffer> {
		const canvas = createCanvas(488, 331);
		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFontCompact';
		ctx.imageSmoothingEnabled = false;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const backgroundImage = await canvasImageFromBuffer(bankImageFile);
		const repeaterImage = await canvasImageFromBuffer(bankRepeaterFile);

		ctx.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height);

		let loot = [];
		let totalValue = 0;

		// If some of the loot has no stored values, try to fetch them.
		const keys = Object.keys(itemLoot);
		const filteredKeys = keys.filter(
			key => typeof this.client.settings.get('prices')[key] === 'undefined'
		);

		if (showValue && filteredKeys.length > 0) {
			for (const key of filteredKeys) {
				await this.client.fetchItemPrice(key);
			}
		}

		for (const [id, lootQuantity] of Object.entries(itemLoot)) {
			// Draw value
			const itemPrice = await this.client.fetchItemPrice(id);
			let value = 0;
			if (itemPrice) {
				value = itemPrice * lootQuantity;
				totalValue += value;
			}

			loot.push({
				id: parseInt(id),
				quantity: lootQuantity,
				value
			});
		}

		// Filtering
		const searchQuery = flags.search || flags.s;
		if (searchQuery && typeof searchQuery === 'string') {
			loot = loot.filter(item => {
				const osItem = Items.get(item.id);
				if (!osItem) return false;
				return cleanString(osItem.name).includes(cleanString(searchQuery));
			});
		}

		loot = loot.filter(item => item.quantity > 0);
		if (loot.length === 0) throw 'No items found.';

		// Sorting
		loot = loot.sort((a, b) => b.value - a.value);

		// Paging
		const page = flags.page;
		if (typeof page === 'number') {
			const chunked = util.chunk(loot, 56);
			const pageLoot = chunked[page];
			if (!pageLoot) throw 'You have no items on this page.';
			loot = pageLoot;
		}

		// Draw Bank Title

		ctx.textAlign = 'center';
		ctx.font = '16px RuneScape Bold 12';

		if (showValue) {
			title += ` (Value: ${toKMB(totalValue)})`;
		}

		for (let i = 0; i < 3; i++) {
			ctx.fillStyle = '#000000';
			ctx.fillText(title, canvas.width / 2 + 1, 21 + 1);
		}
		for (let i = 0; i < 3; i++) {
			ctx.fillStyle = '#ff981f';
			ctx.fillText(title, canvas.width / 2, 21);
		}

		// Draw Items

		ctx.textAlign = 'start';
		ctx.fillStyle = '#494034';

		ctx.font = '16px OSRSFontCompact';

		const chunkedLoot = util.chunk(loot, 8);

		for (let i = 0; i < chunkedLoot.length; i++) {
			if (i > 6) {
				let state = saveCtx(ctx);
				let temp = ctx.getImageData(0, 0, canvas.width, canvas.height - 10);
				canvas.height += itemSize + (i === chunkedLoot.length ? 0 : spacer);

				const ptrn = ctx.createPattern(repeaterImage, 'repeat');
				ctx.fillStyle = ptrn;
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				ctx.putImageData(temp, 0, 0);
				restoreCtx(ctx, state);
			}
			for (let x = 0; x < chunkedLoot[i].length; x++) {
				const { id, quantity, value } = chunkedLoot[i][x];
				const item = await this.getItemImage(id);
				if (!item) continue;

				const xLoc = Math.floor(spacer + x * ((canvas.width - 40) / 8) + distanceFromSide);
				const yLoc = Math.floor(itemSize * (i * 1.22) + spacer + distanceFromTop);

				ctx.drawImage(
					item,
					xLoc + (32 - item.width) / 2,
					yLoc + (32 - item.height) / 2,
					item.width,
					item.height
				);

				const quantityColor = generateHexColorForCashStack(quantity);
				const formattedQuantity = formatItemStackQuantity(quantity);

				ctx.fillStyle = '#000000';
				for (let t = 0; t < 5; t++) {
					ctx.fillText(
						formattedQuantity,
						xLoc + distanceFromSide - 18 + 1,
						yLoc + distanceFromTop - 24 + 1
					);
				}

				ctx.fillStyle = quantityColor;
				for (let t = 0; t < 5; t++) {
					ctx.fillText(
						formattedQuantity,
						xLoc + distanceFromSide - 18,
						yLoc + distanceFromTop - 24
					);
				}

				if (flags.showvalue || flags.sv) {
					const formattedValue = Util.toKMB(value);
					ctx.fillStyle = 'black';

					for (let t = 1; t < 4; t++) {
						ctx.fillText(
							formattedValue,
							xLoc + distanceFromSide - 15 + t * 0.5,
							yLoc + distanceFromTop + t * 0.5
						);
						ctx.fillText(
							formattedValue,
							xLoc + distanceFromSide - 15 - t * 0.5,
							yLoc + distanceFromTop - t * 0.5
						);
					}

					ctx.fillStyle = generateHexColorForCashStack(value);
					for (let t = 0; t < 5; t++) {
						ctx.fillText(
							formattedValue,
							xLoc + distanceFromSide - 15,
							yLoc + distanceFromTop
						);
					}
				}
			}
		}

		return canvas.toBuffer();
	}

	async generateCollectionLogImage(
		collectionLog: number[],
		title: string = '',
		type: any
	): Promise<Buffer> {
		const canvas = createCanvas(488, 331);
		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFontCompact';
		ctx.imageSmoothingEnabled = false;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const backgroundImage = await canvasImageFromBuffer(bankImageFile);

		ctx.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height);

		ctx.textAlign = 'center';
		ctx.font = '16px RuneScape Bold 12';

		for (let i = 0; i < 3; i++) {
			ctx.fillStyle = '#000000';
			ctx.fillText(title, canvas.width / 2 + 1, 21 + 1);
		}
		for (let i = 0; i < 3; i++) {
			ctx.fillStyle = '#ff981f';
			ctx.fillText(title, canvas.width / 2, 21);
		}

		// Draw Items

		ctx.textAlign = 'start';
		ctx.fillStyle = '#494034';

		ctx.font = '16px OSRSFontCompact';

		const drawItem = async (itemID: number, x: number, y: number, hasItem: boolean) => {
			const item = await this.getItemImage(itemID);
			if (!item) return;

			if (!hasItem) {
				ctx.save();
				ctx.globalAlpha = 0.25;
			}
			ctx.drawImage(item, x + (32 - item.width) / 2, y + (32 - item.height) / 2);

			if (!hasItem) ctx.restore();
		};
		const repeaterImage = await canvasImageFromBuffer(bankRepeaterFile);
		let row = 0;

		for (const items of Object.values(type.items) as number[][]) {
			let column = 0;

			if (row > 6) {
				let state = saveCtx(ctx);
				let temp = ctx.getImageData(0, 0, canvas.width, canvas.height - 10);
				canvas.height += itemSize + spacer;

				const ptrn = ctx.createPattern(repeaterImage, 'repeat');
				ctx.fillStyle = ptrn;
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				ctx.putImageData(temp, 0, 0);
				restoreCtx(ctx, state);
			}

			for (const itemID of items.flat(Infinity)) {
				const xLoc = Math.floor(
					column * 0.7 * ((canvas.width - 40) / 8) + distanceFromSide
				);
				const yLoc = Math.floor(itemSize * (row * 1.22) + spacer + distanceFromTop);

				await drawItem(itemID, xLoc, yLoc, collectionLog.includes(itemID));

				column++;
			}
			row++;
		}

		return canvas.toBuffer();
	}
}
