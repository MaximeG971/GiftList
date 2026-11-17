<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const loading = ref(false)
const sent = ref(false)

async function onSubmit() {
    loading.value = true
    await supabase.auth.resetPasswordForEmail(email.value, {
        redirectTo: `${window.location.origin}/reset-password`
    })
    loading.value = false
    // Réponse identique que l'e-mail existe ou non (pas d'énumération de comptes)
    sent.value = true
}
</script>

<template>
    <AuthCard title="Mot de passe oublié">
        <p v-if="sent" class="text-sm">
            Si un compte existe pour cette adresse, un lien de réinitialisation vient d'être envoyé.
        </p>
        <form v-else class="space-y-4" @submit.prevent="onSubmit">
            <label class="block text-sm">E-mail
                <input v-model="email" type="email" required autocomplete="email"
                    class="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2" />
            </label>
            <button :disabled="loading"
                class="w-full rounded-lg bg-terracotta px-4 py-2 font-medium text-white hover:bg-terracotta-dark disabled:opacity-60">
                Envoyer le lien
            </button>
        </form>
        <p class="mt-4 text-sm">
            <NuxtLink to="/login" class="text-terracotta-dark underline">Retour à la connexion</NuxtLink>
        </p>
    </AuthCard>
</template>