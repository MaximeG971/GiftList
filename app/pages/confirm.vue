<script setup lang="ts">
const user = useSupabaseUser()
const redirectInfo = useSupabaseCookieRedirect()
watch(user, (u) => {
    if (u) navigateTo(redirectInfo.pluck() || '/')
}, { immediate: true })
</script>

<template>
    <AuthCard title="Confirmation en cours…" subtitle="Un instant, on te connecte." />
</template>