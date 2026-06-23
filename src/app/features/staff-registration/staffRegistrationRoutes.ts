import { Routes } from '@angular/router';

export const staffRegistrationRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./staff-registration').then(
        m => m.StaffRegistrationComponent
      )
  }
];