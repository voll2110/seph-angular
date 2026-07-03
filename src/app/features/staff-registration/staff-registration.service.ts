import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from '../../shared/models/apiResponse';

import { CreateEmployeeRequest }
from '../../shared/models/staff-registration/requests/createEmployeeRequest';

import { InstitutionResponse }
from '../../shared/models/staff-registration/responses/institutionResponse';
import { EmployeeResponse }
from '../../shared/models/staff-registration/responses/employeeResponse';

import { CreateHistorialContratoRequest }
from '../../shared/models/staff-registration/requests/createHistorialContratoRequest';
import { RegistroPersonalResponse }
from '../../shared/models/staff-registration/responses/registroPersonalResponse';
/*URL base del backend. * 
 * Se reutiliza para todas las peticiones del módulo. */
const API_URL = 'https://localhost:7160/api/v1';


/* Servicio encargado de gestionar 
 operaciones del módulo Registro Personal. */
@Injectable({
  providedIn: 'root'
})
export class StaffRegistrationService {

/* Cliente HTTP para consumir endpoints. */
  private http = inject(HttpClient);

  /* Registra un empleado. * 
    Endpoint:  POST /empleado/create-empleado 
   * @param request Información capturada del formulario.
   * @returns Identificador del registro creado. */
  createEmployee(
  request: CreateEmployeeRequest
) {

  return this.http.post<ApiResponse<EmployeeResponse>>(
    `${API_URL}/empleado/create-empleado`,
    request
  );

}
/* Obtiene el catálogo de instituciones.
  Endpoint: GET /institucion 
  @returns Lista de instituciones disponibles. */
  getInstitutions() {
  return this.http.get<ApiResponse<InstitutionResponse[]>>(
    `${API_URL}/Institucion/get-instituciones`
  );
}

createHistorialContrato(
  request: CreateHistorialContratoRequest
) {
  return this.http.post<ApiResponse<any>>(
    `${API_URL}/HistorialContrato/create-historial-contrato`,
    request
  );
}

/* Obtiene el concentrado de registros de personal
  capturados por el usuario autenticado.
  Endpoint: GET /empleado/get-registros
  @returns Lista de registros (empleado + historial de contrato). */
getRegistros() {
  return this.http.get<ApiResponse<RegistroPersonalResponse[]>>(
    `${API_URL}/empleado/get-registros`
  );
}

}