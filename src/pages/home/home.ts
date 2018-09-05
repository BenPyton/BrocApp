import { Component } from '@angular/core';
import { NavController, ModalController, ItemSliding } from 'ionic-angular';
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

	editAccount(event, account: ItemList, itemSliding: ItemSliding)
	{
		if(itemSliding != null) itemSliding.close();
		const modal = this.modalCtrl.create(EditAccountPage, {data: account});
	    // retrieve data from dismissed modal page
	    modal.onDidDismiss(data => {
	      console.log(data);

	      if(data != null)
	      {
	        if(account != null)
	        {
	          account.setName(data.name);
	          account.setDescription(data.description);
	          account.setDate(new Date(data.date));
	        }
	        else
	        {
			  this.accounts.push(new ItemList(data.name, data.description, new Date(data.date)));
	        }
	      }
	    });
	    // show modal page
	    modal.present();
	}

	deleteAccount(event, account: ItemList)
	{
		this.accounts.splice(this.accounts.indexOf(account), 1);
		console.log("Delete account: " + account.getName());
	}

	openAccount(event, account: ItemList)
	{
		this.navCtrl.push(ListPage, {data: account});
	}

}
