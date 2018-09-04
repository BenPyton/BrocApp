import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { ItemList } from '../../other/ItemList';
import { EditAccountPage } from '../EditAccount/EditAccount';
import { ListPage } from '../list/list';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

	private accounts: Array<ItemList>;

	constructor(
		private modalCtrl: ModalController,
		private translate: TranslateService,
		public navCtrl: NavController) 
	{
		this.accounts = [];
	}

	editAccount(event, account: ItemList)
	{
		const modal = this.modalCtrl.create(EditAccountPage, {data: account});
	    // retrieve data from dismissed modal page
	    modal.onDidDismiss(data => {
	      console.log(data);

	      if(data != null)
	      {
	        if(account != null)
	        {
	          account.setName(data.name);
	        }
	        else
	        {
			  this.accounts.push(new ItemList(data.name, "This is a test account.", new Date()));
	        }
	      }
	    });
	    // show modal page
	    modal.present();
	}

	openAccount(event, account: ItemList)
	{
		this.navCtrl.push(ListPage, {data: account});
	}

}
