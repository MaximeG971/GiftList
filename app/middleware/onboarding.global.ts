const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/confirm",
  "/forgot-password",
  "/reset-password",
];

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_PATHS.includes(to.path) || to.path.startsWith("/join/")) return;
  if (!useUserId().value) return; // la redirection vers /login est gérée par le module

  const { memberships, loaded, load } = useFamilies();
  if (!loaded.value) await load();

  if (memberships.value.length === 0 && to.path !== "/onboarding") {
    return navigateTo("/onboarding");
  }
});
