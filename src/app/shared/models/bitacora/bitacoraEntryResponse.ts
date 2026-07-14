export interface BitacoraEntryResponse {
  id: string;
  modulo: string;
  idRegistro: string;
  accion: string;
  idUsuario: string;
  usuarioNombre: string;
  jsonData: string;
  fechaAccion: string;
}

/* Respuesta paginada del endpoint GET /api/v1/bitacora. */
export interface BitacoraPaginadaResponse {
  items: BitacoraEntryResponse[];
  totalRegistros: number;
  pagina: number;
  tamanoPagina: number;
}
