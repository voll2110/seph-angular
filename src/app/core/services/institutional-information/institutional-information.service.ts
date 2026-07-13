import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from '../../../shared/models/apiResponse';
import { PeriodoActivoInstitucionResponse }
from '../../../shared/models/institutional-information/responses/periodoActivoInstitucionResponse';
import { ReporteMatriculaComparativoResponse }
  from '../../../shared/models/institutional-information/responses/reporteMatriculaComparativoResponse';
import { ReporteMatriculaResponse }
  from '../../../shared/models/institutional-information/responses/reporteMatriculaResponse';
import { CreateReporteMatriculaRequest }
  from '../../../shared/models/institutional-information/requests/createReporteMatriculaRequest';
import { UpdateReporteMatriculaRequest }
  from '../../../shared/models/institutional-information/requests/updateReporteMatriculaRequest';

/* URL base del backend. */
const API_URL = 'https://localhost:7160/api/v1';

/*
 * Servicio encargado de consumir los endpoints
 * del Registro de Información Institucional.
 */
@Injectable({
  providedIn: 'root'
})
export class InstitutionalInformationService {

  // Cliente HTTP utilizado para las peticiones al backend.
  private http = inject(HttpClient);

  /*
   * Obtiene el comparativo del reporte de matrícula
   * contra el periodo anterior de la misma institución.
   */
  
  getReporteMatriculaComparativo(
    idMapInstitucionPeriodo: number
  ) {
    return this.http.get<
      ApiResponse<ReporteMatriculaComparativoResponse>
    >(
      `${API_URL}/Matricula/reporte-comparativo/${idMapInstitucionPeriodo}`
    );
  }
  getPeriodoActivo(idInstitucion: number) {
  return this.http.get<
    ApiResponse<PeriodoActivoInstitucionResponse>
  >(
    `${API_URL}/Matricula/periodo-activo/${idInstitucion}`
  );
}
/*
 * Obtiene el reporte guardado para
 * una relación institución-periodo.
 */
getReporteMatricula(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReporteMatriculaResponse>
  >(
    `${API_URL}/Matricula/reporte/${idMapInstitucionPeriodo}`
  );
}
/*
 * Registra el reporte de matrícula
 * correspondiente al periodo activo.
 */
createReporteMatricula(
  request: CreateReporteMatriculaRequest
) {
  return this.http.post<
    ApiResponse<ReporteMatriculaResponse>
  >(
    `${API_URL}/Matricula/reporte`,
    request
  );
}
/*
 * Actualiza el reporte de matrícula
 * correspondiente al periodo activo.
 */
updateReporteMatricula(
  request: UpdateReporteMatriculaRequest
) {
  return this.http.put<
    ApiResponse<ReporteMatriculaResponse>
  >(
    `${API_URL}/Matricula/reporte`,
    request
  );
}
}