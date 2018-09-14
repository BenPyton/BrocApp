import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { FileEntry, DirectoryEntry } from '@ionic-native/file';
import { FileManager } from './FileManager';
import { ItemList } from './ItemList';
import { SettingsData } from './SettingsData';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
// import 'moment/locale/en-gb';
// import 'moment/locale/fr';


export interface Account{
	data: ItemList,
	id: string
}

export interface Archive{
	name: string
	date: Date,
	total: number
}

@Injectable()
export class FileService {


	private appDirectory: DirectoryEntry;
	private appDirectoryLoaded: boolean = false;
	readonly accountDirectory: string = "accounts";
	readonly accountExtension: string = ".account";
	readonly archiveDirectory: string = "archives";
	readonly archiveExtension: string = ".archive";
	readonly archiveSeparator: string = "__";
	readonly configFile: string = "settings.cfg";
	private isAndroid: boolean = false;
	private isReady: boolean = false;

	constructor(
		private file: FileManager, 
		private settings: SettingsData, 
		private translate: TranslateService,
		private platform: Platform)
	{
		this.platform.ready().then(() => {
			this.isReady = true;
			if(this.platform.is("android"))
			{
				console.log("Platform android.");
				this.isAndroid = true;

				this.setAppDirectory("BrocApp")
				.then(() => {
					return this.loadSettings();
				})
				.catch((err) => {
					console.error("[ERROR] " + err.message);
				});
			}
			else
			{
				console.log("Unknown platform.");
			}

		});

	}


	isAppDirectoryLoaded(): Promise<any>
	{
		return new Promise((resolve, reject) => {
			let waitForLoad = () =>
			{
				if(this.isReady && !this.isAndroid) return reject(new Error("Platform is not android."));
				if(this.appDirectoryLoaded) return resolve();
				console.log("Polling for app directory loaded...")
				setTimeout(waitForLoad, 30); // Relaunch function after 30ms
			}
			waitForLoad();
		});
	}

	getAppDirectory(): DirectoryEntry { return this.appDirectory; }
	setAppDirectory(dirName: string): Promise<any>
	{ 
		this.appDirectoryLoaded = false;
		return new Promise((resolve, reject) => {
			this.file.getDirectory(this.file.getFileService().externalRootDirectory, dirName)
			.then((dir) => 
			{
				this.appDirectory = dir;
				this.appDirectoryLoaded = true;
				resolve();
			})
			.catch((err) => 
			{
				//console.error("[ERROR] Cannot get directory \"" + dirName + "\": " + err.message);
				reject(err);
			});
		});
	}


	saveAccount(account: Account): Promise<any>
	{
		return new Promise((resolve, reject) => {
			console.log("======== SAVING FILE ========");
			this.file.getDirectory(this.appDirectory.nativeURL, this.accountDirectory)
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

	saveTmpAccount(itemList: ItemList): Promise<any>
	{
		return new Promise((resolve, reject) => {
			console.log("======== TEMPING FILE ========");
			this.isAppDirectoryLoaded()
			.then(() =>
			{
				let content = JSON.stringify(itemList);
				return this.file.writeFile(this.appDirectory, "tmp" + this.accountExtension, content);
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

	loadTmpAccount(): Promise<ItemList>
	{
		return new Promise((resolve, reject) => {
			console.log("======== TEMPING FILE ========");
			this.isAppDirectoryLoaded()
			.then(() => {
				return new Promise<FileEntry>((res, rej) => {
					this.appDirectory.getFile("tmp" + this.accountExtension, null,
					file => res(file),
					err => rej(err));
				});
			})
			.then((file) =>
			{
				return this.file.readFile(file);
			})
			.then((content) => 
			{
				console.log("=========== END ============");
				resolve(ItemList.fromJSON(JSON.parse(content)));
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

	loadAccountFromID(id: string): Promise<Account>
	{
		return new Promise((resolve, reject) => {
			this.isAppDirectoryLoaded().then(() => {
				this.file.getDirectory(this.appDirectory.nativeURL, this.accountDirectory)
				.then((dir) => {
					dir.getFile(id + this.accountExtension, null,
					(file) => {
						this.loadAccount(file).then((account) => resolve(account), (err) => reject(err));
					}, (err) => reject(err));
				});
			});
		});
	}

	loadAllAcounts(): Promise<Array<Account>>
	{
		let accountList = new Array<Account>();
		return new Promise((resolve, reject) => {
			this.isAppDirectoryLoaded()
			.then(() => {
				this.file.getDirectory(this.appDirectory.nativeURL, this.accountDirectory)
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
			this.file.getDirectory(this.appDirectory.nativeURL, this.accountDirectory)
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


	// ######################### ARCHIVES #########################

	archiveAccount(account: Account): Promise<any>
	{
		return new Promise((resolve, reject) => {
			this.isAppDirectoryLoaded().then(() => {
				this.file.getDirectory(this.appDirectory.nativeURL, this.accountDirectory)
				.then((dir) => {
					return this.file.getDirectory(this.appDirectory.nativeURL, this.archiveDirectory);
				})
				.then((dir) => {
					return this.file.getFileService().moveFile(
						this.appDirectory.nativeURL + this.accountDirectory,
						account.id + this.accountExtension,
						dir.nativeURL,
						this.createArchiveFileName(account));
				})
				.then(() => {
					console.log("Account successfully archived !");
					resolve();
				})
				.catch((err) => reject(err));
			});
		});
	}


	loadAllArchives(): Promise<Array<Archive>>
	{
		let archiveList = new Array<Archive>();
		return new Promise((resolve, reject) => {
			this.isAppDirectoryLoaded()
			.then(() => {
				this.file.getDirectory(this.appDirectory.nativeURL, this.archiveDirectory)
				.then((dir) => {
					return this.file.listFiles(dir);
				})
				.then((entries) => {
					console.log("There is " + entries.length + " files in this directory:");
					for(let i = 0; i < entries.length; i++)
					{
						let index = entries[i].name.lastIndexOf('.');
						let str:string = entries[i].name.substring(0, index);
						let arr:string[] = str.split(this.archiveSeparator);
						let archive:Archive = {
							name: arr[0],
							date: new Date(arr[1]),
							total: Number.parseFloat(arr[2])
						}
						console.log(entries[i].name);
						console.log("STR: " + str + " | " + index);
						console.log("Archive: " + arr[0] + " | " + arr[1] + " | " + arr[2]);

						archiveList.push(archive);
					}
					archiveList.sort((a, b) => { return (b.date > a.date) ? 1 : -1; });
					resolve(archiveList);
				})
				.catch((err) => reject(err));
			});
		});
	}

	loadArchive(archive: Archive): Promise<Account>
	{
		return new Promise((resolve, reject) => {
			this.isAppDirectoryLoaded()
			.then(() => {
				return this.file.getDirectory(this.appDirectory.nativeURL, this.archiveDirectory)
			})
			.then((dir) => {
				return new Promise<FileEntry>((res, rej) => {
					let name: string = this.getArchiveFileName(archive);
					console.log("Getting file \"" + name + "\"");
					dir.getFile(name, null,
						file => res(file),
						err => rej(err));
				});
			})
			.then((file) => {
				console.log("Reading file \"" + file.name + "\"");
				return this.file.readFile(file);
			})
			.then((content) => {
				console.log("Content of the file: " + content);
				resolve({
					data: ItemList.fromJSON(JSON.parse(content)), 
					id: "archive"
				});
			})
			.catch((err) => reject(err));
		});
	}

	deleteArchive(archive: Archive): Promise<any>
	{
		return new Promise((resolve, reject) => {
			console.log("======== DELETING FILE ========");
			this.file.getDirectory(this.appDirectory.nativeURL, this.archiveDirectory)
			.then((dir) =>
			{ 
				console.log("Native url: " + dir.nativeURL);
				return new Promise<FileEntry>((resolve, reject) => {
					dir.getFile(this.getArchiveFileName(archive), null, (file) => resolve(file), (err) => reject(err));
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

	private getArchiveFileName(archive: Archive): string {
		return archive.name + this.archiveSeparator 
		+ archive.date.toISOString().substring(0, 10) + this.archiveSeparator 
		+ archive.total + this.archiveExtension;
	}

	private createArchiveFileName(account: Account): string {
		return account.data.getName() + this.archiveSeparator 
		+ account.data.getDate().toISOString().substring(0, 10) + this.archiveSeparator 
		+ account.data.getTotal() + this.archiveExtension
	}

	// ######################### SETTINGS #########################
	
	loadSettings(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            // load settings from a file
            console.log("Attempting to load setting file...");
            this.file.loadFile(this.appDirectory, this.configFile)
            .then((content) => 
            {
                console.log("Content: " + content);

                let data = JSON.parse(content);
                this.settings.setLanguage(data.language);
                this.settings.setConfirmSave(data.confirmSave);
                this.settings.setCurrency(data.currency);
                this.translate.use(this.settings.getLanguage());
            })
            .catch((err) => 
            {
                //console.warn("Warning: " + err);
                //console.log("Browser lang: " + this.translate.getBrowserLang());this.data = {
		        this.settings.setLanguage(this.translate.getBrowserLang());
		        this.settings.setConfirmSave(false),
		        //this.settings.setCurrency(this.translate.get()


                this.translate.use(this.settings.getLanguage());
                this.translate.get("SETTINGS.DEFAULT_CURRENCY")
                .subscribe((result: string) => {
                	this.settings.setCurrency(result);
                });
                //reject(err);
            })
            .then(() => {
                //moment().locale(this.settings.getLanguage());

                resolve();
            });
        });
    }

    saveSettings(): Promise<any>
    {
        return new Promise((resolve, reject) => {
        	// save settings into a file
            let content = JSON.stringify(this.settings.getData());
            console.log("Attempting to save setting file... content: " + content);
            this.file.writeFile(this.appDirectory, this.configFile, content)
            .then(() => 
            {
                console.log("File save successful !");
                resolve();
            })
            .catch((err) => 
            {
                //console.log("ERROR: " + err);
                reject(err);
            });
        })
    }
}