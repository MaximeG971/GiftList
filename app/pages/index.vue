<script setup lang="ts">
import type { Database } from '~/types/database.types'

const supabase = useSupabaseClient<Database>()
const { active, reset } = useFamilies()
const familyId = computed(() => active.value?.family.id ?? null)

const { data: profiles } = await useAsyncData(
    'family-profiles',
    async () => {
        if (!familyId.value) return []
        const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, type')
            .eq('family_id', familyId.value)
            .order('created_at')
        if (error) throw error
        return data
    },
    { watch: [familyId] }
)

async function logout() {
    await supabase.auth.signOut()
    reset()
    await navigateTo('/login')
}
</script>

<template>
    <main class="mx-auto max-w-3xl space-y-6 p-6">
        <header class="flex flex-wrap items-center justify-between gap-3">
            <h1 class="text-3xl font-semibold text-brown">{{ active?.family.name }}</h1>
            <NuxtLink v-if="active?.role === 'admin'" to="/family" class="text-sm text-terracotta-dark underline">
                Gérer la famille
            </NuxtLink>
            <FamilySwitcher />
        </header>

        <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <li v-for="p in profiles" :key="p.id" class="rounded-2xl bg-white/70 p-4 text-center ring-1 ring-sand">
                <div
                    class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-terracotta text-xl font-semibold text-white">
                    {{ p.first_name.charAt(0).toUpperCase() }}
                </div>
                <p class="mt-2 font-medium">{{ p.first_name }}</p>
                <p class="text-xs text-charcoal/60">{{ p.type === 'child' ? 'Enfant' : 'Adulte' }}</p>
            </li>
        </ul>

        <button class="rounded-lg border border-sand px-4 py-2 text-sm" @click="logout">
            Se déconnecter
        </button>
    </main>
</template>