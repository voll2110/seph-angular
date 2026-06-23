import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/auth/authService';
import { CatalogService } from '../../../core/services/catalogs/catalog.service';
import { StaffRegistrationService } from '../staff-registration.service';

import { CreateEmployeeRequest } from '../../../shared/models/staff-registration/requests/createEmployeeRequest';
import { SexResponse } from '../../../shared/models/catalogs/responses/sexResponse';

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './personal-information.html',
  styleUrl: './personal-information.scss'
})
export class PersonalInformationComponent implements OnInit {

  private staffRegistrationService = inject(StaffRegistrationService);
  private authService = inject(AuthService);
  private catalogService = inject(CatalogService);

  sexes: SexResponse[] = [];

  employee: CreateEmployeeRequest = {
    strNombre: '',
    strApellidoPat: '',
    strApellidoMat: '',
    strCurp: '',
    idSexo: 0,
    dateTimeFechaRegistro: new Date().toISOString(),
    idUsuarioRegistro: '',
    bitActivo: true,
    dateTimeFechaBaja: new Date().toISOString()
  };

  ngOnInit(): void {
    this.loadSexes();
  }

 loadSexes(): void {
  this.catalogService
    .getSexes()
    .subscribe({
      next: (response) => {

        this.sexes = response.data ?? [];

      },
      error: (error) => {
        console.error('Error cargando sexos:', error);
      }
    });
}

  saveEmployee(onSuccess: () => void): void {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      alert('No se encontró información del usuario autenticado.');
      return;
    }

    this.employee.idUsuarioRegistro = currentUser.id;

    this.staffRegistrationService
      .createEmployee(this.employee)
      .subscribe({
        next: (response) => {
          console.log('Empleado guardado:', response);
          onSuccess();
        },
        error: (error) => {
          console.error('Error al guardar:', error);
          alert('No fue posible guardar la información personal.');
        }
      });
  }

}