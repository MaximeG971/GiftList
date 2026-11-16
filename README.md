# GiftList

Application familiale privée de listes de cadeaux.
Stack : Nuxt 4, Vue 3, TypeScript, Tailwind CSS, Supabase, Netlify.

## Démarrage

    pnpm install
    cp .env.example .env
    pnpm dev

## Structure

- `app/` : pages, composants, composables, types, utils
- `server/` : API Nitro, services métier, helpers de sécurité
- `supabase/migrations/` : schéma SQL et politiques RLS

## Principes

- TypeScript strict
- Aucune clé secrète côté navigateur
- Permissions vérifiées côté serveur et par RLS
