export function useUserId() {
  const user = useSupabaseUser();
  return computed(() => {
    const u = user.value as { id?: string; sub?: string } | null;
    return u?.id ?? u?.sub ?? null;
  });
}
