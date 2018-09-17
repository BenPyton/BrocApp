import { Component } from '@angular/core';
import { NavController, Platform, MenuController, ModalController, AlertController, ItemSliding } from 'ionic-angular';
import { ItemList } from '../../other/ItemList';
import { EditAccountPage } from '../EditAccount/EditAccount';
import { ListPage } from '../list/list';
import { TranslateService } from '@ngx-translate/core';
import { FileService, Account } from '../../other/FileService';
import { SettingsData } from '../../other/SettingsData';
import moment from 'moment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

	private accountList: Array<Account>;

	private selectionMode:boolean = false;
	private selection:Array<number> = [];

	private unregisterBackButtonAction:any = null;

	private loadingAccounts: boolean = false;

	constructor(
		private modalCtrl: ModalController,
		private translate: TranslateService,
		private fileService: FileService,
		private settings: SettingsData,
		private alertCtrl: AlertController,
		public navCtrl: NavController,
		public menuCtrl: MenuController,
		public platform: Platform) 
	{
		console.log("Home Page constructor");
		this.accountList = [];
		this.loadingAccounts = true;

		// this.platform.pause.subscribe(() => {
		// console.log("Pause App");
		// 	this.settings.saveSettings()
		// 	.catch((err) => {
		// 		console.error("[ERROR] " + err.message);
		// 	});
		// });
		
		console.log("waiting for permissions...");
		this.fileService.waitForPermission()
		.then(() => {
			console.log("Loading accounts...");
			return this.fileService.loadAllAcounts();
		})
		.then(accounts => { 
			this.accountList = accounts; 
			this.loadingAccounts = false; 
		})
		.catch((err) => console.error("[ERROR] ", err));
	}

	editAccount(event, account: Account, itemSliding: ItemSliding)
	{
		if(itemSliding != null) itemSliding.close();
		const modal = this.modalCtrl.create(EditAccountPage, {data: account ? account.data : null});
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
					this.accountList.sort((a, b) => { return (b.data.getDate() > a.data.getDate()) ? 1 : -1; });
	    		}
    			this.fileService.saveAccount(account);
	    	}
			
	    });
	    // show modal page
	    modal.present();
	}

	enableSelectionMode(index: number)
	{
		if(this.selectionMode == false)
		{
			this.selectionMode = true;
			this.toggleSelection(index);
			this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
				this.disableSelectionMode();
			}, 110);
		}
	}

	disableSelectionMode()
	{
		this.selectionMode = false;
		this.selection = [];
		if(this.unregisterBackButtonAction != null)
			this.unregisterBackButtonAction();
	}

	checkSelection(index: number): boolean
	{
		return this.selection.indexOf(index) >= 0;
	}

	toggleSelection(index: number)
	{
		let k = this.selection.indexOf(index);
		if(k >= 0)
		{
			this.selection.splice(k, 1);
		}
		else
		{
			this.selection.push(index);
		}

		console.log("Selection: ", this.selection);
	}

	deleteSelection()
	{
		new Promise((resolve, reject) => {
			let alert = this.alertCtrl.create({
				title: this.translate.instant('ALERT.TITLE.WARNING'),
				message: this.translate.instant('ALERT.CONTENT.DELETE_ACCOUNT'),
				buttons: [
	            { // Do not delete the account
	              text: this.translate.instant('BUTTON.NO'),
	              handler: () => {
	                resolve(false);
	              }
	            },
	            { // Confirm delete the account
	              text: this.translate.instant('BUTTON.YES'),
	              handler: () => {
	                resolve(true);
	              }
	            }
	          ]
			});
			alert.present();
		})
		.then((confirm) => {
			if(confirm)
			{
	        	console.log("Deleting selected accounts...");
				// Sort indices descending to avoid deletion issues
				this.selection.sort((a, b) => { return b-a; });

				for(let i = 0; i < this.selection.length; i++)
				{
					//this.deleteAccount(null, this.accountList[this.selection[i]], null);
					this.fileService.deleteAccount(this.accountList[this.selection[i]]);
					this.accountList.splice(this.selection[i], 1);
				}

				this.selection = [];
				this.disableSelectionMode();
			}
			else
			{
				console.log("Accounts not deleted !");
			}
		})
    	.catch((err) => console.error("Error: " + err.message));
	}

	archiveSelection()
	{
		new Promise((resolve, reject) => {
			let alert = this.alertCtrl.create({
				title: this.translate.instant('ALERT.TITLE.WARNING'),
				message: this.translate.instant('ALERT.CONTENT.ARCHIVE_ACCOUNT'),
				buttons: [
	            { // Do not delete the account
	              text: this.translate.instant('BUTTON.NO'),
	              handler: () => {
	                resolve(false);
	              }
	            },
	            { // Confirm delete the account
	              text: this.translate.instant('BUTTON.YES'),
	              handler: () => {
	                resolve(true);
	              }
	            }
	          ]
			});
			alert.present();
		})
		.then((confirm) => {
			if(confirm)
			{
	        	console.log("Archiving selected accounts...");
				// Sort indices descending to avoid deletion issues
				this.selection.sort((a, b) => { return b-a; });

				for(let i = 0; i < this.selection.length; i++)
				{
					//this.deleteAccount(null, this.accountList[this.selection[i]], null);
					this.fileService.archiveAccount(this.accountList[this.selection[i]]);
					this.accountList.splice(this.selection[i], 1);
				}

				this.selection = [];
				this.disableSelectionMode();
			}
			else
			{
				console.log("Accounts not archived !");
			}
		})
    	.catch((err) => console.error("Error: " + err.message));
	}

	// deleteAccount(event, account: Account, itemSliding: ItemSliding)
	// {
	// 	if(itemSliding != null) itemSliding.close();
	// 	new Promise((resolve, reject) => {
	// 		let alert = this.alertCtrl.create({
	// 			title: this.translate.instant('ALERT.TITLE.WARNING'),
	// 			message: this.translate.instant('ALERT.CONTENT.DELETE_ACCOUNT'),
	// 			buttons: [
	//             { // Do not delete the account
	//               text: this.translate.instant('BUTTON.NO'),
	//               handler: () => {
	//                 reject();
	//               }
	//             },
	//             { // Confirm delete the account
	//               text: this.translate.instant('BUTTON.YES'),
	//               handler: () => {
	//                 resolve();
	//               }
	//             }
	//           ]
	// 		});
	// 		alert.present();
	// 	})
	// 	.then(() => {
	// 		console.log("Account \"" + account.data.getName() + "\" deleted");
	// 		this.fileService.deleteAccount(account);
	// 		this.accountList.splice(this.accountList.indexOf(account), 1);
	// 	})
	// 	.catch(() => { 
	// 		console.log("Account \"" + account.data.getName() + "\" kept");
	// 	});
	// }

	openAccount(event, account: Account)
	{
		if(!this.selectionMode)
		{
			this.navCtrl.push(ListPage, account);
		}
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



	getDateFormat(date: Date): string 
	{
		// let day:string = date.getDate().toString();
		// let month:string = (date.getMonth()+1).toString();
		// let year:string = date.getFullYear().toString();
		// return (day.length < 2 ? '0' : '') + day + '/' + (month.length < 2 ? '0' : '') + month + '/' + year;

		return moment(date).format("ddd DD MMM YYYY");
	}
}
