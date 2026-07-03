import { Routes } from '@angular/router';

export const staffRegistrationRoutes: Routes = [
  {
    /* Vista inicial del módulo: concentrado de registros capturados. */
    path: '',
    loadComponent: () =>
      import('./records-summary/records-summary').then(
        m => m.RecordsSummaryComponent
      )
  },
  {
    /* Flujo de captura: Información personal + Historial de contrato. */
    path: 'nuevo',
    loadComponent: () =>
      import('./staff-registration').then(
        m => m.StaffRegistrationComponent
      )
  }
];
