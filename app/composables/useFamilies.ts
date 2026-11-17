import type { Database } from "~/types/database.types";

export interface FamilyMembership {
  role: "admin" | "member";
  family: { id: string; name: string; accent_color: string | null };
}

export function useFamilies() {
  const supabase = useSupabaseClient<Database>();
  const userId = useUserId();
  const memberships = useState<FamilyMembership[]>("memberships", () => []);
  const loaded = useState("memberships-loaded", () => false);
  const activeId = useCookie<string | null>("giftlist_family", {
    sameSite: "lax",
    default: () => null,
  });

  const active = computed(
    () =>
      memberships.value.find((m) => m.family.id === activeId.value) ??
      memberships.value[0] ??
      null,
  );

  async function load() {
    if (!userId.value) return;
    const { data, error } = await supabase
      .from("family_members")
      .select("role, family:families(id, name, accent_color)")
      .eq("user_id", userId.value)
      .eq("status", "active");
    if (error) throw error;
    memberships.value = (data ?? [])
      .filter((row) => row.family)
      .map((row) => ({
        role: row.role,
        family: row.family as FamilyMembership["family"],
      }));
    loaded.value = true;
  }

  function select(id: string) {
    activeId.value = id;
  }

  // À appeler à la déconnexion : évite toute fuite entre comptes
  function reset() {
    memberships.value = [];
    loaded.value = false;
    activeId.value = null;
  }

  return { memberships, active, loaded, load, select, reset };
}
