import { Injectable } from "@angular/core";

@Injectable()
export class SettingsData {
     
	private language: string;
	private confirmSave: boolean;
 
    constructor() {
        this.language = 'en';
        this.confirmSave = true;
    }
  
    setLanguage(language:string)
    {
    	this.language = language;
    }

    getLanguage():string { return this.language; }
  
  	setConfirmSave(confirm: boolean) { this.confirmSave = confirm; }
  	getConfirmSave():boolean { return this.confirmSave; }

    loadSettings()
    {
    	// load settings from a file
    }

    saveSettings()
    {
    	// save settings into a file
    }
}