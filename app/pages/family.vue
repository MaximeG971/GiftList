<script setup lang="ts">
import type { Database } from '~/types/database.types'

const supabase = useSupabaseClient<Database>()
const { active } = useFamilies()
const familyId = computed(() => active.value?.family.id ?? null)
const isAdmin = computed(() => active.value?.role === 'admin')

const { data: invitations, refresh } = await useAsyncData(
    'invitations',
    async () => {
        if (!familyId.value || !isAdmin.value) return []
        const { data, error } = await supabase
            .from('invitations')
            .select('id, expires_at, created_at')
            .eq('family_id', familyId.value)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },
    { watch: [familyId] }
)

const newLink = ref('')
const copied = ref(false)
const loading = ref(false)
const error = ref('')

async function createInvitation() {
    loading.value = true
    error.value = ''
    copied.value = false
    try {
        const res = await $fetch<{ link: string }>(`/api/families/${familyId.value}/invitations`, {
            method: 'POST'
        })
        newLink.value = res.link
        await refresh()
    } catch {
        error.value = 'Impossible de créer l\'invitation.'
    } finally {
        loading.value = false
    }
}

async function revoke(id: string) {
    await $fetch(`/api/invitations/${id}/revoke`, { method: 'POST' })
    await refresh()
}

async function copyLink() {
    await navigator.clipboard.writeText(newLink.value)
    copied.value = true
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}
</script>

<template>
    <main class="mx-auto max-w-3xl space-y-6 p-6">
        <NuxtLink to="/" class="text-sm text-terracotta-dark underline">← Accueil</NuxtLink>
        <h1 class="text-3xl font-semibold text-brown">Gérer {{ active?.family.name }}</h1>

        <p v-if="!isAdmin">Seuls les administrateurs peuvent gérer la famille.</p>

        <section v-else class="space-y-4 rounded-2xl bg-white/70 p-6 ring-1 ring-sand">
            <h2 class="text-xl font-semibold text-brown">Invitations</h2>
            <p class="text-sm text-charcoal/70">
                Un lien est valable 7 jours et n'est utilisable qu'une seule fois.
            </p>

            <button :disabled="loading"
                class="rounded-lg bg-terracotta px-4 py-2 font-medium text-white hover:bg-terracotta-dark disabled:opacity-60"
                @click="createInvitation">
                Créer un lien d'invitation
            </button>
            <p v-if="error" class="text-sm text-terracotta-dark" role="alert">{{ error }}</p>

            <div v-if="newLink" class="space-y-2 rounded-lg bg-sand/50 p-4">
                <p class="text-sm font-medium">Copie ce lien maintenant : il ne sera plus affichable ensuite.</p>
                <input :value="newLink" readonly
                    class="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm" />
                <button class="rounded-lg border border-sand px-3 py-1 text-sm" @click="copyLink">
                    {{ copied ? 'Copié ✓' : 'Copier' }}
                </button>
            </div>

            <ul v-if="invitations?.length" class="divide-y divide-sand">
                <li v-for="inv in invitations" :key="inv.id" class="flex items-center justify-between py-2 text-sm">
                    <span>Expire le {{ formatDate(inv.expires_at) }}</span>
                    <button class="text-terracotta-dark underline" @click="revoke(inv.id)">Révoquer</button>
                </li>
            </ul>
        </section>
        <FamilyMemberSection v-if="active" :family-id="active.family.id" :is-admin="isAdmin" />
    </main>
</template>