# Architecture de l'application RecipeHub

## Diagramme d'architecture globale

```
+-------------------+         +-------------------+         +----------------------+
|                   |         |                   |         |                      |
|   Web Client      | <-----> |    Backend API    | <-----> |    PostgreSQL DB     |
|  (React/Vite)     |  HTTP   | (Node.js/Express) |   SQL   |   (Docker Service)   |
|   (Docker)        |         |    (Docker)       |         |    (Docker)          |
+-------------------+         +-------------------+         +----------------------+
        |                             ^
        |                             |
        v                             |
+-------------------+                 |
|                   |                 |
| Desktop Client    |-----------------+
|  (ElectronJS)     |   HTTP API
|                   |
+-------------------+

[ Tous les services (web, backend, db) sont orchestrés via Docker Compose ]
```
- **Web Client** : Application React servie par Nginx dans un conteneur Docker, communique avec le backend via HTTP (API REST).
- **Desktop Client** : Application Electron qui utilise la même API backend pour la synchronisation et les opérations distantes.
- **Backend API** : Serveur Node.js/Express dans Docker, gère la logique métier, l'authentification, les fichiers, etc.
- **PostgreSQL DB** : Base de données relationnelle, accessible uniquement par le backend (réseau Docker privé).
- **Docker** : Orchestration de tous les services, gestion des réseaux, des volumes et de l'isolation.

---

## Vue d'ensemble

RecipeHub met en œuvre une **architecture à 4 couches (N-Tier)** avec une séparation claire des préoccupations entre la présentation, la logique applicative, la logique métier et la persistance des données. Cette architecture offre évolutivité, maintenabilité et un couplage faible entre les composants.

## Analyse de l'architecture N-Tier

### Couche 1 : Présentation (Client)
**Emplacement** : `/client` (Application Web React) + `/electron-app` (Client Desktop)

```
┌─────────────────────────────────────────────────┐
│              COUCHE PRÉSENTATION               │
├─────────────────┬───────────────────────────────┤
│   Web Client    │     Desktop Client            │
│   (React/Vite)  │     (Electron + React)        │
│   Port : 3000   │     Application native        │
└─────────────────┴───────────────────────────────┘
```

**Responsabilités** :
- Rendu de l'interface utilisateur
- Validation des entrées utilisateur (côté client)
- Gestion d'état (React Context)
- Communication avec l'API
- Routage et navigation

**Technologies** :
- React 19 avec composants fonctionnels
- TailwindCSS pour le style
- React Router pour le routage SPA
- Axios pour la communication HTTP
- Electron pour les fonctionnalités natives desktop

### Couche 2 : Application/Logique (Middle Tier)
**Emplacement** : `/server` (API Node.js/Express)

```
┌─────────────────────────────────────────────────┐
│             COUCHE APPLICATION                  │
├─────────────────────────────────────────────────┤
│              API Express.js                     │
│  ┌─────────────┬─────────────┬─────────────┐    │
│  │ Contrôleurs │ Middleware  │   Routes    │    │
│  └─────────────┴─────────────┴─────────────┘    │
│              Port : 5000                        │
└─────────────────────────────────────────────────┘
```

**Responsabilités** :
- Gestion des requêtes/réponses HTTP
- Authentification & autorisation (JWT)
- Validation et assainissement des entrées
- Orchestration de la logique métier
- Gestion des uploads de fichiers
- Routage des endpoints API

**Composants clés** :
```javascript
// Implémentation du pattern MVC
server/
├── controllers/     # Gestionnaires de requêtes (Contrôleur)
├── middleware/      # Préoccupations transversales
├── routes/          # Définitions des endpoints API
├── config/          # Gestion de la configuration
└── utils/           # Fonctions utilitaires
```

### Couche 3 : Logique Métier (Service)
**Intégrée dans les contrôleurs** – Suivant les patterns DDD

```
┌─────────────────────────────────────────────────┐
│             COUCHE LOGIQUE MÉTIER               │
├─────────────────────────────────────────────────┤
│  Gestion Recettes │ Gestion Utilisateurs │ Auth │
│  - CRUD Recettes  │ - Gestion Profil    │      │
│  - Système notes  │ - Favoris           │      │
│  - Commentaires   │ - Recettes utilisateur     │
└─────────────────────────────────────────────────┘
```

**Implémentation des règles métier** :
- Logique de création/validation de recette
- Workflows d'authentification utilisateur
- Règles de notation et de commentaires
- Contraintes sur l'upload de fichiers
- Gestion des catégories

### Couche 4 : Accès aux Données (Persistance)
**Emplacement** : `/docker` (Base de données PostgreSQL)

```
┌─────────────────────────────────────────────────┐
│               COUCHE DONNÉES                    │
├─────────────────────────────────────────────────┤
│            Base de données PostgreSQL           │
│  ┌─────────┬─────────┬─────────┬─────────┐      │
│  │ Tables  │ Vues    │ Indexes │ Triggers│      │
│  └─────────┴─────────┴─────────┴─────────┘      │
│              Port : 5430                        │
└─────────────────────────────────────────────────┘
```

**Modèle de données** :
```sql
-- Entités principales et relations
users → recipes (1:plusieurs)
recipes ↔ categories (plusieurs:plusieurs)
recipes → ingredients (1:plusieurs)
recipes → instructions (1:plusieurs)
users ↔ recipes (plusieurs:plusieurs via favoris)
```

## Patterns architecturaux additionnels

### 1. Couche Transversale
```
┌─────────────────────────────────────────────────┐
│           PRÉOCCUPATIONS TRANSVERSALES          │
├─────────────────────────────────────────────────┤
│ Sécurité │ Logs │ Cache │ Stockage Fichiers     │
│   JWT    │ Console │ Mémoire │ Local/Cloud      │
└─────────────────────────────────────────────────┘
```

### 2. Couche Infrastructure
**Dockerisation** :
```yaml
# Orchestration des conteneurs
services:
  frontend:    # Conteneur présentation
  backend:     # Conteneur application  
  postgres:    # Conteneur données
```

## Bénéfices de l'architecture

### ✅ Séparation des préoccupations
- **Présentation** : logique UI isolée de la logique métier
- **Application** : logique API séparée de l'accès aux données
- **Métier** : règles de domaine centralisées
- **Données** : persistance abstraite de l'application

### ✅ Scalabilité
```javascript
// Scalabilité horizontale
// Chaque couche peut être scalée indépendamment
Frontend : Plusieurs instances nginx
Backend : Instances Node.js en load balancing
Database : Réplicas en lecture, pool de connexions
```

### ✅ Maintenabilité
- Limites claires entre les couches
- Patterns d'injection de dépendances
- Structure modulaire
- Configuration externalisée

### ✅ Testabilité
```javascript
// Chaque couche testable indépendamment
// Tests unitaires : contrôleurs, services
// Tests d'intégration : endpoints API
// Tests E2E : flux complet de l'application
```

## Flux de communication

### Flux de requête (descendant)
```
1. Action utilisateur (Présentation)
   ↓
2. Requête HTTP (Réseau)
   ↓  
3. Handler de route (Application)
   ↓
4. Logique contrôleur (Métier)
   ↓
5. Requête base de données (Données)
```

### Flux de réponse (remontant)
```
5. Résultat base de données (Données)
   ↑
4. Traitement métier (Métier)
   ↑
3. Réponse JSON (Application)
   ↑
2. Réponse HTTP (Réseau)
   ↑
1. MAJ UI (Présentation)
```

## Stack technologique par couche

| Couche | Technologies | Rôle |
|--------|--------------|------|
| **Présentation** | React, Electron, TailwindCSS | Interface utilisateur |
| **Application** | Node.js, Express, JWT | API & logique |
| **Métier** | JavaScript, Validation | Règles de domaine |
| **Données** | PostgreSQL, SQL | Persistance |
| **Infrastructure** | Docker, nginx | Déploiement |

## Architecture de déploiement

### Environnement de développement
```
Machine développeur
├── Frontend (localhost:5173)
├── Backend (localhost:5000)
├── Base de données (localhost:5430)
└── App Desktop (Electron)
```

### Environnement de production
```
Infrastructure cloud
├── Frontend (CDN + nginx)
├── Backend (API en load balancing)
├── Base de données (PostgreSQL managé)
└── Stockage fichiers (Cloud)
```

## Évolution de l'architecture

### État actuel : 4 couches monolithique
- Application backend unique
- Base de données partagée
- Déploiement conteneurisé

## Conclusion

Votre application RecipeHub met en œuvre avec succès une **architecture N-Tier à 4 couches** avec :

1. **Séparation claire des couches** – chaque couche a des responsabilités distinctes
2. **Couplage faible** – communication via des interfaces bien définies
3. **Cohésion forte** – fonctionnalités liées regroupées dans chaque couche
4. **Scalabilité** – chaque couche peut être scalée indépendamment
5. **Maintenabilité** – les changements dans une couche n'impactent pas les autres

Cette architecture offre une base solide pour l'évolution et peut migrer vers des microservices à mesure que l'application grandit.
