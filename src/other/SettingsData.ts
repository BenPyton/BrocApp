import { Injectable } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
// import 'moment/locale/en-gb';
// import 'moment/locale/fr';

interface DataJSON {
    language: string;
    confirmSave: boolean;
    currency: string;
}

@Injectable()
export class SettingsData {
    private data: DataJSON;
 
    constructor(private translate: TranslateService) 
    {
        console.log("SettingsData constructor");

        this.data = {
            language: this.translate.getBrowserLang(),
            confirmSave: true,
            currency: "$"
        }
        
        this.translate.setDefaultLang('en');
        //moment().locale('en');
    }
  
    setLanguage(language:string) { this.data.language = language; }
    getLanguage():string { return this.data.language; }
  
  	setConfirmSave(confirm: boolean) { this.data.confirmSave = confirm; }
  	getConfirmSave():boolean { return this.data.confirmSave; }

    setCurrency(value: string) { this.data.currency = value; }
    getCurrency(): string { return this.data.currency; }

    getData(): DataJSON { return this.data; }
}