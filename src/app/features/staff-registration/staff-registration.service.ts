import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from '../../shared/models/apiResponse';

import { CreateEmployeeRequest }
from '../../shared/models/staff-registration/requests/createEmployeeRequest';

import { InstitutionResponse }
from '../../shared/models/staff-registration/responses/institutionResponse';

const API_URL = 'https://localhost:7160/api/v1';

@Injectable({
  providedIn: 'root'
})
export class StaffRegistrationService {

  private http = inject(HttpClient);

  createEmployee(
    request: CreateEmployeeRequest
  ) {

    return this.http.post<ApiResponse<number>>(
      `${API_URL}/empleado/create-empleado`,
      request
    );

  }

  getInstitutions() {

  return this.http.get<
    ApiResponse<InstitutionResponse[]>
  >(
    `${API_URL}/institucion`
  );

}

}