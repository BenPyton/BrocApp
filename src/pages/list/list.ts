import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import {EditItemPage} from '../EditItem/EditItem';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  selectedItem: any;
  items: Array<{title: string, note: string, price: number}>;
  totalGain: number;

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    this.items = [];
    for (let i = 1; i < 11; i++) {
      this.items.push({
        title: 'Item ' + i,
        note: 'This is item #' + i,
        price: 0
      });
    }
  }


  updateTotal()
  {
    this.totalGain = 0.0;
    for(let i = 0; i < this.items.length; i++)
    {
      this.totalGain += this.items[i].price;
    }
  }


  editItem(event, item)
  {
    const modal = this.modalCtrl.create(EditItemPage, {data: item});
    // retrieve data from dismissed modal page
    modal.onDidDismiss(data => {
      console.log(data);

      if(data != null)
      {
        if(item != null)
        {
          this.updateItem(item, data);
        }
        else
        {
          this.createItem(data);
        }
      }

      this.updateTotal();
    });
    // show modal page
    modal.present();
  }


  createItem(data)
  {
      // create element in the list and store data into it
      this.items.push({
        title: data.title,
        note: '',
        price: data.price
      });
  }

  updateItem(item, data)
  {
      // modify dta from tapped item
      item.title = data.title;
      item.price = data.price;
  }



}

