/* Enlace Académico registrado (usuario con rol Admin), tal como
lo devuelve el backend (EnlaceAcademicoDto). */
export interface EnlaceAcademicoResponse {
    id: string;
    fullName: string;
    email: string;
    idInstitucion: number;
    strInstitucion: string;
    strRFC: string | null;
    strSNII: string | null;
    idNivelAcademico: number | null;
    strNivelAcademico: string | null;
    strRutaIne: string | null;
    strRutaFotografia: string | null;
    isActive: boolean;
    idsPerfilAcademico: number[];
}
