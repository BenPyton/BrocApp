import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AppVersion } from '@ionic-native/app-version';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

	private appName: string = "";
	private appVersion: string = "";

	constructor(
		private translate: TranslateService,
		private version: AppVersion,
		public navCtrl: NavController) 
	{

		this.version.getAppName().then((name) => { 
			this.appName = name; 
			console.log("AppName: " + name); 
		});

		this.version.getVersionNumber().then((version) => {
			this.appVersion = version;
			console.log("Version: " + version);
		});
		
	}
}
