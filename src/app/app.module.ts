import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Angular2SocialLoginModule } from 'angular2-social-login';
import { WindowTokenModule } from 'ngx-window-token';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app.routing.module';
import { ScenesModule } from './scenes/scenes.module';
import { ComponentsModule } from './components/components.module';
import { AppMaterialModule } from './app.material.module';

import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';

import { AppComponent } from './app.component';


const providers = {
  google: {
    clientId: environment.google.clientId
  }
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    AppMaterialModule,
    Angular2SocialLoginModule,
    WindowTokenModule,
    AppRoutingModule,
    ScenesModule,
    ComponentsModule
  ],
  providers: [
    AuthService,
    StorageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

Angular2SocialLoginModule.loadProvidersScripts(providers);
