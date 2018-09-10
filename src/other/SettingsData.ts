import { Injectable } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { FileManager } from './FileManager';

interface DataJSON {
    language: string;
    confirmSave: boolean;
    currency: string;
}

@Injectable()
export class SettingsData {
     
	//private language: string;
	//private confirmSave: boolean;
    //private currency: string;

    private data: DataJSON;
 
    constructor(
        private translate: TranslateService, 
        private file:FileManager) 
    {
        console.log("SettingsData constructor");

        this.data = {
            language: this.translate.getBrowserLang(),
            confirmSave: true,
            currency: "$"
        }
        
        this.translate.setDefaultLang('en');
    }
  
    setLanguage(language:string) { this.data.language = language; }
    getLanguage():string { return this.data.language; }
  
  	setConfirmSave(confirm: boolean) { this.data.confirmSave = confirm; }
  	getConfirmSave():boolean { return this.data.confirmSave; }

    setCurrency(value: string) { this.data.currency = value; }
    getCurrency(): string { return this.data.currency; }

    loadSettings(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            // load settings from a file
            console.log("Attempting to load setting file...");
            this.file.loadFile(this.file.getAppDirectory(), "settings.cfg")
            .then((content) => 
            {
                console.log("Content: " + content);

                let data = JSON.parse(content);
                this.data.language = data.language;
                this.data.confirmSave = data.confirmSave;
                this.data.currency = data.currency;
            })
            .catch((err) => 
            {
                //console.warn("Warning: " + err);
                //console.log("Browser lang: " + this.translate.getBrowserLang());
                //reject(err);
            })
            .then(() => {
                this.translate.use(this.data.language);

                resolve();
            });
        });
    }

    saveSettings(): Promise<any>
    {
        return new Promise((resolve, reject) => {
        	// save settings into a file
            let content = JSON.stringify(this.data);
            console.log("Attempting to save setting file... content: " + content);
            this.file.writeFile(this.file.getAppDirectory(), "settings.cfg", content)
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