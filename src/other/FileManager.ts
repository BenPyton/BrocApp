import { Injectable } from '@angular/core';
import { File, DirectoryEntry, FileEntry, DirectoryReader, FileReader } from '@ionic-native/file';

@Injectable()
export class FileManager {
	constructor(private file: File)
	{

	}

	private strErr(err) : string
	{
		return "Error: " + err.message + " | Code: " + err.code;
	}

	getFileService(): File
	{
		return this.file;
	}

	loadFile(directory: DirectoryEntry, fileName: string): Promise<string>
	{
		//console.log("Attempt to write file \"" + fileName + "\" ...");
		return new Promise((resolve, reject) => 
		{
			this.file.checkFile(directory.nativeURL, fileName)
			.then(() => 
			{
				//console.log("File \"" + fileName + "\" exists.");

				//console.log("Path: " + directory.nativeURL);
				//console.log("File: " + fileName);
				this.file.readAsText(directory.nativeURL, fileName)
				.then((content) => 
				{ 
					//console.log("Writing to an existing file succeeded !"); 
					resolve(content);
				})
				.catch((err) => 
				{ 
					//console.log("Error while writing to an existing file: " + this.strErr(err)); 
					throw new Error("Error while reading in file: " + err.message);

				});
			})
			.catch((err) => 
			{ 
				throw new Error("Error file doesn't exist: " + err.message);
			});
		});
	}

	testFile(file: FileEntry): Promise<string>
	{
		return new Promise((resolve, reject) => 
		{
			file.file((f) => {
				let reader: FileReader = new FileReader();
				reader.onloadend = (event) => 
				{ 
					console.log("File loaded: " + reader.result);
					resolve(reader.result); 
				};
				reader.readAsText(f);
			});
		});
	}

	writeFile(directory: DirectoryEntry, fileName: string, content: string|Blob): Promise<{}>
	{
		//console.log("Attempt to write file \"" + fileName + "\" ...");
		return new Promise((resolve, reject) => 
		{
			this.file.checkFile(directory.nativeURL, fileName)
			.then(() => 
			{
				//console.log("File \"" + fileName + "\" exists.");

				//console.log("Path: " + directory.nativeURL);
				//console.log("File: " + fileName);
				this.file.writeExistingFile(directory.nativeURL, fileName, content)
				.then(() => 
				{ 
					//console.log("Writing to an existing file succeeded !"); 
					resolve();
				})
				.catch((err) => 
				{ 
					//console.log("Error while writing to an existing file: " + this.strErr(err)); 
					throw new Error("Error while writing in existing file: " + err.message);

				});
			})
			.catch((err) => 
			{
				//console.log("Error: file \"" + fileName + "\" doesn't exists. Creating it...");
				//console.log("Path: " + directory.nativeURL);
				//console.log("File: " + fileName);
				this.file.writeFile(directory.nativeURL, fileName, content)
				.then(() => 
				{
					//console.log("Writing to a newly created file succeeded !");
					resolve();
				})
				.catch((err) => 
				{ 
					//console.log("Error while writing to a newly created file: " + this.strErr(err)); 
					throw new Error("Error while writing in new file: " + err.message);
				});
			});
		});
	}

	// try to get a dir and create it if don't exist. Return a DirectoryEntry.
	getDirectory(path: string, dirName: string): Promise<DirectoryEntry>
	{
		//console.log("Attempt to get directory...");
		return new Promise((resolve, reject) => 
		{
			// First check if the directory exists already
			//console.log("Checking directory existence...");
			this.file.checkDir(path, dirName)
			.then(() => 
			{
				//console.log("Directory \"" + dirName + "\" exists.");
				//console.log("Try to resolve directory url: " + (path + dirName));
				this.file.resolveDirectoryUrl(path + dirName)
				.then((dir) => {
					//console.log("Resolve successful !");
					resolve(dir);
				})
				.catch(err => 
				{
					//console.log("Error when resolving directory url: " + this.strErr(err));
					throw new Error("Cannot resolving existing directory at: \"" + path + dirName + "\".");
				});
			})
			.catch((err) => 
			{
				// file doesn't exist so we create and return it
				//console.log("Directory \"" + dirName + "\" doesn't exists. Creating it...");
				this.file.createDir(path, dirName, false)
				.then(dir => {
					//console.log("Directory \"" + dirName + "\" successfully created !");
					resolve(dir);
				})
				.catch(() => {
					//console.log("Error while directory creation: " + this.strErr(err));
					throw new Error("Cannot create new directory at path: \"" + path + "\".");
				});
			});
		});
	}

	// Return all files in a directory
	listFiles(directory: DirectoryEntry): Promise<Array<FileEntry>>
	{
		let files: Array<FileEntry> = new Array<FileEntry>();

		return new Promise((resolve, reject) => 
		{
			let reader:DirectoryReader = directory.createReader();
			reader.readEntries((entries) => {
				for(let i = 0; i < entries.length; i++)
				{
					if(entries[i].isFile)
					{
						files.push(entries[i] as FileEntry);
					}
				}
				resolve(files);
			});
		}
	}
}