# SPÉCIFICATIONS DU PROJET PUZZLE PARTY

Ce document sert de mémoire persistante pour les spécifications du projet. À mettre à jour à chaque validation de fonctionnalité.

---

## 1. Concept Général

Puzzle Party est une application de puzzle compétitive sur la blockchain Base. Les joueurs mintent des pièces de puzzle pour révéler une image cachée et concourir pour des récompenses en USDC.

---

## 2. Économie & Répartition des Gains ✅ VALIDÉ

### Configuration des Puzzles

**Puzzle Normal (7 par saison)**
- **100 pièces × 0.10 USDC** = 10 USDC total
- Durée estimée : Variable selon engagement

**Super Puzzle (1 par saison)**
- **200 pièces × 0.15 USDC** = 30 USDC total
- Thème premium Gold Luxury

**Mega Puzzle (après 4 saisons)**
- **300 pièces × 0.20 USDC** + Réserve accumulée
- Prize pool total : ~112 USDC

### Répartition des Revenus (Modèle Hybride)

- **45%** : Finisher (Celui qui complète le puzzle)
- **30%** : Tirage au sort (Raffle parmi tous les participants)
- **15%** : Créateur/Dev
- **10%** : Réserve (Accumulée pour le Mega Puzzle)

**Exemple Puzzle Normal (10 USDC) :**
- Finisher : **4.5 USDC** 🏆
- Tirage : **3 USDC** 🎲
- Créateur : **1.5 USDC** 💰
- Réserve : **1 USDC** 🏦

**Exemple Super Puzzle (30 USDC) :**
- Finisher : **13.5 USDC** 🏆
- Tirage : **9 USDC** 🎲
- Créateur : **4.5 USDC** 💰
- Réserve : **3 USDC** 🏦

**Mega Puzzle (après accumulation de 4 saisons) :**
- Réserve accumulée : **~52 USDC** (32 puzzles × 10% chacun)
- Prize pool Mega : 60 USDC + 52 USDC = **112 USDC total**
- Finisher : **~50 USDC** 🏆🏆🏆
- Tirage : **~34 USDC** 🎲🎲🎲

---

## 3. Structure de la Saison & Roadmap ✅ VALIDÉ

### Cycle Complet

**4 Saisons → 1 Mega Puzzle**

### Structure d'une Saison
- **7 Puzzles Classiques** (100 pièces chacun)
- **1 Super Puzzle** (200 pièces)
- Durée estimée : ~2-3 mois par saison

### Règles de Timing
- **Cooldown inter-puzzle** : 12h d'attente entre la fin d'un puzzle et le début du suivant
- **Timeout 24h** : Si aucun mint pendant 24h, activation du Sniper Timer (voir section 5)

---

## 4. Stack Technique

- **Blockchain** : Base (Sepolia pour test, Mainnet pour production)
- **Contrats** : Solidity (PuzzleManager, XPManager)
- **Frontend** : Next.js, Tailwind CSS
- **Backend** : Supabase (Base de données PostgreSQL, Edge Functions)
- **Paiements** : USDC (ERC-20 sur Base)

---

## 5. Règles de Jeu & Gamification ✅ VALIDÉ

### Limitation Anti-Baleine
- **Max 10 pièces par wallet par puzzle** (limite totale, pas horaire)
- **Cooldown aléatoire : 35-55 secondes** entre chaque mint (anti-bot)
- Affichage du temps restant en temps réel pour l'UX

### Système XP & Badges

**Gain d'XP :**
- Chaque mint = **10 XP**
- Finisher bonus = **+50 XP**
- Participation au tirage = **+5 XP**

**Paliers de Badges (Progressifs) :**
| Badge | XP Requis | Équivalent Puzzles |
|-------|-----------|-------------------|
| 🥉 **Bronze** | 0-99 XP | 0-9 puzzles |
| 🥈 **Silver** | 100-499 XP | 10-49 puzzles |
| 🥇 **Gold** | 500-1499 XP | 50-149 puzzles |
| 💎 **Diamond** | 1500+ XP | 150+ puzzles |

### Multiplicateur Raffle (XP Boost)
- **Top 10 XP de la saison** → **x2 tickets** pour le tirage au sort
- Exemple : Si un joueur a minté 5 pièces (5 tickets), il obtient 10 tickets s'il est dans le Top 10

### Sniper Timer (FOMO Mechanism)
**Si aucun mint pendant 24h :**
- Le puzzle se termine automatiquement
- Le **dernier minter** remporte **40% du pot actuel**
- Les **60% restants** vont au tirage (récompense tous les participants)
- Créateur et Réserve reçoivent leurs parts normales (15% + 10%)

**Exemple :** Puzzle à 8 USDC après 24h sans mint
- Dernier minter : **3.2 USDC** 🎯
- Tirage : **4.8 USDC** 🎲
- Créateur : **1.2 USDC**
- Réserve : **0.8 USDC**

### Engagement Visuel
- **Live Feed** : Ticker défilant montrant les mints en temps réel avec adresse et timestamp
- **Hot Streak** : Effet visuel (flammes 🔥) sur l'avatar après 3 mints consécutifs
- **Countdown 12h** : Affichage du temps restant avant le prochain puzzle
- **Jackpot Dynamique** : Affichage en temps réel du prize pool qui augmente à chaque mint

---

## 6. Événements Mensuels ✅ VALIDÉ

### Principe
Les événements mensuels sont disponibles **en parallèle** des puzzles normaux (ne bloquent pas la progression des saisons).

### Structure par Badge (4 puzzles simultanés)

**🥉 Bronze Monthly (Dernier jour du mois)**
- 50 pièces × 0.10 USDC = **5 USDC pot**
- Accessible à tous (Bronze+)

**🥈 Silver Monthly**
- 75 pièces × 0.12 USDC = **9 USDC pot**
- Accessible aux Silver+

**🥇 Gold Monthly**
- 100 pièces × 0.15 USDC = **15 USDC pot**
- Accessible aux Gold+
- **Mystery Box** : 10% de chance de gagner 1-3 USDC supplémentaires

**💎 Diamond Monthly**
- 150 pièces × 0.20 USDC = **30 USDC pot**
- Accessible aux Diamond uniquement
- **Mystery Box Rare** : 20% de chance de gagner 5 USDC garantis

### Mystery Box (Tirage Séparé)
- Effectué **après** le tirage principal
- Montant aléatoire révélé avec animation spéciale
- Financé par une partie du prize pool de l'événement mensuel

---

## 7. Identité Visuelle & Thèmes ✅ VALIDÉ

### Puzzle Normal (Cyberpunk Neon)
- **Palette** : Violet (#8B5CF6), Rose (#EC4899), Cyan (#06B6D4)
- **Effets** : Néons pulsants, grilles holographiques
- **Win Animation** : Confettis + Flash lumineux + Son "Victory"

### Super Puzzle (Gold Luxury)
- **Palette** : Or (#F59E0B), Ambre (#D97706), Noir (#000000)
- **Effets** : Reflets dorés, particules scintillantes
- **Win Animation** : Pluie de pièces d'or + Tremblement d'écran + Son "Légendaire"

### Mega Puzzle (Cosmic Galaxy)
- **Palette** : Holographique, Arc-en-ciel, Violet cosmique (#6366F1)
- **Effets** : Étoiles filantes, nébuleuses animées
- **Win Animation** : Effet Supernova + Ouverture de portail dimensionnel + Son "Épique"

### Événements Mensuels
- **Bronze** : Thème Terre (Vert/Marron)
- **Silver** : Thème Lune (Argent/Bleu)
- **Gold** : Thème Soleil (Or/Orange)
- **Diamond** : Thème Galaxie (Multicolore/Holographique)

---

## 8. Sécurité & Anti-Abus ✅ VALIDÉ

### Mesures Anti-Bot
- Cooldown **aléatoire 35-55 secondes** (impossible à prédire)
- Vérification on-chain du dernier mint timestamp
- Rate limiting côté frontend et backend

### Mesures Anti-Whale
- Limite stricte de **10 pièces par wallet par puzzle**
- Tracking on-chain via mapping `userMints[puzzleId][userAddress]`
- Impossible de contourner via multi-wallets (coût prohibitif)

### Mesures Anti-Sybil
- Coût d'entrée (0.10 USDC minimum) rend les attaques non rentables
- XP lié à l'activité réelle (pas transférable)
- Badges non transférables (soulbound)

---

## 9. Revenus Créateur (Projections) 💰

### Par Saison (8 puzzles)
- 7 puzzles normaux : 7 × 1.5 USDC = **10.5 USDC**
- 1 super puzzle : **4.5 USDC**
- **Total : 15 USDC par saison**

### Par Cycle Complet (4 saisons + Mega)
- 4 saisons : 4 × 15 USDC = **60 USDC**
- 1 mega puzzle : **~17 USDC**
- **Total : ~77 USDC par cycle**

### Événements Mensuels (estimé)
- Bronze : 0.75 USDC
- Silver : 1.35 USDC
- Gold : 2.25 USDC
- Diamond : 4.5 USDC
- **Total : ~9 USDC par mois** (si tous les événements sont complétés)

### Projection Annuelle
- Cycles normaux : ~77 USDC × 3 cycles = **231 USDC**
- Événements mensuels : 9 USDC × 12 mois = **108 USDC**
- **Total estimé : ~339 USDC/an** (si engagement constant)

---

## 10. Historique des Décisions

- **[29/11/2025]** Validation répartition 50/50 (Gagnant/Raffle) - ANCIEN MODÈLE
- **[29/11/2025]** Validation Cooldown 12h inter-puzzle
- **[29/11/2025]** Validation Gamification (Mint Limit, XP Multiplier, Sniper Timer)
- **[29/11/2025]** Validation Thèmes Visuels (Normal/Super/Mega)
- **[02/12/2025]** ✅ **RÉVISION V11 COMPLÈTE VALIDÉE**
  - Répartition Hybride : 45/30/15/10
  - Cooldown aléatoire : 35-55s
  - Limite : 10 pièces max par puzzle
  - Sniper Timer : 40% dernier minter / 60% tirage
  - XP Multiplier : Top 10 → x2 tickets
  - Événements mensuels en parallèle (4 niveaux par badge)
  - Mystery Box : Tirage séparé (Gold/Diamond)
  - Paliers XP progressifs : 0-99 / 100-499 / 500-1499 / 1500+
  - Structure : 4 saisons → Mega Puzzle

---

## 11. Prochaines Étapes Techniques

### Phase 1 : Smart Contracts
- [ ] Mettre à jour `PuzzleManager.sol` avec nouveau modèle économique (45/30/15/10)
- [ ] Implémenter cooldown aléatoire (35-55s)
- [ ] Ajouter Sniper Timer (24h timeout)
- [ ] Mettre à jour `XPManager.sol` avec nouveaux paliers

### Phase 2 : Backend (Supabase)
- [ ] Créer tables pour événements mensuels
- [ ] Ajouter système Mystery Box
- [ ] Implémenter tracking Top 10 XP par saison

### Phase 3 : Frontend
- [ ] Implémenter thèmes visuels (Cyberpunk/Gold/Cosmic)
- [ ] Ajouter animations de victoire
- [ ] Créer UI pour événements mensuels
- [ ] Afficher badges et progression XP

### Phase 4 : Tests & Déploiement
- [ ] Tests unitaires contrats
- [ ] Tests d'intégration frontend/backend
- [ ] Déploiement Base Sepolia
- [ ] Audit de sécurité
- [ ] Déploiement Base Mainnet

---

**📌 Document mis à jour le 02/12/2025 suite à la validation complète de la révision V11**
