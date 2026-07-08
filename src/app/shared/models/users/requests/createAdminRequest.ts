export interface CreateAdminRequest {
  fullName: string;
  email: string;
  password: string;
  idInstitucion: number;
  strRutaIne: string | null;
  strRutaFotografia: string | null;
  strRFC: string | null;
  strSNII: string | null;
  idNivelAcademico: number | null;
  idsPerfilAcademico: number[];
}