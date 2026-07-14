import { Routes } from '@angular/router';

/* Ruta genérica: /admin/bitacoras/:modulo. El componente lee el
módulo de la URL, así que agregar la bitácora de un módulo nuevo
solo requiere un link a esta misma ruta con otro valor de :modulo
(ej. /admin/bitacoras/EnlaceAcademico) — no hace falta código nuevo. */
export const bitacorasRoutes: Routes = [
  {
    path: ':modulo',
    loadComponent: () =>
      import('./bitacora-view/bitacora-view').then(m => m.BitacoraViewComponent)
  }
];
