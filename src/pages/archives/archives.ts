import { Component } from '@angular/core';
import { NavController, Platform, MenuController, ModalController, AlertController, ItemSliding } from 'ionic-angular';
import { ItemList } from '../../other/ItemList';
import { EditAccountPage } from '../EditAccount/EditAccount';
import { ArchiveListPage } from '../archiveList/archiveList';
import { TranslateService } from '@ngx-translate/core';
import { FileService, Archive } from '../../other/FileService';
import { SettingsData } from '../../other/SettingsData';
import moment from 'moment';

@Component({
  selector: 'page-archives',
  templateUrl: 'archives.html'
})
export class ArchivesPage {

	private archiveList: Array<Archive>;

	private selectionMode:boolean = false;
	private selection:Array<number> = [];

	private unregisterBackButtonAction:any = null;

	private loadingArchives: boolean = false;

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
		console.log("Archive Page constructor");
		this.archiveList = [];
		this.loadingArchives = true;
		this.fileService.loadAllArchives().then(archives => { 
			this.archiveList = archives; 
			this.loadingArchives = false;
		});
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
				message: this.translate.instant('ALERT.CONTENT.DELETE_ARCHIVE'),
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
	        	console.log("Deleting selected archives...");
				// Sort indices descending to avoid deletion issues
				this.selection.sort((a, b) => { return b-a; });

				for(let i = 0; i < this.selection.length; i++)
				{
					//this.deleteArchive(null, this.accountList[this.selection[i]], null);
					this.fileService.deleteArchive(this.archiveList[this.selection[i]]);
					this.archiveList.splice(this.selection[i], 1);
				}

				this.selection = [];
				this.disableSelectionMode();
			}
			else
			{
				console.log("Archives not deleted !");
			}
		})
    	.catch((err) => console.error("Error: " + err.message));
	}

	// deleteArchive(event, archive: Archive, itemSliding: ItemSliding)
	// {
	// 	if(itemSliding != null) itemSliding.close();
	// 	new Promise((resolve, reject) => {
	// 		let alert = this.alertCtrl.create({
	// 			title: this.translate.instant('ALERT.TITLE.WARNING'),
	// 			message: this.translate.instant('ALERT.CONTENT.DELETE_ACCOUNT'),
	// 			buttons: [
	//             { // Do not delete the archive
	//               text: this.translate.instant('BUTTON.NO'),
	//               handler: () => {
	//                 reject();
	//               }
	//             },
	//             { // Confirm delete the archive
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
	// 		console.log("Archive \"" + archive.name + "\" deleted");
	// 		this.fileService.deleteArchive(archive);
	// 		this.archiveList.splice(this.archiveList.indexOf(archive), 1);
	// 	})
	// 	.catch(() => { 
	// 		console.log("Archive \"" + archive.name + "\" kept");
	// 	});
	// }

	openArchive(event, archive: Archive)
	{
		if(!this.selectionMode)
		{
			this.fileService.loadArchive(archive)
			.then((account) => {
				this.navCtrl.push(ArchiveListPage, account);
			})
			.catch((err) => console.error("[ERROR] ", err));
		}
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
