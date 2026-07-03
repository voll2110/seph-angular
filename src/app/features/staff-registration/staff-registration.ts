import { Component, OnInit, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PersonalInformationComponent } from './personal-information/personal-information';
import { ContractHistoryComponent } from './contract-history/contract-history';

@Component({
  selector: 'app-staff-registration',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PersonalInformationComponent,
    ContractHistoryComponent
  ],
  templateUrl: './staff-registration.html',
  styleUrl: './staff-registration.scss'
})
export class StaffRegistrationComponent implements OnInit {

  @ViewChild(PersonalInformationComponent)
  personalInformationComponent?: PersonalInformationComponent;

  @ViewChild(ContractHistoryComponent)
  contractHistoryComponent?: ContractHistoryComponent;

  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  menuCollapsed = false;
  currentStep = 1;
  personalInformationCompleted = false;
  employeeId: number | null = null;
  isSaving = false;

  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  /* Permite retomar un registro incompleto desde el concentrado:
  al llegar con ?empleado=ID se salta directo al paso 2
  (Historial de Contrato) usando el empleado ya guardado. */
  ngOnInit(): void {
    const empleadoParam = this.route.snapshot.queryParamMap.get('empleado');

    if (empleadoParam) {
      this.employeeId = Number(empleadoParam);
      this.personalInformationCompleted = true;
      this.currentStep = 2;
    }
  }

  toggleMenu(): void {
    this.menuCollapsed = !this.menuCollapsed;
  }

  nextStep(): void {
    if (this.isSaving) return;

    if (this.currentStep === 1) {
      if (!this.personalInformationComponent) return;

      this.isSaving = true;

      this.personalInformationComponent.saveEmployee(
        (employeeId) => {
  this.isSaving = false;
  this.employeeId = employeeId;
  this.personalInformationCompleted = true;

  this.showNotification(
    'Información personal guardada correctamente. Continuando al historial de contrato.',
    'success'
  );

  this.cdr.detectChanges();

  setTimeout(() => {
    this.currentStep = 2;
    this.cdr.detectChanges();
  }, 1500);
},
() => {
  this.isSaving = false;
}
      );
    }
  }

  previousStep(): void {
    if (this.currentStep === 2) {
      this.currentStep = 1;
    }
  }

  goToStep(step: number): void {
    if (step === 1) {
      this.currentStep = 1;
      return;
    }

    if (step === 2 && this.personalInformationCompleted) {
      this.currentStep = 2;
    }
  }

  saveContractHistory(): void {
    if (!this.contractHistoryComponent) {
      return;
    }

    this.contractHistoryComponent.saveContractHistory();
  }

  showNotification(
    message: string,
    type: 'success' | 'error'
  ): void {
    this.notificationMessage = message;
    this.notificationType = type;

    setTimeout(() => {
      this.notificationMessage = '';
    }, 4000);
  }
}