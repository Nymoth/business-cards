import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService, Profile } from './services/auth.service';
import { StorageService } from './services/storage.service';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  profile: Profile;

  authStatuses = AuthService.STATUS;

  constructor(
    public auth: AuthService,
    private _storage: StorageService
  ) { }

  ngOnInit() {
    this.auth.getProfile()
      .filter((profile: any) => profile)
      .subscribe((profile: Profile) => {
        this.profile = profile;
        this._storage.init(profile.credentials);
      });
    this.auth.init();
  }

}
