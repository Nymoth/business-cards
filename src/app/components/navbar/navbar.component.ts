import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Profile, AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {

  @Input() profile: Profile;

  authStatuses = AuthService.STATUS;

  constructor(
    public auth: AuthService,
    private router: Router
  ) { }

  navigateToHome(): void {
    this.router.navigateByUrl('');
  }

  navigateToUserCards(): void {
    this.router.navigateByUrl('cards');
  }

}
