import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActionSheetController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CRUD } from 'app-base-lib';
import { ListDataBrokerLoadOneOptions } from 'app-base-lib';
import { ListDataBrokerResult } from 'app-base-lib';
import { ListDataBrokerLoadOptions } from 'app-base-lib';
import { PAGE_SECTION_POSITION } from 'vicky-ionic-ng-lib';
import {ChannelsDataBrokerConfig, ChannelsDataBrokerEvent, IChannelItem, IChannelSection, ImplChannelsDataBroker} from 'ionic-ng-channels-ui';

import { faker } from '@faker-js/faker';
import { timer } from 'rxjs';
import { first } from 'rxjs/operators';

/**
 * Number of pages
 */
const PER_PAGE = 8;

@Injectable({
  providedIn: 'root'
})
export class LocalChannelsDataBrokerService extends ImplChannelsDataBroker {

  constructor(actionSheetController: ActionSheetController, alertCtrl: AlertController, toastCtrl: ToastController, loadingCtrl: LoadingController) {
    super(actionSheetController as any, alertCtrl as any, toastCtrl as any,
      loadingCtrl as any, { perPage: PER_PAGE, append: false });
    if (!localStorage.getItem('--channelSections-array')) {
      this.populateFakeData().then();
    }
  }


  async populateFakeData() {
    const fakeData: IChannelSection[] = [];
    /**
     * loop through fakeData and implement to channelItems
    */
    for (let i = 0; i < 10; i++) {

      const sectionId = i;

      const channelItems: IChannelItem[] = [];
      for (let j = 0; j < 5; j++) {
        channelItems.push({
          id: Date.now(),
          title: faker.name.firstName(),
          description: faker.lorem.sentence(),
          sectionId,
          createdAt: new Date()
        });
      }

      const channelSection: IChannelSection = {
        id: sectionId,
        title: faker.name.firstName(),
        items: channelItems,
        createdAt: new Date()
      };
      fakeData.push(channelSection);
    }

     await this.saveStore(fakeData);
   }
 
   getConfig(): ChannelsDataBrokerConfig {
     return {
       pagination:{
         perPage: 10,
       },
       ui:{
         general: {
           custom:{
             channelsUI:{
               sections:{
                items:{
                  indicator:{
                    type:'ion-icon',
                    default:{
                      name:'add-circle-outline'
                    }
                  }
                }
               }
             }
           },
           pagination:{
             enabled:true,
           },
           swipeRefresh:{
             enabled:true,
           },
           spinner: {
             type: 'bubbles'
           },
           toast: {
             duration: 5000,
             position: 'top',
             btnText: 'Okay'
           },
           buttons: {
             core: {
               sectionPosition: PAGE_SECTION_POSITION.IN_CONTENT
             }
           },
           broswer: {
             target: 'system'
           }
         },
         pages:{
           channels: {
             title:{
              label:'Your Channels'
             },
             behavior: {
              progressMsg: 'Loading channels...',
            },
           },
           channelEditor: {
             inputs: {
               title:{
                 placeholder: 'Enter Title',
               }
             }
           }
         }
        }
     } as ChannelsDataBrokerConfig;
   }
 
   async onCRUD(crudType: CRUD, channelSection: IChannelSection): Promise<IChannelSection>{
 
     let channelSections = await this.getStore();
 
     switch(crudType){
       case CRUD.CREATE:
         channelSections.push(channelSection);

         channelSection.id = Date.now();
         break;
       case CRUD.DELETE:
         channelSections = channelSections.filter( _channelSection => _channelSection.id !== channelSection.id);
         break;
       case CRUD.UPDATE:
         channelSections = channelSections.map( _channelSection => _channelSection.id === channelSection.id ? channelSection:_channelSection);
         break;
     }
 
     await this.saveStore(channelSections);
 
     return channelSection;
   }
 
  /**
   * 
   * @param crudType 
   * @param channelItem 
   * @returns 
   */
  async canCRUDItem(crudType: CRUD, channelItem?: IChannelItem): Promise<boolean> {
    return true;
  }

  /**
   * @param crudType 
   * @param item 
   * @returns 
   */
  async onCRUDItem(crudType: CRUD, item?: IChannelItem): Promise<IChannelItem> {

    let channelSections = await this.getStore();

    let targetChannelSection = channelSections.find(channelSection => channelSection.id === item.sectionId);

    if (!targetChannelSection) {
      throw new Error('channelSection not found');
    }
    switch (crudType) {
      case CRUD.CREATE:
        item.id = Date.now();
        targetChannelSection.items.push(item);
        break;
      case CRUD.DELETE:
        targetChannelSection.items = targetChannelSection.items.filter(_channelItem => _channelItem.id !== item.id);
        break;
      case CRUD.UPDATE:
        targetChannelSection.items = targetChannelSection.items.map(_channelItem => _channelItem.id === item.id ? item : _channelItem);
        break;
    }

    channelSections = channelSections.map(_channelSection => _channelSection.id === targetChannelSection.id ? targetChannelSection : _channelSection);

    await this.saveStore(channelSections);

    return item;
  }

  /**
   * @param channelItem 
   */
  async onExplore(channelItem: IChannelItem): Promise<any> {
    alert('Channel explored : ' + channelItem.title);
  }

  /**
   * @param _ev 
   */
  async on(_ev: ChannelsDataBrokerEvent): Promise<any> {
  }

  /**
   * @param _crudType 
   * @returns 
   */
  async canCRUD(_crudType: CRUD): Promise<boolean> {
    return true;
  }

  /**
   * @param options the options that can be used to fetch the data
   * @returns an object that contains the data
   */
  async fetchOne(options: ListDataBrokerLoadOneOptions): Promise<ListDataBrokerResult<IChannelSection>> {

    const channelSections = await this.getStore();

    return {
      data: channelSections.find(channelSection => channelSection.id === options.id)
    };
  }

  /**
   * @param options the options that can be used to fetch the data
   * @returns an object that contains the array of data
   */
  async fetch(options: ListDataBrokerLoadOptions<IChannelSection>
  ): Promise<ListDataBrokerResult<IChannelSection[]>> {

    console.log('localChannelsDataBroker.fetch() : ', options);

    let channelSections = await this.getStore();

    // apply pagination
    channelSections = channelSections.slice((options.page - 1) * options.perPage, options.page * options.perPage);

    const result = {
      data: channelSections
    };

    console.log('localChannelsDataBroker.fetch() result : ', result);

    return result;
  }

  /**
   * @returns 
   */
  private async getStore(): Promise<IChannelSection[]> {

    // simulate delay
    await timer(3000).pipe(first()).toPromise();

    const storeValue = localStorage.getItem('--channelSections-array');

    const result = (storeValue ? JSON.parse(storeValue) as Array<IChannelSection> : []).reverse();
    console.log('localChannelsDataBroker.getStore()', result);
    return result;

  }
  /**
   * @param channelSections 
   */
  private async saveStore(channelSections: IChannelSection[]): Promise<any> {

    // simulate delay
    await timer(2500).pipe(first()).toPromise();

    localStorage.setItem('--channelSections-array', JSON.stringify(channelSections));
  }

}
