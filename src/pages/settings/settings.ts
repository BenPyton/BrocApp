import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { SettingsData } from '../../other/SettingsData';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

	private language: string;
	private confirmSave = true;

	constructor(
		private translate: TranslateService,
		private settings: SettingsData,
		public navCtrl: NavController) 
	{
		this.language = this.translate.currentLang;
		console.log("Language: " + this.translate.currentLang)
	}

	
	languageChanged(value: string)
	{
		this.settings.setLanguage(value);
		this.translate.use(value);
		console.log("language changed: " + value);
	}

	confirmSaveChanged(value: any)
	{
		this.settings.setConfirmSave(value.checked);
		console.log("Confirm save: " + value.checked);
	}
}
