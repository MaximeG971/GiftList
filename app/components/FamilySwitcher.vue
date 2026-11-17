<script setup lang="ts">
const { memberships, active, select } = useFamilies()
</script>

<template>
    <div v-if="active" class="flex items-center gap-3">
        <select :value="active.family.id" class="rounded-lg border border-sand bg-white px-3 py-2 text-sm"
            aria-label="Changer de famille" @change="select(($event.target as HTMLSelectElement).value)">
            <option v-for="m in memberships" :key="m.family.id" :value="m.family.id">
                {{ m.family.name }}
            </option>
        </select>
        <NuxtLink to="/onboarding" class="text-sm text-terracotta-dark underline">
            Nouvelle famille
        </NuxtLink>
    </div>
</template>