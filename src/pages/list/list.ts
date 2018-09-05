import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController, ItemSliding } from 'ionic-angular';
import { File, DirectoryEntry } from '@ionic-native/file';
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

  strErr(err) : string
  {
    return "Error: " + err.message + " | Code: " + err.code;
  }

  writeFile(directory: DirectoryEntry): Promise<{}>
  {
    let fileName:string = 'test';

    console.log("Attempt to write file \"" + fileName + "\" ...");
    return new Promise((resolve, reject) => {
        this.file.checkFile(directory.nativeURL, fileName)
      .then(() => 
      {
        console.log("File \"" + fileName + "\" exists.");

        console.log("Path: " + directory.nativeURL);
        console.log("File: " + fileName);
        this.file.writeExistingFile(directory.nativeURL, fileName, 'this is an existing test.')
        .then(() => { console.log("Writing to an existing file succeeded !"); })
        .catch((err) => { console.log("Error while writing to an existing file: " + this.strErr(err)); });
      })
      .catch((err) => 
      {
        console.log("Error: file \"" + fileName + "\" doesn't exists. Creating it...");
        console.log("Path: " + directory.nativeURL);
        console.log("File: " + fileName);
        this.file.writeFile(directory.nativeURL, fileName, 'this is a new test.')
        .then(() => {console.log("Writing to a newly created file succeeded !")})
        .catch((err) => { console.log("Error while writing to a newly created file: " + this.strErr(err)); });
      });
    });
  }

  // try to get a dir and create it if don't exist. Return a DirectoryEntry.
  getDirectory(path: string, dirName: string): Promise<DirectoryEntry>
  {
    console.log("Attempt to get directory...");
    return new Promise((resolve, reject) => 
    {
      // First check if the directory exists already
      console.log("Checking directory existence...");
      this.file.checkDir(path, dirName)
      .then(() => 
      {
        console.log("Directory \"" + dirName + "\" exists.");
        console.log("Try to resolve directory url: " + (path + dirName));
        this.file.resolveDirectoryUrl(path + dirName)
        .then((dir) => {
          console.log("Resolve successful !");
          resolve(dir);
        })
        .catch(err => 
        {
          console.log("Error when resolving directory url: " + this.strErr(err));
          throw new Error("Cannot resolving existing directory at: \"" + path + dirName + "\".");
        });
      })
      .catch((err) => 
      {
        // file doesn't exists
        console.log("Directory \"" + dirName + "\" doesn't exists. Creating it...");
        this.file.createDir(path, dirName, false)
        .then(dir => {
          console.log("Directory \"" + dirName + "\" successfully created !");
          resolve(dir);
        })
        .catch(() => {
          console.log("Error while directory creation: " + this.strErr(err));
          throw new Error("Cannot create new directory at path: \"" + path + "\".");
        });
      });
    });
  }


  // Doesn't work yet
  saveFile()
  {
    let dirName:string = 'mydir';
    console.log("======== SAVING FILE ========");
    this.getDirectory(this.file.dataDirectory, dirName)
    .then((dir) =>
    { 
      console.log("Full path: " + dir.fullPath);
      console.log("Native url: " + dir.nativeURL);
      return this.writeFile(dir);
    })
    .then(() => 
    {
      console.log("=========== END ============");
    })
    .catch(err => 
    {
      console.log(err.message);
    })

    // console.log("Attempt to save file...");
    // this.file.checkDir(this.file.dataDirectory, dirName)
    // .then(() => 
    // {
    //   console.log("Directory \"" + dirName + "\" exists.");
    //   // file exists
    //   this.file.listDir(this.file.dataDirectory, dirName)
    //   .then(entries => 
    //   {
    //     // console.log("List of current entries in directory:");
    //     // for(let i = 0; i < entries.length; i++)
    //     // {
    //     //   console.log(entries[i].name);
    //     // }
    //     console.log("Resolve dir: " + (this.file.dataDirectory + dirName));
    //     this.file.resolveDirectoryUrl(this.file.dataDirectory + dirName)
    //     .then((dir) => {

    //       this.writeFile(dir);
    //     })
    //     .catch(err => 
    //     {
    //       console.log("Error when resolving directory url: " + this.strErr(err));
    //     });
    //   })
    //   .catch((err) => 
    //   {
    //     console.log("Error: cannot read entries of the directory.");
    //   });
    // })
    // .catch((err) => 
    // {
    //   // file doesn't exists
    //   console.log("Error: directory \"" + dirName + "\" doesn't exists. Creating it...");
    //   this.file.createDir(this.file.dataDirectory, dirName, false)
    //   .then(dir => {
    //     console.log("Directory \"" + dirName + "\" successfully created !");

    //     this.writeFile(dir);
    //   });
    // });
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
      // let data = JSON.stringify(this.account);
      // let account = ItemList.fromJSON(JSON.parse(data));
      // console.log("Data : " + data);
      // console.log("List name: " + account.getName());
      // console.log("List length: " + account.getLength());
      // console.log("Items 1: " + account.getArray()[0].toString());
      // console.log("Items 1 name: " + account.getArray()[0].getName());
      this.saveFile();
  }

}

