<script setup lang="ts">
const supabase = useSupabaseClient()
const password = ref('')
const ready = ref(false)
const loading = ref(false)
const error = ref('')

onMounted(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') ready.value = true
    })
    onBeforeUnmount(() => data.subscription.unsubscribe())
})

async function onSubmit() {
    loading.value = true
    error.value = ''
    const { error: err } = await supabase.auth.updateUser({ password: password.value })
    loading.value = false
    if (err) {
        error.value = 'Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré.'
        return
    }
    await navigateTo('/')
}
</script>

<template>
    <AuthCard title="Nouveau mot de passe">
        <p v-if="!ready" class="text-sm">
            Vérification du lien… Si rien ne se passe, le lien est invalide ou expiré.
            <NuxtLink to="/forgot-password" class="text-terracotta-dark underline">Recevoir un nouveau lien</NuxtLink>
        </p>
        <form v-else class="space-y-4" @submit.prevent="onSubmit">
            <label class="block text-sm">Nouveau mot de passe (8 caractères minimum)
                <input v-model="password" type="password" required minlength="8" autocomplete="new-password"
                    class="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2" />
            </label>
            <p v-if="error" class="text-sm text-terracotta-dark" role="alert">{{ error }}</p>
            <button :disabled="loading"
                class="w-full rounded-lg bg-terracotta px-4 py-2 font-medium text-white hover:bg-terracotta-dark disabled:opacity-60">
                Enregistrer
            </button>
        </form>
    </AuthCard>
</template>