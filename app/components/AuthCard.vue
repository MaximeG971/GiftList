<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
    <div class="flex min-h-screen items-center justify-center p-6">
        <div class="w-full max-w-md rounded-2xl bg-white/70 p-8 shadow-sm ring-1 ring-sand">
            <h1 class="text-2xl font-semibold text-brown">{{ title }}</h1>
            <p v-if="subtitle" class="mt-1 text-sm text-charcoal/70">{{ subtitle }}</p>
            <div class="mt-6">
                <slot />
            </div>
        </div>
    </div>
</template>