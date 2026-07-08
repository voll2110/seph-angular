import { Routes } from '@angular/router';

export const enlacesRoutes: Routes = [
  {
    /* Vista inicial del módulo: concentrado de enlaces académicos registrados. */
    path: '',
    loadComponent: () =>
      import('./enlaces-records').then(
        m => m.EnlacesRecordsComponent
      )
  },
  {
    /* Alta de un nuevo Enlace Académico. */
    path: 'nueva',
    loadComponent: () =>
      import('./enlace-create/enlace-create').then(
        m => m.EnlaceCreateComponent
      )
  },
  {
    /* Edición de un Enlace Académico existente. Mismo componente
    que el alta: el :id le indica que debe cargar y actualizar en
    vez de crear. */
    path: ':id/editar',
    loadComponent: () =>
      import('./enlace-create/enlace-create').then(
        m => m.EnlaceCreateComponent
      )
  }
];
