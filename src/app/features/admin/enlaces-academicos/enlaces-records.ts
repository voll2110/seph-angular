import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UsersService } from '../../../core/services/users/users-service';
import { CatalogService } from '../../../core/services/catalogs/catalog.service';
import { ImageUploadService } from '../../../core/services/images/image-upload.service';
import { EnlaceAcademicoResponse } from '../../../shared/models/users/responses/enlaceAcademicoResponse';
import { PerfilAcademicoResponse } from '../../../shared/models/catalogs/responses/perfilAcademicoResponse';

/* Concentrado de Enlaces Académicos (usuarios con rol Admin).
Mismo patrón que institutions-records: signals porque la app es
zoneless, con campos normales la vista no se actualiza al llegar
la respuesta. */
@Component({
  selector: 'app-enlaces-records',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './enlaces-records.html',
  styleUrl: './enlaces-records.scss'
})
export class EnlacesRecordsComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly catalogService = inject(CatalogService);
  private readonly imageUploadService = inject(ImageUploadService);

  registros = signal<EnlaceAcademicoResponse[]>([]);
  perfilesAcademicos = signal<PerfilAcademicoResponse[]>([]);

  isLoading = signal(false);

  notificationMessage = signal('');
  notificationType = signal<'success' | 'error'>('success');

  /* Enlace seleccionado para mostrar en la modal de Detalle.
  null cuando la modal está cerrada. */
  selectedRegistro = signal<EnlaceAcademicoResponse | null>(null);

  /* URLs locales (blob) del INE/foto del enlace seleccionado, para
  poder mostrarlas en un <img> ya que el endpoint exige el JWT y
  un <img src="..."> normal no manda ese header. */
  detalleIneUrl = signal<string | null>(null);
  detalleFotoUrl = signal<string | null>(null);
  detalleIneEsPdf = signal(false);

  ngOnInit(): void {
    this.loadRegistros();
    this.catalogService.getPerfilesAcademicos().subscribe({
      next: (response) => this.perfilesAcademicos.set(response.data ?? [])
    });
  }

  loadRegistros(): void {
    this.isLoading.set(true);

    this.usersService.getEnlaces().subscribe({
      next: (response) => {
        this.registros.set(response.data ?? []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando enlaces académicos:', error);

        this.showNotification(
          'No fue posible cargar el concentrado de enlaces académicos.',
          'error'
        );

        this.isLoading.set(false);
      }
    });
  }

  /* Traduce los ids de perfil académico del enlace seleccionado a
  su nombre, usando el catálogo ya cargado. */
  nombresPerfiles(registro: EnlaceAcademicoResponse): string {
    if (registro.idsPerfilAcademico.length === 0) {
      return '—';
    }

    const catalogo = this.perfilesAcademicos();
    return registro.idsPerfilAcademico
      .map(id => catalogo.find(p => p.id === id)?.strValor ?? '—')
      .join(', ');
  }

  openDetalle(registro: EnlaceAcademicoResponse): void {
    this.selectedRegistro.set(registro);
    this.cargarImagenesDetalle(registro);
  }

  closeDetalle(): void {
    this.selectedRegistro.set(null);
    this.limpiarUrlsDetalle();
  }

  private cargarImagenesDetalle(registro: EnlaceAcademicoResponse): void {
    this.limpiarUrlsDetalle();

    if (registro.strRutaIne) {
      this.detalleIneEsPdf.set(registro.strRutaIne.toLowerCase().endsWith('.pdf'));

      this.imageUploadService.getImageBlob(registro.strRutaIne).subscribe({
        next: (blob) => this.detalleIneUrl.set(URL.createObjectURL(blob)),
        error: (error) => console.error('Error cargando INE:', error)
      });
    }

    if (registro.strRutaFotografia) {
      this.imageUploadService.getImageBlob(registro.strRutaFotografia).subscribe({
        next: (blob) => this.detalleFotoUrl.set(URL.createObjectURL(blob)),
        error: (error) => console.error('Error cargando fotografía:', error)
      });
    }
  }

  /* Libera las URLs blob creadas para el detalle anterior, para no
  ir acumulando memoria cada vez que se abre/cierra la modal. */
  private limpiarUrlsDetalle(): void {
    const ine = this.detalleIneUrl();
    const foto = this.detalleFotoUrl();

    if (ine) URL.revokeObjectURL(ine);
    if (foto) URL.revokeObjectURL(foto);

    this.detalleIneUrl.set(null);
    this.detalleFotoUrl.set(null);
    this.detalleIneEsPdf.set(false);
  }

  /* Desactiva un Enlace Académico. Pide confirmación porque
  le retira el acceso a administrar su institución. */
  desactivar(registro: EnlaceAcademicoResponse): void {
    const confirmado = confirm(`¿Desactivar a "${registro.fullName}"? Ya no podrá administrar su institución.`);

    if (!confirmado) {
      return;
    }

    this.usersService.deactivateEnlace(registro.id).subscribe({
      next: (response) => {
        if (response.statusCode !== 200) {
          this.showNotification(response.message ?? 'No fue posible desactivar el enlace.', 'error');
          return;
        }

        this.showNotification('Enlace académico desactivado correctamente.', 'success');
        this.loadRegistros();
      },
      error: (error) => {
        console.error('Error al desactivar enlace académico:', error);
        this.showNotification(error?.error?.message ?? 'No fue posible desactivar el enlace.', 'error');
      }
    });
  }

  /* Reactiva un Enlace Académico previamente desactivado. */
  reactivar(registro: EnlaceAcademicoResponse): void {
    const confirmado = confirm(`¿Reactivar a "${registro.fullName}"?`);

    if (!confirmado) {
      return;
    }

    this.usersService.reactivateEnlace(registro.id).subscribe({
      next: (response) => {
        if (response.statusCode !== 200) {
          this.showNotification(response.message ?? 'No fue posible reactivar el enlace.', 'error');
          return;
        }

        this.showNotification('Enlace académico reactivado correctamente.', 'success');
        this.loadRegistros();
      },
      error: (error) => {
        console.error('Error al reactivar enlace académico:', error);
        this.showNotification(error?.error?.message ?? 'No fue posible reactivar el enlace.', 'error');
      }
    });
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage.set(message);
    this.notificationType.set(type);

    setTimeout(() => {
      this.notificationMessage.set('');
    }, 4000);
  }
}
