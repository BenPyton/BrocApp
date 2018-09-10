import { Component } from '@angular/core';
import { NavController, ModalController, ItemSliding } from 'ionic-angular';
import { ItemList } from '../../other/ItemList';
import { EditAccountPage } from '../EditAccount/EditAccount';
import { ListPage } from '../list/list';
import { TranslateService } from '@ngx-translate/core';
import { FileManager } from '../../other/FileManager';
import { FileService, Account } from '../../other/FileService';
import { SettingsData } from '../../other/SettingsData';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

	private accountList: Array<Account>;

	constructor(
		private modalCtrl: ModalController,
		private translate: TranslateService,
		private file: FileManager,
		private fileService: FileService,
		private settings: SettingsData,
		public navCtrl: NavController) 
	{
		console.log("Home Page constructor");
		this.accountList = [];


		// this.platform.pause.subscribe(() => {
		// console.log("Pause App");
		// 	this.settings.saveSettings()
		// 	.catch((err) => {
		// 		console.error("[ERROR] " + err.message);
		// 	});
		// });

		
		//this.getAccountList();
		this.fileService.loadAllAcounts().then(accounts => { this.accountList = accounts; });
	}

	editAccount(event, account: ItemList, itemSliding: ItemSliding)
	{
		if(itemSliding != null) itemSliding.close();
		const modal = this.modalCtrl.create(EditAccountPage, {data: account});
	    // retrieve data from dismissed modal page
	    modal.onDidDismiss(data => {
	      console.log(data);

    		(data != null)
    		
    		if(account != null)
    		{
    			account.setName(data.name);
    			account.setDescription(data.description);
    			account.setDate(new Date(data.date));
    		}
    		else
    		{
    			let account: Account = {
    				data: new ItemList(data.name, data.description, new Date(data.date)), 
    				id: this.createId()
    			};
    			this.fileService.saveAccount(account);
				this.accountList.push(account);
    		}
			
	    });
	    // show modal page
	    modal.present();
	}

	createId(): string
	{
		let date = new Date();

		let str = {
			year: date.getFullYear().toString(),
			month: (date.getMonth()+1).toString(),
			day: date.getDate().toString(),
			hours: date.getHours().toString(),
			minutes: date.getMinutes().toString(),
			seconds: date.getSeconds().toString()
		}

		let pad = function(value: string, length: number): string {
			let result:string = value;
			if(value.length < length)
			{
				for(let i = 0; i < length - value.length; i++){
					result = '0' + result;
				}
			}
			return result;
		}

		return str.year + pad(str.month, 2) + pad(str.day, 2) + pad(str.hours, 2) + pad(str.minutes, 2) + pad(str.seconds, 2);
	}

	deleteAccount(event, account: {data: ItemList, id:string })
	{
		this.accountList.splice(this.accountList.indexOf(account), 1);
		console.log("Delete account: " + account.data.getName());
	}

	openAccount(event, account: {data: ItemList, id:string })
	{
		this.navCtrl.push(ListPage, account);
	}


	// getAccountList()
	// {
	// 	this.file.isAppDirectoryLoaded()
	// 	.then(() => {
	// 		this.file.getDirectory(this.file.getAppDirectory().nativeURL, "accounts")
	// 		.then((dir) => {
	// 			return this.file.listFiles(dir);
	// 		})
	// 		.then((entries) => {
	// 			console.log("There is " + entries.length + " files in this directory:");
	// 			for(let i = 0; i < entries.length; i++)
	// 			{
	// 				// this.file.readFile(entries[i])
	// 				// .then((content) => {
	// 				// 	console.log("File: " + entries[i].name + " | Content: " + content);
	// 				// 	this.accountList.push({
	// 				// 		data: ItemList.fromJSON(JSON.parse(content)), 
	// 				// 		id: entries[i].name.substr(0, entries[i].name.lastIndexOf('.'))
	// 				// 	});
	// 				// })
	// 				// .catch(err => console.error(err));
	// 				this.fileService.loadAccount(entries[i])
	// 				.then((account) => this.accountList.push(account))
	// 				.catch(err => console.error(err));
	// 			}
	// 		});
	// 	});
	// }

}
