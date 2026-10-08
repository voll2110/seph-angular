import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/authService';
import { LoginRequest } from '../../../shared/models/auth/requests/loginRequest';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  form: LoginRequest = { email: '', password: '' };
  loading = signal(false);
  error = signal<string | null>(null);

  login() {
    if (this.loading()) return;

    this.error.set(null);

    const email = this.form.email.trim();

    if (!email) {
      this.error.set('El correo electrónico es obligatorio.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.error.set('Ingresa un correo electrónico válido.');
      return;
    }

    if (!this.form.password.trim()) {
      this.error.set('La contraseña es obligatoria.');
      return;
    }

    this.loading.set(true);

    this.authService.login({ ...this.form, email }).subscribe({
      next: (response) => {
        if (response.data) {
          this.authService.saveSession(response.data);
          this.router.navigate(['/home']);
        } else {
          this.error.set(response.message ?? 'Error al iniciar sesión');
        }
        this.loading.set(false);
      },
     error: (err) => {
        this.error.set(err.error?.message ?? 'Error de conexión con el servidor');
        this.loading.set(false);
}
    });
  }
  mostrarPassword = false;

togglePassword(): void {
  this.mostrarPassword = !this.mostrarPassword;
}
}
