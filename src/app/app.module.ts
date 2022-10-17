import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LocalChannelsDataBrokerService } from 'src/local-channels-data-broker.service';
import { ChannelsDataBrokerServiceToken } from 'ionic-ng-channels-ui';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  { provide: ChannelsDataBrokerServiceToken, useClass: LocalChannelsDataBrokerService }],
  bootstrap: [AppComponent],
})
export class AppModule { }