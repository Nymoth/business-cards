import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from '../app.material.module';

import { MainComponent } from './main/main.component';
import { ComponentsModule } from '../components/components.module';
import { UserCardsComponent } from './user-cards/user-cards.component';

@NgModule({
  imports: [
    ComponentsModule,
    CommonModule,
    AppMaterialModule
  ],
  declarations: [
    MainComponent,
    UserCardsComponent
  ]
})
export class ScenesModule { }
