import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Card } from '../../models/Card';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {

  @Input() card: Card

  constructor() { }

}
