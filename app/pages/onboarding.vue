<script setup lang="ts">
const { load, select, memberships } = useFamilies()
const name = ref('')
const accentColor = ref('#C2603F')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
    loading.value = true
    error.value = ''
    try {
        const { id } = await $fetch<{ id: string }>('/api/families', {
            method: 'POST',
            body: { name: name.value, accentColor: accentColor.value }
        })
        await load()
        select(id)
        await navigateTo('/')
    } catch {
        error.value = 'Impossible de créer la famille. Réessaie dans un instant.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <AuthCard title="Bienvenue sur GiftList" subtitle="Crée ta famille, ou rejoins-en une avec un lien d'invitation.">
        <form class="space-y-4" @submit.prevent="onSubmit">
            <label class="block text-sm">Nom de la famille
                <input v-model="name" required maxlength="80"
                    class="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2" />
            </label>
            <label class="block text-sm">Couleur d'accent
                <input v-model="accentColor" type="color"
                    class="mt-1 block h-10 w-20 rounded-lg border border-sand bg-white" />
            </label>
            <p v-if="error" class="text-sm text-terracotta-dark" role="alert">{{ error }}</p>
            <button :disabled="loading"
                class="w-full rounded-lg bg-terracotta px-4 py-2 font-medium text-white hover:bg-terracotta-dark disabled:opacity-60">
                {{ loading ? 'Création…' : 'Créer ma famille' }}
            </button>
        </form>
        <p class="mt-6 text-sm text-charcoal/70">
            Tu as reçu une invitation ? Ouvre simplement le lien qu'on t'a envoyé.
        </p>
        <p v-if="memberships.length" class="mt-4 text-sm">
            <NuxtLink to="/" class="text-terracotta-dark underline">Retour à l'accueil</NuxtLink>
        </p>
    </AuthCard>
</template>