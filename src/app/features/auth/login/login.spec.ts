import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { AuthService } from '../../../core/services/auth/authService';
import { LoginComponent } from './login';

describe('Login validation', () => {
  let component: LoginComponent;
  let auth: { login: ReturnType<typeof vi.fn>; saveSession: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = { login: vi.fn(() => of({ data: null })), saveSession: vi.fn() };
    TestBed.configureTestingModule({ providers: [
      { provide: AuthService, useValue: auth },
      { provide: Router, useValue: { navigate: vi.fn() } }
    ] });
    component = TestBed.runInInjectionContext(() => new LoginComponent());
  });

  it.each([
    ['', 'secret', 'El correo electrónico es obligatorio.'],
    ['correo-invalido', 'secret', 'Ingresa un correo electrónico válido.'],
    ['usuario@example.com', '   ', 'La contraseña es obligatoria.']
  ])('does not send invalid credentials: %s', (email, password, message) => {
    component.form = { email, password };
    component.login();
    expect(auth.login).not.toHaveBeenCalled();
    expect(component.error()).toBe(message);
    expect(component.loading()).toBe(false);
  });

  it('trims the email without changing the password', () => {
    component.form = { email: ' usuario@example.com ', password: ' secret ' };
    component.login();
    expect(auth.login).toHaveBeenCalledWith({ email: 'usuario@example.com', password: ' secret ' });
  });

  it('does not submit twice while a request is pending', () => {
    auth.login.mockReturnValue(new Subject());
    component.form = { email: 'usuario@example.com', password: 'secret' };
    component.login();
    component.login();
    expect(auth.login).toHaveBeenCalledTimes(1);
  });
});
