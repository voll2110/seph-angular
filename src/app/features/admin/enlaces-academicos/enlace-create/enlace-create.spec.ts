import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { CatalogService } from '../../../../core/services/catalogs/catalog.service';
import { InstitutionsService } from '../../../../core/services/institutions/institutions-service';
import { UsersService } from '../../../../core/services/users/users-service';
import { ImageUploadService } from '../../../../core/services/images/image-upload.service';
import { EnlaceCreateComponent } from './enlace-create';

describe('Enlace registration validation and upload failures', () => {
  let component: EnlaceCreateComponent;
  let images: { uploadImage: ReturnType<typeof vi.fn> };
  let users: { createAdmin: ReturnType<typeof vi.fn>; updateEnlace: ReturnType<typeof vi.fn> };
  let catalogs: { getPerfilesAcademicos: ReturnType<typeof vi.fn>; getNivelesAcademicos: ReturnType<typeof vi.fn> };
  let institutions: { getInstitutions: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.useFakeTimers();
    images = { uploadImage: vi.fn() };
    users = { createAdmin: vi.fn(), updateEnlace: vi.fn() };
    catalogs = {
      getPerfilesAcademicos: vi.fn(() => of({ data: [] })),
      getNivelesAcademicos: vi.fn(() => of({ data: [] }))
    };
    institutions = { getInstitutions: vi.fn(() => of({ data: [] })) };
    TestBed.configureTestingModule({ providers: [
      { provide: CatalogService, useValue: catalogs },
      { provide: InstitutionsService, useValue: institutions },
      { provide: UsersService, useValue: users },
      { provide: ImageUploadService, useValue: images },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
      { provide: Router, useValue: {} }
    ] });
    component = TestBed.runInInjectionContext(() => new EnlaceCreateComponent());
    component.fullName = 'Usuario de prueba';
    component.email = 'usuario@example.com';
    component.password = 'TestPassword1!';
    component.idInstitucion = 1;
    component.archivoIne = new File(['test'], 'ine.pdf', { type: 'application/pdf' });
  });

  afterEach(() => vi.useRealTimers());

  it.each(['sin-arroba', 'usuario@', 'usuario@example.com '])('rejects invalid email %s before uploading', email => {
    component.email = email;
    component.registrar();
    expect(component.notificationMessage()).toBe('Ingresa un correo electrónico válido, sin espacios.');
    expect(images.uploadImage).not.toHaveBeenCalled();
    expect(users.createAdmin).not.toHaveBeenCalled();
  });

  it.each([null, 'existing-enlace'])('rejects names over 256 characters in create/edit: %s', id => {
    component.enlaceId = id;
    component.fullName = 'a'.repeat(257);
    component.registrar();
    expect(component.notificationMessage()).toBe('El nombre no debe superar 256 caracteres.');
    expect(images.uploadImage).not.toHaveBeenCalled();
    expect(users.createAdmin).not.toHaveBeenCalled();
    expect(users.updateEnlace).not.toHaveBeenCalled();
  });

  it('allows a name of exactly 256 characters', async () => {
    component.fullName = 'a'.repeat(256);
    component.archivoIne = null;
    users.createAdmin.mockReturnValue(new Subject());
    component.registrar();
    await vi.advanceTimersByTimeAsync(0);
    expect(users.createAdmin).toHaveBeenCalledWith(expect.objectContaining({ fullName: component.fullName }));
  });

  it.each(['institutions', 'profiles', 'levels'])('reports a failed %s catalog request', catalog => {
    const failure = throwError(() => new HttpErrorResponse({ status: 503 }));
    const messages: Record<string, string> = {
      institutions: 'No fue posible cargar las instituciones. Intenta nuevamente.',
      profiles: 'No fue posible cargar los perfiles académicos. Intenta nuevamente.',
      levels: 'No fue posible cargar los niveles académicos. Intenta nuevamente.'
    };
    if (catalog === 'institutions') institutions.getInstitutions.mockReturnValue(failure);
    if (catalog === 'profiles') catalogs.getPerfilesAcademicos.mockReturnValue(failure);
    if (catalog === 'levels') catalogs.getNivelesAcademicos.mockReturnValue(failure);
    component.ngOnInit();
    expect(component.notificationMessage()).toBe(messages[catalog]);
    expect(component.notificationType()).toBe('error');
    expect(component.isSaving()).toBe(false);
  });

  it.each([
    ['Abcdefgh1!x', 'La contraseña debe tener al menos 12 caracteres.'],
    ['abcdefghij1!', 'La contraseña debe contener al menos una mayúscula.'],
    ['ABCDEFGHIJ1!', 'La contraseña debe contener al menos una minúscula.'],
    ['Abcdefghijk!', 'La contraseña debe contener al menos un número.'],
    ['Abcdefghijk1', 'La contraseña debe contener al menos un carácter especial.']
  ])('rejects an invalid password before uploading: %s', (password, message) => {
    component.password = password;
    component.registrar();
    expect(component.notificationMessage()).toBe(message);
    expect(component.isSaving()).toBe(false);
    expect(images.uploadImage).not.toHaveBeenCalled();
    expect(users.createAdmin).not.toHaveBeenCalled();
  });

  it.each(['Abcdefghij1!', 'Abcdefghijkl1!'])('accepts a compliant password without changing it: %s', async password => {
    component.password = password;
    component.archivoIne = null;
    users.createAdmin.mockReturnValue(new Subject());
    component.registrar();
    await vi.advanceTimersByTimeAsync(0);
    expect(users.createAdmin).toHaveBeenCalledWith(expect.objectContaining({ password }));
  });

  it('does not require a new password when editing an enlace', async () => {
    component.enlaceId = 'existing-enlace';
    component.password = '';
    component.email = '';
    component.archivoIne = null;
    users.updateEnlace.mockReturnValue(new Subject());
    component.registrar();
    await vi.advanceTimersByTimeAsync(0);
    expect(users.updateEnlace).toHaveBeenCalledWith('existing-enlace', expect.not.objectContaining({ password: expect.anything() }));
    expect(users.createAdmin).not.toHaveBeenCalled();
  });

  it.each([null, 'El archivo supera el tamaño permitido.'])('unblocks saving and reports upload errors: %s', async message => {
    images.uploadImage.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 413, error: message ? { message } : null
    })));
    component.registrar();
    await vi.advanceTimersByTimeAsync(0);
    expect(component.isSaving()).toBe(false);
    expect(component.notificationType()).toBe('error');
    expect(component.notificationMessage()).toBe(message ?? 'No fue posible subir los archivos. Intenta nuevamente.');
    expect(users.createAdmin).not.toHaveBeenCalled();
    expect(users.updateEnlace).not.toHaveBeenCalled();
  });

  it('does not start duplicate uploads while saving', () => {
    images.uploadImage.mockReturnValue(new Subject());
    component.registrar();
    component.registrar();
    expect(images.uploadImage).toHaveBeenCalledTimes(1);
  });
});
