<script setup lang="ts">
const user = useSupabaseUser()
watch(user, (u) => { if (u) navigateTo('/') }, { immediate: true })
</script>

<template>
    <AuthCard title="Confirmation en cours…" subtitle="Un instant, on te connecte." />
</template>