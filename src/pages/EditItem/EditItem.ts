import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
@Component({
  selector: 'page-editItem',
  templateUrl: 'EditItem.html'
})
export class EditItemPage {

  private group: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public navParams: NavParams, 
    public modalCtrl: ModalController, 
    public viewCtrl: ViewController) 
  {
    let data = navParams.get('data');
    if(data == null)
    {
      data = { title: '', not: '', price: 0 };
    }

    this.group = this.formBuilder.group({
      title: [data.title, Validators.required],
      description: [data.note],
      price: [data.price]
    });
    
  }

  addPrice(value: number)
  {
    let newValue:number = this.group.value.price + value;
    this.group.get('price').setValue(Number.parseFloat(newValue.toFixed(2)));
    console.log("added price: " + value + " | total price: " + this.group.value.price);
  }


  dismiss(data)
  {
    this.viewCtrl.dismiss(data);
  }
}

