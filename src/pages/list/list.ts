import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController, ItemSliding } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { TranslateService } from '@ngx-translate/core';
import { SettingsData } from '../../other/SettingsData';
import { EditItemPage } from '../EditItem/EditItem';
import { Item } from '../../other/ItemModel';
import { ItemList } from '../../other/ItemList';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  selectedItem: any;
  account: ItemList;
  totalGain: number = 0;
  private dirty:boolean = false;

  constructor(
    private file:File,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private settings: SettingsData,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public modalCtrl: ModalController) 
  {
    // If we navigated to this page, we will have an item available as a nav param
    this.account = navParams.get('data');

    // this.account = new ItemList("test", "this is a test", new Date());
    // for (let i = 1; i < 11; i++) {
    //   this.account.addItem(new Item('Item ' + i, 'This is item #' + i, 0));
    // }
  }

  // Doesn't work yet
  saveFile()
  {
    this.file.checkDir(this.file.dataDirectory, 'mydir')
    .then(() => {
      // file exists
      this.file.listDir(this.file.dataDirectory, 'mydir')
      .then(entries => {
        for(let i = 0; i < entries.length; i++)
        {
          console.log(entries[i].name);
        }
      });
    }).catch((err) => {
      // file doesn't exists
      console.log("Error: directory doesn't exists.");
      this.file.createDir(this.file.dataDirectory, 'mydir', false)
      .then(dir => {
        this.file.checkFile(dir.fullPath, 'test')
        .then(() => {
          this.file.writeExistingFile(dir.fullPath, 'test', 'this is ae existing test.')
          .then(() => {console.log("Writing to an existing file succeeded !")})
          .catch(() => { console.log("Error while writing to an existing file."); });
        }).catch(() => {
          this.file.writeFile(dir.fullPath, 'test', 'this is a new test.')
          .then(() => {console.log("Writing to a newly created file succeeded !")})
          .catch(() => { console.log("Error while writing to a newly created file."); });
        });
      });
    });
  }

  // Work great but no file saving yet
  ionViewCanLeave()
  {
    if(this.dirty) // Whether to display confirm message or not
    {
      return new Promise((resolve, reject) => {

        // no confirm message, automaticaly save data
        if(!this.settings.getConfirmSave())
        {
          console.log("Auto Save");
          resolve();
        }
        // else show confirm message

        let alertTitle: string = this.translate.instant("SAVE_ALERT.TITLE");
        let alertContent: string = this.translate.instant("SAVE_ALERT.CONTENT");
        let buttonCancel: string = this.translate.instant("BUTTON.CANCEL");
        let buttonYes: string = this.translate.instant("BUTTON.YES");
        let buttonNo: string = this.translate.instant("BUTTON.NO");

        // confirm quitting with save or not
        let alert = this.alertCtrl.create({
          title: alertTitle,
          message: alertContent,
          buttons: [
            { // Do not quit the current page
              text: buttonCancel,
              role: 'cancel',
              handler: () =>{
                console.log("Canceled");
                reject();
              }
            },
            { // Quit the page but don't save changes
              text: buttonNo,
              handler: () => {
                console.log("Not saved.");
                resolve();
              }
            },
            { // Quit the page and save all changes
              text: buttonYes,
              handler: () => {
                console.log("Saved !");
                resolve();
              }
            }
          ]
        });
        // Present the alert to the user
        alert.present()
      });
    }
  }

  editItem(event, item: Item, sliding: ItemSliding)
  {
    if(sliding != null) sliding.close();
    const modal = this.modalCtrl.create(EditItemPage, {data: item});
    // retrieve data from dismissed modal page
    modal.onDidDismiss(data => {
      console.log(data);

      if(data != null)
      {
        if(item != null) // modify dta from tapped item
        {
          item.setName(data.name);
          item.setDescription(data.description);
          item.setPrice(data.price);
        }
        else // create element in the list and store data into it
        {
          this.account.addItem(new Item(data.name, data.description, data.price));
        }
        
        this.dirty = true;
        this.account.updateTotal();
      }
    });
    // show modal page
    modal.present();
  }


  deleteItem(event, item: Item)
  {
    this.account.removeItem(item);
    console.log("Delete item: " + item.getName());
    this.dirty = true;
    this.account.updateTotal();
  }

  testJSON()
  {
      let data = JSON.stringify(this.account);
      console.log("Test ! : " + data);
      // let account = ItemList.fromJSON(JSON.parse(data));
      // console.log("Data : " + data);
      // console.log("List name: " + account.getName());
      // console.log("List length: " + account.getLength());
      // console.log("Items 1: " + account.getArray()[0].toString());
      // console.log("Items 1 name: " + account.getArray()[0].getName());
      //this.saveFile();
  }

}

