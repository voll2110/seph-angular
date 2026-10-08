import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth/authService';
import { InstitutionalInformationService } from '../../../core/services/institutional-information/institutional-information.service';
import { EnrollmentDataComponent } from './enrollment-data';

describe('Enrollment numeric validation', () => {
  let component: EnrollmentDataComponent;
  let reports: { createReporteMatricula: ReturnType<typeof vi.fn>; updateReporteMatricula: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.useFakeTimers();
    reports = { createReporteMatricula: vi.fn(() => of({ data: null })), updateReporteMatricula: vi.fn(() => of({ data: null })) };
    TestBed.configureTestingModule({ providers: [
      { provide: InstitutionalInformationService, useValue: reports },
      { provide: AuthService, useValue: { currentUser: () => ({ id: 'test-user' }) } },
      { provide: ChangeDetectorRef, useValue: { detectChanges: vi.fn() } }
    ] });
    component = TestBed.runInInjectionContext(() => new EnrollmentDataComponent());
    Object.assign(component, {
      idMapInstitucionPeriodo: 37,
      matriculaTotal: 10, matriculaHombres: 6, matriculaMujeres: 4,
      matriculaTsu: 2, matriculaLicenciatura: 5, matriculaPostgrado: 3,
      tasaDesercion: 0, tasaReprobacion: 100, tasaEficienciaTerminal: 98.5
    });
  });

  afterEach(() => vi.useRealTimers());

  it.each([
    ['matriculaTotal', 0], ['matriculaHombres', -1], ['matriculaTsu', 1.5],
    ['matriculaTotal', Infinity], ['tasaDesercion', -0.01],
    ['tasaReprobacion', 100.01], ['tasaEficienciaTerminal', NaN]
  ] as const)('rejects invalid %s=%s for create and update', (field, value) => {
    component[field] = value;
    const finish = vi.fn();
    component.saveEnrollmentData(undefined, finish);
    component.reportSaved = true;
    component.isEditing = true;
    component.saveEnrollmentData(undefined, finish);
    expect(reports.createReporteMatricula).not.toHaveBeenCalled();
    expect(reports.updateReporteMatricula).not.toHaveBeenCalled();
    expect(component.saveMessageType).toBe('error');
    expect(finish).toHaveBeenCalledTimes(2);
    expect(component.isSaving).toBe(false);
  });

  it('allows boundary percentages and preserves the institution-period ID', () => {
    component.saveEnrollmentData();
    expect(reports.createReporteMatricula).toHaveBeenCalledWith(expect.objectContaining({
      idMapInstitucionPeriodo: 37, decimalTazaDesercion: 0,
      decimalTazaReprobacion: 100, decimalTazaEficienciaTerminal: 98.5
    }));
  });
});
