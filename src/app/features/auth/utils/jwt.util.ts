export interface JwtPayload {
  sub?: string;
  exp?: number;
  [key: string]: any;
}

export function isTokenExpired(payload: JwtPayload | null): boolean {
  if (!payload) return true;
  if (!payload.exp) return false;
  return Date.now() >= payload.exp * 1000;
}
