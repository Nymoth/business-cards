import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Card } from '../../models/Card';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { DialogConfirmComponent } from '../../components/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  templates: Promise<Card>[];

  constructor(
    private _auth: AuthService,
    private _storage: StorageService,
    private _snackBar: MatSnackBar,
    private _dialog: MatDialog
  ) { }

  async ngOnInit() {
    const keys = await this._getSystemTemplatesList();
    this.templates = keys.map(key => this._getCardFormKey(key))
  }

  async addToUserCards(card: Card): Promise<void> {
    const destLocation = this._getCardDestLocation(card);
    const objectExists = await this._storage.objectExists(destLocation);
    if (!objectExists || await this._checkForOverrideConfirmation(card)) {
      this._copyCardToUserFolder(card, destLocation);
    }
  }

  private _getSystemTemplatesList(): Promise<string[]> {
    return this._storage.listFolder('public/templates/');
  }

  private _getCardFormKey(key: string): Promise<Card> {
    return this._storage.getObject<Card>(key);
  }

  private _getCardDestLocation(card: Card): string {
    const userFolder = this._auth.getS3FolderKey();
    return `${userFolder}/${card.name}.json`;
  }

  private async _copyCardToUserFolder(card: Card, destLocation: string): Promise<void> {
    await this._storage.copyObject(card.storageKey, destLocation);
    this._snackBar.open('The card has been added to your collection', 'OK', {
      duration: 2e3
    });
  }

  private _checkForOverrideConfirmation(card: Card): Promise<boolean> {
    return this._dialog.open(DialogConfirmComponent, {
      data: ['You already have this card in your collection.', 'Do you want to override it?']
    })
      .afterClosed()
      .toPromise();
  }

}
