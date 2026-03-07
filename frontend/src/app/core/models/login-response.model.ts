export interface LoginResponse {
  token: string;
  idusuario: number;
  nombres: string;
  idtipousuario: number;
  rol: string;        // ← Agrega esto
}