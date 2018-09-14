import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { Keyboard } from '@ionic-native/keyboard';
import { AppVersion } from '@ionic-native/app-version';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SettingsPage } from '../pages/settings/settings';
import { AboutPage } from '../pages/about/about';
import { ListPage } from '../pages/list/list';
import { ArchivesPage } from '../pages/archives/archives';
import { ArchiveListPage } from '../pages/archiveList/archiveList';
import { EditItemPage } from '../pages/EditItem/EditItem';
import { EditAccountPage } from '../pages/EditAccount/EditAccount';
import { SettingsData } from '../other/SettingsData';
import { FileManager } from '../other/FileManager';
import { FileService } from '../other/FileService';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AndroidPermissions } from '@ionic-native/android-permissions';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.lang');
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    EditItemPage,
    EditAccountPage,
    SettingsPage,
    ArchivesPage,
    ArchiveListPage,
    AboutPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    EditItemPage,
    EditAccountPage,
    SettingsPage,
    ArchivesPage,
    ArchiveListPage,
    AboutPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    File,
    Keyboard,
    SettingsData,
    FileManager,
    FileService,
    AndroidPermissions,
    AppVersion,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
