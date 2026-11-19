<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
    loading.value = true
    error.value = ''
    const { error: err } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
    })
    loading.value = false
    if (err) {
        error.value = err.code === 'email_not_confirmed'
            ? 'Vérifie ta boîte mail pour confirmer ton adresse.'
            : 'E-mail ou mot de passe incorrect.'
        return
    }
    await navigateTo(useSupabaseCookieRedirect().pluck() || '/')
}
</script>

<template>
    <AuthCard title="Connexion" subtitle="Retrouve les envies de ta famille.">
        <form class="space-y-4" @submit.prevent="onSubmit">
            <label class="block text-sm">E-mail
                <input v-model="email" type="email" required autocomplete="email"
                    class="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2" />
            </label>
            <label class="block text-sm">Mot de passe
                <input v-model="password" type="password" required autocomplete="current-password"
                    class="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2" />
            </label>
            <p v-if="error" class="text-sm text-terracotta-dark" role="alert">{{ error }}</p>
            <button :disabled="loading"
                class="w-full rounded-lg bg-terracotta px-4 py-2 font-medium text-white hover:bg-terracotta-dark disabled:opacity-60">
                {{ loading ? 'Connexion…' : 'Se connecter' }}
            </button>
        </form>
        <div class="mt-4 flex justify-between text-sm">
            <NuxtLink to="/forgot-password" class="text-terracotta-dark underline">Mot de passe oublié ?</NuxtLink>
            <NuxtLink to="/register" class="text-terracotta-dark underline">Créer un compte</NuxtLink>
        </div>
    </AuthCard>
</template>