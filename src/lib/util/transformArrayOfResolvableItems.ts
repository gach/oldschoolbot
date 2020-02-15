import { Items } from 'oldschooljs';

// Resolve an array of item IDs or names into an array of item IDs
export function transformArrayOfResolvableItems(itemArray: (number | string)[]): number[] {
	const newArray: number[] = [];

	for (const item of itemArray) {
		if (typeof item === 'number') {
			newArray.push(item);
		} else {
			const osItem = Items.get(item);
			if (!osItem) {
				console.error(`No item found for: ${item}.`);
				continue;
			}
			newArray.push(osItem.id);
		}
	}

	return newArray;
}
