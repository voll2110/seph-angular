import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';

import { CatalogService } from '../../../../core/services/catalogs/catalog.service';
import { InstitutionsService } from '../../../../core/services/institutions/institutions-service';
import { UsersService } from '../../../../core/services/users/users-service';
import { ImageUploadService } from '../../../../core/services/images/image-upload.service';
import { InstitutionsResponse } from '../../../../shared/models/institutions/institutionsResponse';
import { PerfilAcademicoResponse } from '../../../../shared/models/catalogs/responses/perfilAcademicoResponse';
import { NivelAcademicoResponse } from '../../../../shared/models/catalogs/responses/nivelAcademicoResponse';

@Component({
  selector: 'app-enlace-create',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './enlace-create.html',
  styleUrl: './enlace-create.scss'
})
export class EnlaceCreateComponent implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly institutionsService = inject(InstitutionsService);
  private readonly usersService = inject(UsersService);
  private readonly imageUploadService = inject(ImageUploadService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /* Id del enlace a editar. null cuando se está registrando uno nuevo. */
  enlaceId: string | null = null;

  instituciones = signal<InstitutionsResponse[]>([]);
  perfilesAcademicos = signal<PerfilAcademicoResponse[]>([]);
  nivelesAcademicos = signal<NivelAcademicoResponse[]>([]);

  isSaving = signal(false);
  isLoading = signal(false);
  notificationMessage = signal('');
  notificationType = signal<'success' | 'error'>('success');

  fullName = '';
  email = '';
  password = '';
  idInstitucion = 0;
  strRFC = '';
  idNivelAcademico: number | null = null;

  tienePerfilAcademico: 'SI' | 'NO' = 'NO';
  perfilAcademicoSeleccionado: number | null = null;
  perfilesAgregados: PerfilAcademicoResponse[] = [];

  tieneSNI: 'SI' | 'NO' = 'NO';
  strSNII = '';

  archivoIne: File | null = null;
  archivoFoto: File | null = null;

  /* Vista previa (blob local) del archivo recién seleccionado, antes
  de subirlo. No es la misma URL que la del archivo ya guardado. */
  previewIneUrl = signal<string | null>(null);
  previewFotoUrl = signal<string | null>(null);
  previewIneEsPdf = signal(false);

  /* Rutas ya guardadas en edición: si no se selecciona un archivo
  nuevo, se conservan estas en vez de mandar null y perder el
  INE/foto ya subidos. */
  private rutaIneExistente: string | null = null;
  private rutaFotografiaExistente: string | null = null;

  ngOnInit(): void {
    this.institutionsService.getInstitutions().subscribe({
      next: (response) => this.instituciones.set(response.data ?? [])
    });
    this.catalogService.getPerfilesAcademicos().subscribe({
      next: (response) => {
        this.perfilesAcademicos.set(response.data ?? []);
        this.aplicarPerfilesPendientes();
      }
    });
    this.catalogService.getNivelesAcademicos().subscribe({
      next: (response) => this.nivelesAcademicos.set(response.data ?? [])
    });

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.enlaceId = idParam;
      this.loadEnlace(idParam);
    }
  }

  /* Ids de perfil académico pendientes de resolver contra el catálogo,
  mientras este todavía no ha llegado del backend. */
  private idsPerfilPendientes: number[] = [];

  private aplicarPerfilesPendientes(): void {
    if (this.idsPerfilPendientes.length === 0) {
      return;
    }

    const catalogo = this.perfilesAcademicos();
    this.perfilesAgregados = this.idsPerfilPendientes
      .map(id => catalogo.find(p => p.id === id))
      .filter((perfil): perfil is PerfilAcademicoResponse => !!perfil);

    if (this.perfilesAgregados.length > 0) {
      this.tienePerfilAcademico = 'SI';
    }
  }

  /* Carga los datos ya guardados del enlace a editar. */
  loadEnlace(id: string): void {
    this.isLoading.set(true);

    this.usersService.getEnlaceById(id).subscribe({
      next: (response) => {
        const data = response.data;

        if (!data) {
          this.isLoading.set(false);
          return;
        }

        this.fullName = data.fullName;
        this.email = data.email;
        this.idInstitucion = data.idInstitucion;
        this.strRFC = data.strRFC ?? '';
        this.idNivelAcademico = data.idNivelAcademico;

        this.tieneSNI = data.strSNII ? 'SI' : 'NO';
        this.strSNII = data.strSNII ?? '';

        this.rutaIneExistente = data.strRutaIne;
        this.rutaFotografiaExistente = data.strRutaFotografia;
        this.cargarPreviewsExistentes();

        this.idsPerfilPendientes = data.idsPerfilAcademico;
        this.aplicarPerfilesPendientes();

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando enlace académico:', error);
        this.showNotification('No fue posible cargar la información del enlace académico.', 'error');
        this.isLoading.set(false);
      }
    });
  }

  /* Pide al servicio de imágenes el INE/foto ya guardados (si hay)
  para mostrarlos en la misma vista previa que se usa al seleccionar
  un archivo nuevo — así se ve qué ya tiene el enlace antes de
  decidir si se reemplaza. */
  private cargarPreviewsExistentes(): void {
    if (this.rutaIneExistente) {
      this.previewIneEsPdf.set(this.rutaIneExistente.toLowerCase().endsWith('.pdf'));

      this.imageUploadService.getImageBlob(this.rutaIneExistente).subscribe({
        next: (blob) => this.previewIneUrl.set(URL.createObjectURL(blob)),
        error: (error) => console.error('Error cargando INE existente:', error)
      });
    }

    if (this.rutaFotografiaExistente) {
      this.imageUploadService.getImageBlob(this.rutaFotografiaExistente).subscribe({
        next: (blob) => this.previewFotoUrl.set(URL.createObjectURL(blob)),
        error: (error) => console.error('Error cargando fotografía existente:', error)
      });
    }
  }

  agregarPerfilAcademico(): void {
    if (!this.perfilAcademicoSeleccionado) return;

    const yaAgregado = this.perfilesAgregados.some(p => p.id === this.perfilAcademicoSeleccionado);
    if (yaAgregado) {
      this.perfilAcademicoSeleccionado = null;
      return;
    }

    const perfil = this.perfilesAcademicos().find(p => p.id === this.perfilAcademicoSeleccionado);
    if (perfil) {
      this.perfilesAgregados = [...this.perfilesAgregados, perfil];
    }
    this.perfilAcademicoSeleccionado = null;
  }

  quitarPerfilAcademico(idPerfil: number): void {
    this.perfilesAgregados = this.perfilesAgregados.filter(p => p.id !== idPerfil);
  }

  onFileSelected(event: Event, tipo: 'ine' | 'foto'): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    if (tipo === 'ine') {
      this.archivoIne = archivo;
      this.previewIneEsPdf.set(archivo?.type === 'application/pdf');
      this.actualizarPreview(this.previewIneUrl, archivo);
    } else {
      this.archivoFoto = archivo;
      this.actualizarPreview(this.previewFotoUrl, archivo);
    }
  }

  /* Reemplaza la vista previa de un archivo, liberando la URL blob
  anterior para no ir acumulando memoria mientras se cambia de archivo. */
  private actualizarPreview(preview: ReturnType<typeof signal<string | null>>, archivo: File | null): void {
    const anterior = preview();
    if (anterior) {
      URL.revokeObjectURL(anterior);
    }

    preview.set(archivo ? URL.createObjectURL(archivo) : null);
  }

  registrar(): void {
    if (!this.validateForm()) return;

    this.isSaving.set(true);
    this.subirYRegistrar();
  }

  private subirYRegistrar(): void {
    const subidas: Promise<string | null>[] = [
      this.archivoIne
        ? this.imageUploadService.uploadImage('ine', this.archivoIne).toPromise().then(r => r?.rutaRelativa ?? null)
        : Promise.resolve(this.rutaIneExistente),
      this.archivoFoto
        ? this.imageUploadService.uploadImage('foto', this.archivoFoto).toPromise().then(r => r?.rutaRelativa ?? null)
        : Promise.resolve(this.rutaFotografiaExistente)
    ];

    Promise.all(subidas).then(([rutaIne, rutaFoto]) => {
      const idsPerfilAcademico = this.perfilesAgregados.map(p => p.id);
      const strSNII = this.tieneSNI === 'SI' ? this.strSNII : null;

      if (this.enlaceId) {
        this.usersService.updateEnlace(this.enlaceId, {
          fullName: this.fullName,
          idInstitucion: this.idInstitucion,
          strRutaIne: rutaIne,
          strRutaFotografia: rutaFoto,
          strRFC: this.strRFC || null,
          strSNII,
          idNivelAcademico: this.idNivelAcademico,
          idsPerfilAcademico
        }).subscribe({
          next: () => {
            this.borrarArchivosReemplazados(rutaIne, rutaFoto);
            this.showNotification('Enlace académico actualizado correctamente.', 'success');
            this.isSaving.set(false);
            setTimeout(() => this.router.navigateByUrl('/admin/enlaces'), 1200);
          },
          error: (error) => {
            this.showNotification(error?.error?.message ?? 'No fue posible actualizar el enlace.', 'error');
            this.isSaving.set(false);
          }
        });
        return;
      }

      this.usersService.createAdmin({
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        idInstitucion: this.idInstitucion,
        strRutaIne: rutaIne,
        strRutaFotografia: rutaFoto,
        strRFC: this.strRFC || null,
        strSNII,
        idNivelAcademico: this.idNivelAcademico,
        idsPerfilAcademico
      }).subscribe({
        next: () => {
          this.showNotification('Enlace académico registrado correctamente.', 'success');
          this.isSaving.set(false);
          setTimeout(() => this.router.navigateByUrl('/admin/enlaces'), 1200);
        },
        error: (error) => {
          this.showNotification(error?.error?.message ?? 'No fue posible registrar el enlace.', 'error');
          this.isSaving.set(false);
        }
      });
    });
  }

  /* Si al editar se subió un archivo nuevo (INE y/o foto), borra el
  anterior del servidor para no dejarlo huérfano ocupando espacio. */
  private borrarArchivosReemplazados(rutaIneNueva: string | null, rutaFotoNueva: string | null): void {
    if (this.archivoIne && this.rutaIneExistente && this.rutaIneExistente !== rutaIneNueva) {
      this.imageUploadService.deleteImage(this.rutaIneExistente).subscribe({
        error: (error) => console.error('No se pudo borrar el INE anterior:', error)
      });
    }

    if (this.archivoFoto && this.rutaFotografiaExistente && this.rutaFotografiaExistente !== rutaFotoNueva) {
      this.imageUploadService.deleteImage(this.rutaFotografiaExistente).subscribe({
        error: (error) => console.error('No se pudo borrar la fotografía anterior:', error)
      });
    }
  }

  private validateForm(): boolean {
    if (!this.fullName.trim()) {
      this.showNotification('El nombre es obligatorio.', 'error');
      return false;
    }
    if (!this.enlaceId && (!this.email.trim() || !this.password.trim())) {
      this.showNotification('Correo y contraseña son obligatorios.', 'error');
      return false;
    }
    if (!this.idInstitucion) {
      this.showNotification('Debe seleccionar la institución.', 'error');
      return false;
    }
    return true;
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage.set(message);
    this.notificationType.set(type);
    setTimeout(() => this.notificationMessage.set(''), 4000);
  }
}
