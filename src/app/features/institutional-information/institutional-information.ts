import { Component, ChangeDetectorRef ,ViewChild,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EnrollmentDataComponent } from './enrollment-data/enrollment-data';

@Component({
  selector: 'app-institutional-information',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    EnrollmentDataComponent
  ],
  templateUrl: './institutional-information.html',
  styleUrl: './institutional-information.scss'
})
export class InstitutionalInformationComponent {
  @ViewChild(EnrollmentDataComponent)
  enrollmentDataComponent?: EnrollmentDataComponent;
  private cdr = inject(ChangeDetectorRef);
  // Controla si el menú lateral se encuentra abierto o colapsado.
  menuCollapsed = false;

  // Paso visible dentro del Registro de Información Institucional.
  currentStep = 1;

  // Indica si la información de matrícula ya fue registrada.
  enrollmentCompleted = false;

  // Evita varios clics mientras se guarda la información.
  isSaving = false;

  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  toggleMenu(): void {
    this.menuCollapsed = !this.menuCollapsed;
  }

  goToStep(step: number): void {
    if (step === 1) {
      this.currentStep = 1;
    }
  }

saveEnrollmentData(): void {
  if (
    this.isSaving ||
    !this.enrollmentDataComponent
  ) {
    return;
  }

  this.isSaving = true;
  this.cdr.detectChanges();

  this.enrollmentDataComponent.saveEnrollmentData(
    () => {
      this.enrollmentCompleted = true;

      this.showNotification(
        'Datos de matrícula guardados correctamente.',
        'success'
      );
       this.cdr.detectChanges();
    },
    () => {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  );
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