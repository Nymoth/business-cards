import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from '../app.material.module';


import { CardComponent } from './card/card.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CardWrapperComponent } from './card-wrapper/card-wrapper.component';
import { DialogConfirmComponent } from './dialog-confirm/dialog-confirm.component';

@NgModule({
  imports : [
    CommonModule,
    AppMaterialModule
  ],
  declarations: [
    CardComponent,
    NavbarComponent,
    CardWrapperComponent,
    DialogConfirmComponent
  ],
  entryComponents: [
    DialogConfirmComponent
  ],
  exports: [
    CardWrapperComponent,
    NavbarComponent
  ]
})
export class ComponentsModule { }
