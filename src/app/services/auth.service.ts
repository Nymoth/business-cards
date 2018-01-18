import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { AuthService as SocialAuth } from 'angular2-social-login';
import { CognitoIdentity, Credentials } from 'aws-sdk';
import { WINDOW } from 'ngx-window-token';
import * as jwtDecode from 'jwt-decode';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';


export class GoogleData {
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  image: string;
  locale: string;
}

export class Profile {
  status: string;
  identity?: string;
  credentials?: Credentials;
  googleData?: GoogleData;
}


@Injectable()
export class AuthService {

  private static readonly LOCALSTORAGE = {
    IDENTITY: 'IDENTITY',
    ACCESS_TOKEN: 'ACCESS_TOKEN',
    ID_TOKEN: 'ID_TOKEN'
  };

  public static readonly STATUS = {
    UNLOGGED: 'UNLOGGED',
    GUEST: 'GUEST',
    AUTHENTICATED: 'AUTHENTICATED'
  };

  private _profile: Profile = null;
  private _profileSubject = new Subject<Profile>();
  private _cognitoIdentity = new CognitoIdentity({
    apiVersion: '2014-06-30',
    region: environment.aws.cognito.region
  });

  constructor(
    @Inject(WINDOW) private _window: Window,
    private _socialAuth: SocialAuth,
    private _http: Http
  ) { }

  /*
   -- FLOW --

  From scratch:
   1. User enters the app, get a guest identity using getId()
   2. The guest user gets credentials, using getCredentialsForIdentity()
   3. Save that identity in localstorage

   3. User logs in with Google, gets tokenId + google info (email, username)
   4. Retrieve identity + credentials for that login
   4bis. Set google info as data for that identity (cognito sync) ???
   5. Update localstorage identity + tokenid
   6. Delete guest identity

   7. User logs out, goto flow 1. (fetch new guest identity)

  Has saved identity in localstorage (guest)
   1. User enters the app, gets identity from localstorage
   2. Gets credentials

  Has saved identity in localstorage (logged)
   1. User enters app, gets identity from localstorage
   2. Gets google token as well + validate it from google
   3. If token is valid, get credentials
   3bis. If token is invalid, clear localstorage and get guest identity (1.)

  */

  async init(): Promise<void> {
    const { identity, accessToken, idToken } = this._getStoredItems();

    this._profile = {
      status: AuthService.STATUS.UNLOGGED
    };

    if (identity) {
      this._profile.identity = identity;
      if (accessToken && idToken) {
        const tokenIsValid = await this._validateGoogleToken(accessToken);
        if (tokenIsValid) {
          const logins = this._getGoogleCognitoLogins(idToken);
          const credentials = await this._getCredentials(identity, logins);
          const googleData = this._getGoogleData(idToken);
          this._profile.credentials = credentials;
          this._profile.googleData = googleData;
          this._profile.status = AuthService.STATUS.AUTHENTICATED;
        } else {
          this._removeItem(AuthService.LOCALSTORAGE.ACCESS_TOKEN);
          this._removeItem(AuthService.LOCALSTORAGE.ID_TOKEN);
          // if (!await this.login()) {
            const newIdentity = await this._getIdentity();
            const credentials = await this._getCredentials(newIdentity);

            this._profile.identity = newIdentity;
            this._profile.credentials = credentials;
            this._profile.status = AuthService.STATUS.GUEST;
            this._storeItem(AuthService.LOCALSTORAGE.IDENTITY, newIdentity);
          // }
        }
      } else {
        const credentials = await this._getCredentials(identity);
        this._profile.credentials = credentials;
        this._profile.status = AuthService.STATUS.GUEST;
      }
    } else {
      const newIdentity = await this._getIdentity();
      const credentials = await this._getCredentials(newIdentity);

      this._profile.identity = newIdentity;
      this._profile.credentials = credentials;
      this._profile.status = AuthService.STATUS.GUEST;
      this._storeItem(AuthService.LOCALSTORAGE.IDENTITY, newIdentity);
    }

    this._profileSubject.next(this._profile);
  }

  getProfile(): Observable<Profile> {
    return this._profileSubject
      .asObservable()
      .startWith(this._profile);
  }

  getS3FolderKey(): string {
    if (!this._profile) {
      return null;
    }
    return `user/${this._profile.identity}`;
  }

  async login(): Promise<boolean> {
    const tokens = await this._loginWithGoogle();
    if (tokens) {
      const { accessToken, idToken } = tokens;
      const googleData = this._getGoogleData(idToken);
      const logins = this._getGoogleCognitoLogins(idToken);
      const identity = await this._getIdentity(logins);
      const credentials = await this._getCredentials(identity, logins);
      this._profile = {
        status: AuthService.STATUS.AUTHENTICATED,
        identity,
        credentials,
        googleData
      };
      this._storeItem(AuthService.LOCALSTORAGE.IDENTITY, identity);
      this._storeItem(AuthService.LOCALSTORAGE.ACCESS_TOKEN, accessToken);
      this._storeItem(AuthService.LOCALSTORAGE.ID_TOKEN, idToken);
      this._profileSubject.next(this._profile);
      return true;
    }
    return false;
  }

  async logout(): Promise<void> {
    const identity = await this._getIdentity();
    const credentials = await this._getCredentials(identity);

    this._storeItem(AuthService.LOCALSTORAGE.IDENTITY, identity);
    this._removeItem(AuthService.LOCALSTORAGE.ID_TOKEN);
    this._removeItem(AuthService.LOCALSTORAGE.ACCESS_TOKEN);

    this._profile = {
      status: AuthService.STATUS.GUEST,
      identity,
      credentials
    };
    this._profileSubject.next(this._profile);
  }

  private _loginWithGoogle(): Promise<{ accessToken: string, idToken: string }> {
    return this._socialAuth.login('google')
      .toPromise()
      .then(res => ({ accessToken: res['token'], idToken: res['idToken'] }))
      .catch(err => {
        console.log('Auth: Error trying to login with Google', err);
        return null;
      });
  }

  private _validateGoogleToken(token: string): Promise<boolean> {
    return this._http.post(environment.google.tokenValidateUrl + decodeURIComponent(token), {}).toPromise()
       .then(res => res.json())
       .then(res => {
         if (res.error && res.error === 'invalid_token') {
           console.log('Auth: Google access token expired or no longer valid');
           return false;
         }
         return true;
       })
       .catch(err => {
         console.log('Auth: Error validating Google access token', err);
         return false;
       });
  }

  private _getIdentity(logins?: CognitoIdentity.LoginsMap): Promise<string> {
    const params: CognitoIdentity.GetIdInput = {
      IdentityPoolId: environment.aws.cognito.identityPoolId
    };
    if (logins) {
      params.Logins = logins;
    }
    return this._cognitoIdentity.getId(params).promise()
      .then(res => res.IdentityId);
  }

  private _getCredentials(identity: string, logins?: CognitoIdentity.LoginsMap): Promise<Credentials> {
    const params: CognitoIdentity.GetCredentialsForIdentityInput = {
      IdentityId: identity
    };
    if (logins) {
      params.Logins = logins;
    }
    return this._cognitoIdentity.getCredentialsForIdentity(params).promise()
      .then((data: CognitoIdentity.GetCredentialsForIdentityResponse) => data.Credentials)
      .then((creds: CognitoIdentity.Credentials) => new Credentials(creds.AccessKeyId, creds.SecretKey, creds.SessionToken));
  }

  private _getGoogleCognitoLogins(token: string): CognitoIdentity.LoginsMap {
    return {
      'accounts.google.com': token
    };
  }

  private _getGoogleData(token: string): GoogleData {
    return jwtDecode(token);
  }

  private _getStoredItems(): { identity: string, accessToken: string, idToken: string } {
    const identity = this._window.localStorage.getItem(AuthService.LOCALSTORAGE.IDENTITY);
    const accessToken = this._window.localStorage.getItem(AuthService.LOCALSTORAGE.ACCESS_TOKEN);
    const idToken = this._window.localStorage.getItem(AuthService.LOCALSTORAGE.ID_TOKEN);
    return { identity, accessToken, idToken };
  }

  private _storeItem(key: string, item: string): void {
    this._window.localStorage.setItem(key, item);
  }

  private _removeItem(key: string): void {
    this._window.localStorage.removeItem(key);
  }

}
