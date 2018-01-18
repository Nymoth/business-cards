import { MainComponent } from './scenes/main/main.component';
import { UserCardsComponent } from './scenes/user-cards/user-cards.component';

export const routes = [
  {
    path: '',
    component: MainComponent
  },
  {
    path: 'cards',
    component: UserCardsComponent
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full'
  }
];
