<script setup lang="ts">
import type { Database } from '~/types/database.types'

const props = defineProps<{ familyId: string; isAdmin: boolean }>()
const supabase = useSupabaseClient<Database>()
const userId = useUserId()
const { load } = useFamilies()
const error = ref('')

const { data: members, refresh } = await useAsyncData(
    'family-members',
    async () => {
        const [m, p] = await Promise.all([
            supabase.from('family_members').select('id, user_id, role')
                .eq('family_id', props.familyId).eq('status', 'active'),
            supabase.from('profiles').select('user_id, first_name')
                .eq('family_id', props.familyId).eq('type', 'adult').eq('status', 'active')
        ])
        if (m.error) throw m.error
        if (p.error) throw p.error
        const names = new Map(p.data.map(x => [x.user_id, x.first_name]))
        return m.data.map(x => ({ ...x, name: names.get(x.user_id) ?? 'Membre' }))
    },
    { watch: [() => props.familyId] }
)

function errorMessage(e: unknown) {
    const code = (e as { data?: { statusMessage?: string } }).data?.statusMessage
    return code === 'last_admin'
        ? 'Tu es le dernier administrateur : nomme d\'abord un autre administrateur.'
        : 'Action impossible pour le moment.'
}

async function run(action: () => Promise<unknown>) {
    error.value = ''
    try {
        await action()
        await refresh()
        await load()
    } catch (e) {
        error.value = errorMessage(e)
    }
}

const base = computed(() => `/api/families/${props.familyId}/members`)

const changeRole = (id: string, role: 'admin' | 'member') =>
    run(() => $fetch(`${base.value}/${id}/role`, { method: 'POST', body: { role } }))

function removeMember(id: string, name: string) {
    if (!confirm(`Retirer ${name} de la famille ? Son profil et sa liste seront conservés.`)) return
    return run(() => $fetch(`${base.value}/${id}`, { method: 'DELETE' }))
}

async function leave(id: string) {
    if (!confirm('Quitter cette famille ? Tu perdras immédiatement l\'accès à ses listes.')) return
    error.value = ''
    try {
        await $fetch(`${base.value}/${id}`, { method: 'DELETE' })
        await load()
        await navigateTo('/')
    } catch (e) {
        error.value = errorMessage(e)
    }
}
</script>

<template>
    <section class="space-y-4 rounded-2xl bg-white/70 p-6 ring-1 ring-sand">
        <h2 class="text-xl font-semibold text-brown">Membres</h2>
        <p v-if="error" class="text-sm text-terracotta-dark" role="alert">{{ error }}</p>

        <ul class="divide-y divide-sand">
            <li v-for="m in members" :key="m.id" class="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span>
                    <strong>{{ m.name }}</strong>
                    <span class="ml-2 rounded-full bg-sand px-2 py-0.5 text-xs">
                        {{ m.role === 'admin' ? 'Administrateur' : 'Membre' }}
                    </span>
                    <span v-if="m.user_id === userId" class="ml-2 text-xs text-charcoal/60">(toi)</span>
                </span>

                <span class="flex gap-3">
                    <template v-if="isAdmin">
                        <button v-if="m.role === 'member'" class="text-terracotta-dark underline"
                            @click="changeRole(m.id, 'admin')">Nommer admin</button>
                        <button v-else class="text-terracotta-dark underline"
                            @click="changeRole(m.id, 'member')">Rétrograder</button>
                        <button v-if="m.user_id !== userId" class="text-terracotta-dark underline"
                            @click="removeMember(m.id, m.name)">Retirer</button>
                    </template>
                    <button v-if="m.user_id === userId" class="text-terracotta-dark underline"
                        @click="leave(m.id)">Quitter la
                        famille</button>
                </span>
            </li>
        </ul>
    </section>
</template>