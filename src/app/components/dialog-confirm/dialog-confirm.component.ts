import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Card } from '../../models/Card';

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogConfirmComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public text: string) { }

}
