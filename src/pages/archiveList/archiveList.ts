import { Component } from '@angular/core';
import { NavController, Platform, NavParams, ModalController, AlertController, ItemSliding } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { SettingsData } from '../../other/SettingsData';
import { EditItemPage } from '../EditItem/EditItem';
import { Item } from '../../other/ItemModel';
import { ItemList } from '../../other/ItemList';
import { FileManager } from '../../other/FileManager';
import { FileService } from '../../other/FileService';

@Component({
  selector: 'page-archivelist',
  templateUrl: 'archiveList.html'
})
export class ArchiveListPage {
  account: ItemList;

  constructor(
    private fileMngr: FileManager,
    private file: FileService,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private settings: SettingsData,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public modalCtrl: ModalController,
    public platform: Platform) 
  {
    // If we navigated to this page, we will have an item available as a nav param
    this.account = navParams.get('data');
  }
}

