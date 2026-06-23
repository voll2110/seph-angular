import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
export class StaffRegistrationComponent {
  @ViewChild(PersonalInformationComponent)
  personalInformationComponent?: PersonalInformationComponent;

  menuCollapsed = false;
  currentStep = 1;
  personalInformationCompleted = false;

  toggleMenu(): void {
    this.menuCollapsed = !this.menuCollapsed;
  }

  nextStep(): void {
    if (this.currentStep === 1) {
     this.personalInformationComponent?.saveEmployee(() => {
  this.personalInformationCompleted = true;
  this.currentStep = 2;
});
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
    alert('Historial de contrato guardado correctamente');
  }
}