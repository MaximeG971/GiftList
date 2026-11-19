<script setup lang="ts">
const route = useRoute()
const token = route.params.token as string
const { load, select } = useFamilies()

const { data: preview } = await useFetch<{ valid: boolean; familyName: string | null }>(
    '/api/invitations/preview',
    { method: 'POST', body: { token } }
)

const loading = ref(false)
const error = ref('')

async function confirm() {
    loading.value = true
    error.value = ''
    try {
        const res = await $fetch<{ status: string; family_id?: string }>('/api/invitations/accept', {
            method: 'POST',
            body: { token }
        })
        if (res.status === 'invalid') {
            error.value = 'Ce lien n\'est plus valide.'
            return
        }
        await load()
        if (res.family_id) select(res.family_id)
        await navigateTo('/')
    } catch {
        error.value = 'Impossible de rejoindre la famille. Réessaie dans un instant.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <AuthCard v-if="preview?.valid" title="Invitation"
        :subtitle="`Tu es invité·e à rejoindre « ${preview.familyName} ».`">
        <p v-if="error" class="mb-4 text-sm text-terracotta-dark" role="alert">{{ error }}</p>
        <button :disabled="loading"
            class="w-full rounded-lg bg-terracotta px-4 py-2 font-medium text-white hover:bg-terracotta-dark disabled:opacity-60"
            @click="confirm">
            {{ loading ? 'Un instant…' : 'Rejoindre la famille' }}
        </button>
    </AuthCard>
    <AuthCard v-else title="Lien invalide"
        subtitle="Ce lien d'invitation est expiré, déjà utilisé ou révoqué. Demande-en un nouveau à un administrateur.">
        <NuxtLink to="/" class="text-sm text-terracotta-dark underline">Retour à l'accueil</NuxtLink>
    </AuthCard>
</template>