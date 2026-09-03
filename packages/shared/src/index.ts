// Este archivo contiene todo lo que el back y el front necesiten compartir
// Ejemplos: interfaces, tipos, utilidades, constantes compartidas, etc.

export const Roles = {
  ADMIN: 'ADMIN',
  CERTIFIER: 'CERTIFIER',
} as const;

export type Role = typeof Roles[keyof typeof Roles];

