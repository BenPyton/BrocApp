import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { FileManager } from '../other/FileManager';
import { AndroidPermissions } from '@ionic-native/android-permissions';

import { HomePage } from '../pages/home/home';
import { SettingsPage } from '../pages/settings/settings';
import { SettingsData } from '../other/SettingsData';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{title: string, component: any}>;

  constructor(
    private translate: TranslateService,
    private permissions: AndroidPermissions,
    private alertCtrl: AlertController,
    private file: FileManager,
    private settings: SettingsData,
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen) 
  {

    console.log("AppComponent constructor");


    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: "MENU.HOME", component: HomePage },
      { title: "MENU.SETTINGS", component: SettingsPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      console.log("Device ready !");
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.checkPermissions()
      .then((result) => { if (result == false) navigator['app'].exitApp(); });


      this.file.setAppDirectory("BrocApp")
      .then(() => {
        return this.settings.loadSettings();
      })
      .catch((err) => {
        console.error("[ERROR] " + err.message);
      });


      
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }


  checkPermissions(): Promise<boolean>
  {
    console.log("Checking for permissions.");
    return new Promise((resolve, reject) => {
      this.permissions.checkPermission(this.permissions.PERMISSION.READ_EXTERNAL_STORAGE)
      .then(result => {
        console.log("Has permission : " + result.hasPermission);
        if(result.hasPermission == false)
        {
          console.log("Request permission...");
          this.permissions.requestPermission(this.permissions.PERMISSION.READ_EXTERNAL_STORAGE)
          .then((result) => {
            console.log("Result: " + result.hasPermission);
            if(result.hasPermission == false)
              this.showWarningMessage(this.translate.instant("ALERT.CONTENT.PERMISSIONS"))
              .then(() => resolve(false));
            else
              resolve(true);
          });
        }
        else
        {
          resolve(true);
        }
      })
      .catch(err => {
        console.log("Error: " + err.message);
        reject(err);
      });
    });
  }

  showWarningMessage(content: string): Promise<any>
  {
    return new Promise((resolve, reject) =>
    {
      let alertTitle: string = this.translate.instant("ALERT.TITLE.WARNING");
      let alertContent: string = content;
      let buttonOk: string = this.translate.instant("BUTTON.OK");

      let alert = this.alertCtrl.create({
          title: alertTitle,
          message: alertContent,
          buttons: [ { text: buttonOk, handler: () => { resolve(); } } ]
        });

      alert.present();
    });
  }
}
