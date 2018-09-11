import { Component, ViewChild } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard';
import { NavParams, ModalController, ViewController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { Item } from '../../other/ItemModel';

@Component({
  selector: 'page-editItem',
  templateUrl: 'EditItem.html'
})
export class EditItemPage {

  private group: FormGroup;
  @ViewChild('itemName') itemNameInput;

  constructor(
    private keyboard: Keyboard,
    private formBuilder: FormBuilder,
    public navParams: NavParams, 
    public modalCtrl: ModalController, 
    public viewCtrl: ViewController) 
  {
    let data = navParams.get('data');
    if(data == null)
    {
      data = new Item('', '', 0);
    }

    this.group = this.formBuilder.group({
      name: [data.getName(), Validators.required],
      description: [data.getDescription()],
      price: [data.getPrice().toFixed(2), Validators.compose([Validators.required, Validators.pattern(/-?[0123456789]+((,|\.)[0123456789]*)?/)])]
    });
  }

  ionViewDidLoad()
  {
    setTimeout(() => {
      this.keyboard.show();
      this.itemNameInput.setFocus();
    }, 500);
  }

  addPrice(value: number)
  {
    let str:string = this.group.value.price;
    let newValue:number = ((str.length > 0) ? Number.parseFloat(str.replace(/,/, '.')) : 0) + value;
    this.group.get('price').setValue(newValue.toFixed(2));
    //console.log("added price: " + value + " | total price: " + this.group.value.price);
  }

  resetPrice()
  {
    this.group.get('price').setValue((0).toFixed(2));
  }


  dismiss(data)
  {
    this.viewCtrl.dismiss(data);
  }
}

