import { Injectable } from '@angular/core';
import { FileEntry } from '@ionic-native/file';
import { FileManager } from './FileManager';
import { ItemList } from './ItemList';
import { SettingsData } from './SettingsData';

export interface Account{
	data: ItemList,
	id: string
}

@Injectable()
export class FileService {

	readonly accountDirectory = "accounts";
	readonly accountExtension = ".account";

	constructor(private file: FileManager)
	{

	}


	saveAccount(account: Account): Promise<any>
	{
		return new Promise((resolve, reject) => {
			console.log("======== SAVING FILE ========");
			this.file.getDirectory(this.file.getAppDirectory().nativeURL, this.accountDirectory)
			.then((dir) =>
			{ 
				console.log("Native url: " + dir.nativeURL);
				let content = JSON.stringify(account.data);
				return this.file.writeFile(dir, account.id + this.accountExtension, content);
			})
			.then(() => 
			{
				console.log("=========== END ============");
				resolve();
			})
			.catch(err => 
			{
				console.error("[ERROR] " + err.message);
				reject(err);
			});
		});
	}

	loadAccount(file: FileEntry): Promise<Account>
	{
		return new Promise((resolve, reject) => {
			this.file.readFile(file)
			.then((content) => {
				//console.log("File: " + file.name + " | Content: " + content);
				resolve({
					data: ItemList.fromJSON(JSON.parse(content)), 
					id: file.name.substr(0, file.name.lastIndexOf('.'))
				});
			})
			.catch(err => { reject(err); });
		});
	}

	loadAllAcounts(): Promise<Array<Account>>
	{
		let accountList = new Array<Account>();
		return new Promise((resolve, reject) => {
			this.file.isAppDirectoryLoaded()
			.then(() => {
				this.file.getDirectory(this.file.getAppDirectory().nativeURL, this.accountDirectory)
				.then((dir) => {
					return this.file.listFiles(dir);
				})
				.then((entries) => {
					console.log("There is " + entries.length + " files in this directory:");
					let complete:number = 0;
					for(let i = 0; i < entries.length; i++)
					{
						this.loadAccount(entries[i])
						.then((account) => { 
							complete++; 
							accountList.push(account); 
							console.log("File loaded: " + complete + "/" + entries.length);
							
							if(complete >= entries.length)
							{
								console.log("All files loaded !");
								accountList.sort((a, b) => { return (b.data.getDate() > a.data.getDate()) ? 1 : -1; });
								resolve(accountList);
							}
						})
						.catch(err => console.error(err));
					}

				})
				.catch((err) => reject(err));
			});
		});
	}

	deleteAccount(account: Account): Promise<any>
	{
		return new Promise((resolve, reject) => {
			console.log("======== DELETING FILE ========");
			this.file.getDirectory(this.file.getAppDirectory().nativeURL, this.accountDirectory)
			.then((dir) =>
			{ 
				console.log("Native url: " + dir.nativeURL);
				return new Promise<FileEntry>((resolve, reject) => {
					dir.getFile(account.id + this.accountExtension, null, (file) => resolve(file), (err) => reject(err));
				});
			})
			.then((file) => {
				console.log("File URL: " + file.nativeURL);
				return this.file.deleteFile(file);
			})
			.then(() => 
			{
				console.log("=========== END ============");
				resolve();
			})
			.catch(err => 
			{
				console.error("[ERROR] " + err.message);
				reject(err);
			});
		});
	}
	
}