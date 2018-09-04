
// used for serialization and deserialization.
interface ItemJSON
{
	name: string;
	description: string;
	price: number;
}

export class Item 
{
	constructor(private name:string, private description: string, private price: number)
	{

	}

	getName(): string { return this.name; }
	setName(name: string) { this.name = name; }

	getDescription(): string { return this.description; }
	setDescription(description: string) { this.description = description; }

	getPrice(): number { return this.price; }
	setPrice(price: number) { this.price = price; }

	toJSON(): ItemJSON {
		return Object.assign({}, this, 
			{
				name: this.name, 
				description: this.description, 
				price: this.price
			});
	}

	static fromJSON(json: ItemJSON): Item {
		let item = Object.create(Item.prototype);
		return Object.assign(item, json);
	}
}

// 	Exemple d'utilisation du json :
//	let data = JSON.stringify(new Item("bidule", "", 3));
//	let item = Item.fromJson(JSON.parse(data));