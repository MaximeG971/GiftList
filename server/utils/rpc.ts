const STATUS: Record<string, number> = {
  forbidden: 403,
  not_found: 404,
  invalid: 400,
  last_admin: 409,
};

// Traduit les erreurs métier levées par les fonctions SQL en erreurs HTTP
export function throwRpcError(error: { message: string }): never {
  const status = STATUS[error.message] ?? 500;
  throw createError({
    statusCode: status,
    statusMessage: status === 500 ? "Erreur serveur" : error.message,
  });
}
