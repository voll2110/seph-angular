import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthService } from '../../core/services/auth/authService';
import { CatalogService } from '../../core/services/catalogs/catalog.service';
import { InstitutionalInformationService } from '../../core/services/institutional-information/institutional-information.service';
import { PersonalDataComponent } from './personal-data/personal-data';
import { InfrastructureDataComponent } from './infrastructure-data/infrastructure-data';
import { VinculationDataComponent } from './vinculation-data/vinculation-data';

describe('Institutional report validation', () => {
  const reports = {
    createReportePersonal: vi.fn(() => new Subject()),
    updateReportePersonal: vi.fn(() => new Subject()),
    createReporteInfraestructura: vi.fn(() => new Subject()),
    updateReporteInfraestructura: vi.fn(() => new Subject()),
    createReporteVinculacion: vi.fn(() => new Subject()),
    updateReporteVinculacion: vi.fn(() => new Subject())
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    TestBed.configureTestingModule({ providers: [
      { provide: InstitutionalInformationService, useValue: reports },
      { provide: AuthService, useValue: { currentUser: () => ({ id: 'test-user' }) } },
      { provide: CatalogService, useValue: {} },
      { provide: ChangeDetectorRef, useValue: { detectChanges: vi.fn() } }
    ] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function personal() {
    const component = TestBed.runInInjectionContext(() => new PersonalDataComponent());
    component.idMapInstitucionPeriodo = 37;
    Object.assign(component.personalReport, {
      totalGeneral: 3, totalDirectivos: 1, directivosHombres: 1, directivosMujeres: 0,
      totalAdministrativos: 1, administrativosHombres: 0, administrativosMujeres: 1,
      totalDocentes: 1, docentesHombres: 1, docentesMujeres: 0,
      docentesTiempoCompleto: 1, docentesAsignatura: 0, docentesHora: 0, idNivelAcademico: 1
    });
    return component;
  }

  it.each([0, 0.5, NaN, Infinity])('rejects invalid personal total %s without sending a request', value => {
    const component = personal();
    component.personalReport.totalGeneral = value;
    component.savePersonalData();
    expect(reports.createReportePersonal).not.toHaveBeenCalled();
    expect(component.saveMessageType).toBe('error');
  });

  it('rejects fractional personal distributions even when totals match', () => {
    const component = personal();
    component.personalReport.directivosHombres = 0.5;
    component.personalReport.directivosMujeres = 0.5;
    component.reportSaved = true;
    component.isEditing = true;
    component.savePersonalData();
    expect(reports.updateReportePersonal).not.toHaveBeenCalled();
    expect(component.saveMessage).toBe('Las cantidades de personal deben ser números enteros.');
  });

  it('allows valid personal counts with zero subcategories', () => {
    personal().savePersonalData();
    expect(reports.createReportePersonal).toHaveBeenCalledWith(expect.objectContaining({ idMapInstitucionPeriodo: 37 }));
  });

  function infrastructure() {
    const component = TestBed.runInInjectionContext(() => new InfrastructureDataComponent());
    component.idMapInstitucionPeriodo = 37;
    Object.assign(component.infrastructureReport, {
      totalAulas: 0, totalLaboratorios: 0, totalTalleres: 0, totalComputo: 0,
      biblioteca: false, totalBibliotecas: null, idInternet: 1, idDiscapacitado: 1
    });
    return component;
  }

  it.each([[true, 0], [true, null], [false, 1], [true, 1.5]] as const)(
    'rejects inconsistent library flag %s with quantity %s', (flag, count) => {
      const component = infrastructure();
      component.infrastructureReport.biblioteca = flag;
      component.infrastructureReport.totalBibliotecas = count;
      component.saveInfrastructureData();
      expect(reports.createReporteInfraestructura).not.toHaveBeenCalled();
      expect(component.saveMessageType).toBe('error');
    }
  );

  it('rejects fractional infrastructure quantities on update', () => {
    const component = infrastructure();
    component.infrastructureReport.totalAulas = 0.5;
    component.reportSaved = true;
    component.saveInfrastructureData();
    expect(reports.updateReporteInfraestructura).not.toHaveBeenCalled();
  });

  it.each([[false, null], [true, 1]] as const)('allows library flag %s with quantity %s', (flag, count) => {
    const component = infrastructure();
    component.infrastructureReport.biblioteca = flag;
    component.infrastructureReport.totalBibliotecas = count;
    component.saveInfrastructureData();
    expect(reports.createReporteInfraestructura).toHaveBeenCalledWith(expect.objectContaining({
      idMapInstitucionPeriodo: 37, intTotalBibliotecas: count ?? 0
    }));
  });

  function vinculation() {
    const component = TestBed.runInInjectionContext(() => new VinculationDataComponent());
    component.idMapInstitucionPeriodo = 37;
    Object.assign(component.vinculationReport, {
      totalConveniosActivos: 0, porcentajeLaborando: 0,
      seguimientoEgresados: false, idMecanismoSeguimiento: null,
      sectoresVinculados: [{ idSectorVinculado: 1 }]
    });
    return component;
  }

  it('allows a null mechanism when graduate follow-up is disabled', () => {
    vinculation().saveVinculationData();
    expect(reports.createReporteVinculacion).toHaveBeenCalledWith(expect.objectContaining({
      idMapInstitucionPeriodo: 37, bitSeguimientoEgresados: false, idMecanismoSeguimiento: null
    }));
  });

  it.each([null, 0, -1, 1.5])('requires a valid mechanism when follow-up is enabled: %s', mechanism => {
    const component = vinculation();
    component.vinculationReport.seguimientoEgresados = true;
    component.vinculationReport.idMecanismoSeguimiento = mechanism;
    component.saveVinculationData();
    expect(reports.createReporteVinculacion).not.toHaveBeenCalled();
  });

  it('allows follow-up with a mechanism and a boundary percentage', () => {
    const component = vinculation();
    component.vinculationReport.seguimientoEgresados = true;
    component.vinculationReport.idMecanismoSeguimiento = 1;
    component.vinculationReport.porcentajeLaborando = 100;
    component.saveVinculationData();
    expect(reports.createReporteVinculacion).toHaveBeenCalled();
  });

  it('rejects fractional agreement counts on update', () => {
    const component = vinculation();
    component.vinculationReport.totalConveniosActivos = 0.5;
    component.reportSaved = true;
    component.saveVinculationData();
    expect(reports.updateReporteVinculacion).not.toHaveBeenCalled();
  });

  it('rejects a non-finite percentage', () => {
    const component = vinculation();
    component.vinculationReport.porcentajeLaborando = NaN;
    component.saveVinculationData();
    expect(reports.createReporteVinculacion).not.toHaveBeenCalled();
  });
});
