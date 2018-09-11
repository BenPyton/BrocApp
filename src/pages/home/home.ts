import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, ItemSliding } from 'ionic-angular';
import { ItemList } from '../../other/ItemList';
import { EditAccountPage } from '../EditAccount/EditAccount';
import { ListPage } from '../list/list';
import { TranslateService } from '@ngx-translate/core';
//import { FileManager } from '../../other/FileManager';
import { FileService, Account } from '../../other/FileService';
import { SettingsData } from '../../other/SettingsData';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

	private accountList: Array<Account>;

	private selectionMode:boolean = false;

	constructor(
		private modalCtrl: ModalController,
		private translate: TranslateService,
		//private file: FileManager,
		private fileService: FileService,
		private settings: SettingsData,
		private alertCtrl: AlertController,
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

		
		this.fileService.loadAllAcounts().then(accounts => { this.accountList = accounts; });
	}

	editAccount(event, account: Account, itemSliding: ItemSliding)
	{
		if(itemSliding != null) itemSliding.close();
		const modal = this.modalCtrl.create(EditAccountPage, {data: account.data});
	    // retrieve data from dismissed modal page
	    modal.onDidDismiss(data => {
	      console.log(data);

    		(data != null)
    		{
	    		if(account != null)
	    		{
	    			account.data.setName(data.name);
	    			account.data.setDescription(data.description);
	    			account.data.setDate(new Date(data.date));
	    		}
	    		else
	    		{
	    			account = {
	    				data: new ItemList(data.name, data.description, new Date(data.date)), 
	    				id: this.createId()
	    			};
					this.accountList.push(account);
	    		}
    			this.fileService.saveAccount(account);
	    	}
			
	    });
	    // show modal page
	    modal.present();
	}



	deleteAccount(event, account: Account, itemSliding: ItemSliding)
	{
		if(itemSliding != null) itemSliding.close();
		new Promise((resolve, reject) => {
			let alert = this.alertCtrl.create({
				title: this.translate.instant('ALERT.TITLE.WARNING'),
				message: this.translate.instant('ALERT.CONTENT.DELETE_ACCOUNT'),
				buttons: [
	            { // Do not delete the account
	              text: this.translate.instant('BUTTON.NO'),
	              handler: () => {
	                reject();
	              }
	            },
	            { // Confirm delete the account
	              text: this.translate.instant('BUTTON.YES'),
	              handler: () => {
	                resolve();
	              }
	            }
	          ]
			});
			alert.present();
		})
		.then(() => {
			console.log("Account \"" + account.data.getName() + "\" deleted");
			this.fileService.deleteAccount(account);
			this.accountList.splice(this.accountList.indexOf(account), 1);
		})
		.catch(() => { 
			console.log("Account \"" + account.data.getName() + "\" kept");
		});
		
	}

	openAccount(event, account: Account)
	{
		this.navCtrl.push(ListPage, account);
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


}
