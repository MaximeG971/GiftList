<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()

async function logout() {
    await supabase.auth.signOut()
    await navigateTo('/login')
}
</script>

<template>
    <main class="mx-auto max-w-3xl p-6">
        <h1 class="text-3xl font-semibold text-brown">
            Bonjour {{ user?.user_metadata?.first_name }}
        </h1>
        <p class="mt-2">Les envies de la famille, au même endroit.</p>
        <button class="mt-6 rounded-lg border border-sand px-4 py-2 text-sm" @click="logout">
            Se déconnecter
        </button>
    </main>
</template>