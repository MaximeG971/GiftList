<script setup lang="ts">
const supabase = useSupabaseClient()
const firstName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const sent = ref(false)

async function onSubmit() {
    loading.value = true
    error.value = ''
    const { error: err } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
            data: { first_name: firstName.value.trim() },
            emailRedirectTo: `${window.location.origin}/confirm`
        }
    })
    loading.value = false
    if (err) {
        error.value = 'Inscription impossible. Vérifie les informations saisies.'
        return
    }
    sent.value = true
}
</script>

<template>
    <AuthCard title="Créer un compte">
        <p v-if="sent" class="text-sm">
            Un e-mail de confirmation vient d'être envoyé à <strong>{{ email }}</strong>.
            Clique sur le lien pour activer ton compte.
        </p>
        <form v-else class="space-y-4" @submit.prevent="onSubmit">
            <label class="block text-sm">Prénom
                <input v-model="firstName" required maxlength="60" autocomplete="given-name"
                    class="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2" />
            </label>
            <label class="block text-sm">E-mail
                <input v-model="email" type="email" required autocomplete="email"
                    class="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2" />
            </label>
            <label class="block text-sm">Mot de passe (8 caractères minimum)
                <input v-model="password" type="password" required minlength="8" autocomplete="new-password"
                    class="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2" />
            </label>
            <p v-if="error" class="text-sm text-terracotta-dark" role="alert">{{ error }}</p>
            <button :disabled="loading"
                class="w-full rounded-lg bg-terracotta px-4 py-2 font-medium text-white hover:bg-terracotta-dark disabled:opacity-60">
                {{ loading ? 'Création…' : 'Créer mon compte' }}
            </button>
        </form>
        <p class="mt-4 text-sm">
            Déjà un compte ? <NuxtLink to="/login" class="text-terracotta-dark underline">Se connecter</NuxtLink>
        </p>
    </AuthCard>
</template>