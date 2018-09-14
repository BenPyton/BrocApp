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
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  id: string;
  account: ItemList;
  totalGain: number = 0;
  private dirty:boolean = false;

  private selectionMode:boolean = false;
  private selection:Array<number> = [];

  private unregisterBackButtonAction:any = null;

  private pauseSubscribe: any = null;
  private resumeSubscribe: any = null;

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
    this.id = navParams.get('id');
    console.log("Id: " + this.id);

    this.platform.ready()
    .then(() => {
      console.log("Subscribing to pause and resume...");
      this.pauseSubscribe = this.platform.pause.subscribe(() => {
        this.file.saveTmpAccount(this.account)
        .catch(err => console.error("[ERROR] ", err));
        console.log("PAUSE");
      });

      this.resumeSubscribe = this.platform.resume.subscribe(() => {
        this.file.loadTmpAccount()
        .then(list => { 
          this.account = list; 
        })
        .catch(err => console.error("[ERROR] ", err));
        console.log("RESUME");
      });
    });
  }

  ionViewWillLeave()
  {
    this.pauseSubscribe.unsubscribe();
    this.resumeSubscribe.unsubscribe();
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
          this.file.saveAccount({data: this.account, id: this.id});
          return resolve();
        }
        // else show confirm message

        let alertTitle: string = this.translate.instant("ALERT.TITLE.SAVE");
        let alertContent: string = this.translate.instant("ALERT.CONTENT.SAVE");
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
                this.file.loadAccountFromID(this.id)
                .then((account) => {
                  console.log("Account reloaded !");
                  this.account.setList(account.data);
                  resolve();
                }).catch((err) => console.error(err));
                
              }
            },
            { // Quit the page and save all changes
              text: buttonYes,
              handler: () => {
                console.log("Saved !");
                this.file.saveAccount({data: this.account, id: this.id});
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

  enableSelectionMode(index: number)
  {
    if(this.selectionMode == false)
    {
      this.selectionMode = true;
      this.toggleSelection(index);
      this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
        this.disableSelectionMode();
      }, 110);
    }
  }

  disableSelectionMode()
  {
    this.selectionMode = false;
    this.selection = [];
    if(this.unregisterBackButtonAction != null)
      this.unregisterBackButtonAction();
  }

  checkSelection(index: number): boolean
  {
    return this.selection.indexOf(index) >= 0;
  }

  toggleSelection(index: number)
  {
    let k = this.selection.indexOf(index);
    if(k >= 0)
    {
      this.selection.splice(k, 1);
    }
    else
    {
      this.selection.push(index);
    }

    console.log("Selection: ", this.selection);
  }

  deleteSelection()
  {
    new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: this.translate.instant('ALERT.TITLE.WARNING'),
        message: this.translate.instant('ALERT.CONTENT.DELETE_ITEM'),
        buttons: [
              { // Do not delete the account
                text: this.translate.instant('BUTTON.NO'),
                handler: () => {
                  resolve(false);
                }
              },
              { // Confirm delete the account
                text: this.translate.instant('BUTTON.YES'),
                handler: () => {
                  resolve(true);
                }
              }
            ]
      });
      alert.present();
    })
    .then((confirm) => {
      if(confirm)
      {
        console.log("Deleting selected items...");
        // Sort indices descending to avoid deletion issues
        this.selection.sort((a, b) => { return b-a; });

        for(let i = 0; i < this.selection.length; i++)
        {
          this.deleteItem(null, (this.account.getArray())[this.selection[i]])
        }

        this.selection = [];
      }
      else
      {
        console.log("Items not deleted !");
      }
    })
    .catch((err) => console.error("Error: " + err.message));
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
          item.setPrice(Number.parseFloat(data.price.replace(/,/, '.')));
        }
        else // create element in the list and store data into it
        {
          this.account.addItem(new Item(data.name, data.description, Number.parseFloat(data.price)));
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

}

