export default defineEventHandler(async () => {
  const { url, key } = useRuntimeConfig().public.supabase;

  const res = await $fetch.raw(`${url}/auth/v1/health`, {
    headers: { apikey: key },
  });

  return { ok: res.status === 200 };
});
