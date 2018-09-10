import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController, ItemSliding } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { SettingsData } from '../../other/SettingsData';
import { EditItemPage } from '../EditItem/EditItem';
import { Item } from '../../other/ItemModel';
import { ItemList } from '../../other/ItemList';
import { FileManager } from '../../other/FileManager';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  id: string;
  account: ItemList;
  totalGain: number = 0;
  private dirty:boolean = false;

  constructor(
    //private file:File,
    private fileMngr: FileManager,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private settings: SettingsData,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public modalCtrl: ModalController) 
  {
    // If we navigated to this page, we will have an item available as a nav param
    this.account = navParams.get('data');
    this.id = navParams.get('id');
    console.log("Id: " + this.id);
  }


  saveFile()
  {
    console.log("======== SAVING FILE ========");
    this.fileMngr.getDirectory(this.fileMngr.getAppDirectory().nativeURL, "accounts")
    .then((dir) =>
    { 
      console.log("Native url: " + dir.nativeURL);
      let content = JSON.stringify(this.account);
      return this.fileMngr.writeFile(dir, this.id + ".account", content);
    })
    .then(() => 
    {
      console.log("=========== END ============");
    })
    .catch(err => 
    {
      console.log("[ERROR] " + err.message);
      let alert = this.alertCtrl.create({
        title: "ERROR",
        message: err.message,
        buttons: ['Ok']
      });
      // Present the alert to the user
      alert.present();
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
          this.saveFile();
          return resolve();
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
                this.saveFile();
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
    let dirName = "BrocApp";
    // let data = JSON.stringify(this.account);
    // let account = ItemList.fromJSON(JSON.parse(data));
    // console.log("Data : " + data);
    // console.log("List name: " + account.getName());
    // console.log("List length: " + account.getLength());
    // console.log("Items 1: " + account.getArray()[0].toString());
    // console.log("Items 1 name: " + account.getArray()[0].getName());
    //this.saveFile();
    this.fileMngr.getDirectory(this.fileMngr.getFileService().externalRootDirectory, dirName)
    .then((dir) => {
      // return this.fileMngr.listFiles(dir)
      // .then((entries) => {
      //   console.log("List files of directory: " + dirName);
      //   for(let i = 0; i < entries.length; i++)
      //   {
      //     console.log("File: " + entries[i].name);
      //   }
      // });

      //return this.fileMngr.getFileService().listDir(this.fileMngr.getFileService().externalRootDirectory, dirName);
      // return new Promise<Entry[]>((resolve, reject) => {
      //   let reader:DirectoryReader = dir.createReader();
      //   reader.readEntries((entries) => resolve(entries), (err) => reject(err));
      // });
      return this.fileMngr.listFiles(dir);
    })
    .then((entries) => { 
        for(let i = 0; i < entries.length; i++)
        {
          console.log("File: " + entries[i].name);
        }
      console.log("End.")
    })
    .catch((err) => {
      console.log("Error: " + err.message);
    });
  }

}

