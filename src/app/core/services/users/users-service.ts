import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../../shared/models/apiResponse';
import { CreateAdminRequest } from '../../../shared/models/users/requests/createAdminRequest';
import { UpdateEnlaceRequest } from '../../../shared/models/users/requests/updateEnlaceRequest';
import { EnlaceAcademicoResponse } from '../../../shared/models/users/responses/enlaceAcademicoResponse';

const API_URL = 'https://localhost:7160/api/v1';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  createAdmin(request: CreateAdminRequest) {
    return this.http.post<ApiResponse<unknown>>(`${API_URL}/Users/admins`, request);
  }

  /* Concentrado de Enlaces Académicos (usuarios con rol Admin).
    Endpoint: GET /Users/admins */
  getEnlaces() {
    return this.http.get<ApiResponse<EnlaceAcademicoResponse[]>>(`${API_URL}/Users/admins`);
  }

  /* Detalle de un Enlace Académico (para poblar el formulario de edición).
    Endpoint: GET /Users/admins/{id} */
  getEnlaceById(id: string) {
    return this.http.get<ApiResponse<EnlaceAcademicoResponse>>(`${API_URL}/Users/admins/${id}`);
  }

  /* Actualiza un Enlace Académico existente.
    Endpoint: PUT /Users/admins/{id} */
  updateEnlace(id: string, request: UpdateEnlaceRequest) {
    return this.http.put<ApiResponse<string>>(`${API_URL}/Users/admins/${id}`, request);
  }

  /* Desactiva un Enlace Académico.
    Endpoint: PUT /Users/admins/{id}/desactivar */
  deactivateEnlace(id: string) {
    return this.http.put<ApiResponse<string>>(`${API_URL}/Users/admins/${id}/desactivar`, {});
  }

  /* Reactiva un Enlace Académico previamente desactivado.
    Endpoint: PUT /Users/admins/{id}/reactivar */
  reactivateEnlace(id: string) {
    return this.http.put<ApiResponse<string>>(`${API_URL}/Users/admins/${id}/reactivar`, {});
  }
}