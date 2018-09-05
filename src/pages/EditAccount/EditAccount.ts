import { Component, ViewChild } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard';
import { NavParams, ModalController, ViewController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { ItemList } from '../../other/ItemList';

@Component({
  selector: 'page-editAccount',
  templateUrl: 'EditAccount.html'
})
export class EditAccountPage {

  private group: FormGroup;
  @ViewChild('accountName') accountNameInput;

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
      data = new ItemList('', '', new Date());
    }

    this.group = this.formBuilder.group({
      name: [data.getName(), Validators.required],
      description: [data.getDescription()],
      date: [data.getDate().toJSON()]
    });
  }

  ionViewDidLoad()
  {
    setTimeout(() => {
      this.keyboard.show();
      this.accountNameInput.setFocus();
    }, 500);
  }

  dismiss(data)
  {
    this.viewCtrl.dismiss(data);
  }

  getCurrentYear()
  {
    return new Date().getFullYear();
  }
}

