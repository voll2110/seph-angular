import { Routes } from '@angular/router';

export const institutionalInformationRoutes: Routes = [
  {
    /* Vista inicial del módulo: concentrado de registros institucionales. */
    path: '',
    loadComponent: () =>
      import('./records-summary/records-summary').then(
        m => m.RecordsSummaryComponent
      )
  },
  {
    /* Flujo de captura: información institucional y reportes estadísticos. */
    path: 'nuevo',
    loadComponent: () =>
      import('./institutional-information').then(
        m => m.InstitutionalInformationComponent
      )
  }
];