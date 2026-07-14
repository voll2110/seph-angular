import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BitacoraPaginadaResponse } from '../../../shared/models/bitacora/bitacoraEntryResponse';

const API_URL = 'https://bitacora-seph.papus.online/api/v1';

/* Servicio dedicado a consultar Seph.BitacoraServer.
No usa ApiResponse<T> porque ese servicio es independiente de Seph.Principal
y devuelve el JSON directo, sin el wrapper. */
@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  private readonly http = inject(HttpClient);

  getBitacora(modulo: string, pagina: number, tamanoPagina: number) {
    return this.http.get<BitacoraPaginadaResponse>(
      `${API_URL}/Bitacora?modulo=${encodeURIComponent(modulo)}&pagina=${pagina}&tamanoPagina=${tamanoPagina}`
    );
  }
}
