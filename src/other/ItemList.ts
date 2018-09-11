
import { Item } from './ItemModel';

// used for serialization and deserialization.
interface ItemListJSON
{
	name: string;
	description: string;
	date: string;
	items: object[];
}

export class ItemList 
{
	private items: Array<Item>;
	private total: number;

	constructor(private name:string, private description: string, private date: Date)
	{
		this.items = [];
		this.total = 0.0;
	}

	getName(): string { return this.name; }
	setName(name: string) { this.name = name; }

	getDescription(): string { return this.description; }
	setDescription(description: string) { this.description = description; }

	getDate(): Date { return this.date; }
	setDate(date: Date) { this.date = date; }

	getLength(): number { return this.items.length; }
	getArray(): Array<Item> { return this.items; }

	getItem(index: number) : Item { return this.items[index]; }
	setItem(index: number, item: Item) { this.items[index] = item; }

	addItem(item: Item)
	{
		this.items.push(item);
	}

	removeItemAt(index: number)
	{
		this.items.splice(index, 1);
	}

	removeItem(item: Item)
	{
		let index:number = this.items.indexOf(item);
		if(index != -1) this.items.splice(index, 1);
	}

	updateTotal()
	{
	    this.total = 0.0;
	    for(let i = 0; i < this.items.length; i++)
	    {
	      this.total += this.items[i].getPrice();
	    }
	    console.log("Update total");
	}

	getTotal() : number { return this.total; }

	toJSON(): ItemListJSON {
		return Object.assign({}, this, 
			{
				name: this.name, 
				description: this.description, 
				date: this.date.toJSON(),
				items: this.items
			});
	}

	static fromJSON(json: ItemListJSON): ItemList {
		let itemList = Object.create(ItemList.prototype);
		//console.log(json.items);
		return Object.assign(itemList, json, {
			date: new Date(json.date),
			items: Array.from<object, Item>(json.items, 
				(item: object) => 
				{ 
					return Item.fromJSON(<any>item); 
				})
		});
	}
}