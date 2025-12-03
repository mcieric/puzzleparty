# Guide: Configuration Supabase pour Puzzle Party

## Étape 1: Créer un projet Supabase (si pas déjà fait)

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "Start your project" ou "New Project"
3. Donnez un nom à votre projet (ex: "puzzleparty")
4. Choisissez un mot de passe pour la base de données
5. Sélectionnez une région proche de vous
6. Cliquez sur "Create new project"

## Étape 2: Récupérer vos clés API

1. Une fois le projet créé, allez dans **Settings** (⚙️ dans la barre latérale)
2. Cliquez sur **API** dans le menu Settings
3. Vous verrez deux informations importantes:
   - **Project URL** (commence par `https://xxx.supabase.co`)
   - **anon public** key (une longue chaîne de caractères)

## Étape 3: Créer le fichier .env.local

Créez un fichier `.env.local` à la racine de votre projet avec ce contenu:

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici
```

**Important**: Remplacez les valeurs par celles que vous avez copiées à l'étape 2.

## Étape 4: Appliquer le schéma de base de données

1. Dans le dashboard Supabase, allez dans **SQL Editor** (icône </> dans la barre latérale)
2. Cliquez sur "+ New query"
3. Copiez tout le contenu du fichier `supabase/migrations/20240101000000_initial_schema.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur "Run" (ou appuyez sur Ctrl+Enter)

Vous devriez voir un message de succès. Vos tables sont maintenant créées!

## Étape 5: Vérifier que tout fonctionne

1. Dans le dashboard, allez dans **Table Editor**
2. Vous devriez voir vos tables: `users`, `puzzles`, `mints`, `xp_history`

## Étape 6: Créer votre premier puzzle (optionnel pour tester)

Vous devrez utiliser le contrat `PuzzleManager` pour créer un puzzle via la fonction `createPuzzle`. 
Pour l'instant, vous pouvez tester sans puzzle en attendant de configurer le webhook.

---

## Résumé des fichiers importants

- `.env.local` → Vos clés Supabase (à créer)
- `supabase/migrations/20240101000000_initial_schema.sql` → Le schéma SQL (à exécuter dans le dashboard)
- `src/lib/supabase.ts` → Client Supabase (déjà configuré)

## Besoin d'aide?

Si vous êtes bloqué, dites-moi à quelle étape et je vous aide!
