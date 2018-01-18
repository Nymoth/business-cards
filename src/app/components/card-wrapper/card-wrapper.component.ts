import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Card } from '../../models/Card';

@Component({
  selector: 'app-card-wrapper',
  templateUrl: './card-wrapper.component.html',
  styleUrls: ['./card-wrapper.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardWrapperComponent {

  @Input() card: Card;

  @Output() onClick = new EventEmitter<Card>();

  constructor() { }

  emitClick(): void {
    this.onClick.emit(this.card);
  }

}
