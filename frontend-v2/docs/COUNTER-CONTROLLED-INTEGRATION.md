# Intégration contrôlée du comptoir — état de livraison

## Ce qui est raccordé

L’accueil `/comptoir` utilise la session vendeur existante, `/api/comptoir/context`, la file `/api/showroom/counter` et `/api/auth/logout`. Les actions Prendre en charge, Terminer, Client plus là et Reprendre passent par les transitions backend existantes. Le prochain client est attribué par le GET existant ; le vendeur ne choisit aucun ticket dans cette interface.

Les états Disponible/Pause/Mission sont stockés sous `tpa:counter-presence:<organisation>:<vendeur>`, dans le stockage Redis déjà configuré. Ce n’est ni une seconde file ni une seconde authentification. Les changements de disponibilité, transitions et attributions partagent le verrou d’organisation existant. Les écritures conditionnelles Redis refusent un verrou expiré. Pause/Mission/Logout refusent un ticket appelé ou en cours. Une nouvelle authentification réussie réactive le vendeur.

L’accès aux tickets est limité à l’organisation et aux sites autorisés du compte. Sans viewFullQueue, seuls les tickets du vendeur sont renvoyés et aucun compteur global n’est exposé. Le rendu plafonne les cartes à deux, place l’actif en premier et conserve la règle d’affichage des absents pendant cinq minutes. Les demandes d’achat rapide existantes restent disponibles dans une section repliable.

Le prénom et le code sont issus des données réelles. Aucun mot de passe fictif et aucun changement d’identité JavaScript dans le comptoir intégré. Les thèmes sont une préférence locale par customerId. Planning et Tâches restent explicitement démonstratifs, sans nouveau moteur ni stockage métier. Le prototype isolé complet sous demo-comptoir reste disponible séparément et inchangé pendant cette intégration.

## Vérifications faites

- Lecture seule des comptes : NR09 = Nicolas, actif ; MR07 = Youssef, actif. Aucun compte créé.
- Lecture seule du ticketing : NR09 possède un ticket actif, MR07 aucun ; aucun ticket en attente au moment de l’inspection.
- 23 tests automatisés isolés : attribution, disponibilités, retours, transitions, refus de départ avec client actif, permissions, organisation/site, plafond de cartes, logout, verrou concurrent/expiré et réactivation après authentification.
- Typecheck global réussi.
- Le vrai `/comptoir` sans session redirige vers le Login TPA existant.

## Vérifications réelles reportées par l’utilisateur

Le Login local est ouvert à `http://127.0.0.1:3000/login`. L’utilisateur a choisi de se connecter plus tard. Les essais avec mots de passe réels, rendu authentifié, ticket réel, Pause/Mission et changement NR09→MR07 **ne sont pas déclarés réussis**. Aucun ticket réel n’a été terminé ou créé pour fabriquer le scénario. NR09 doit d’abord traiter son ticket actuel selon le fonctionnement métier avant un départ.

Scénario restant : connexion NR09, identité/ticket, refus de départ tant qu’actif, traitement réel du ticket si approprié, Pause/Mission/retour, Quitter le poste, Login MR07, contrôle identité/données, deux thèmes. Une file comportant des clients de test autorisés sera nécessaire pour constater l’attribution réelle pendant/après les états.

## Dette et décisions à valider

1. **Couverture minimale absente** : il faudra une règle par site (minimum de vendeurs, plages horaires et exceptions superviseur), une présence de site courante et fiable, puis un contrôle atomique sous le verrou partagé avant toute indisponibilité. Aucune valeur de minimum n’a été inventée.
2. **Présence multi-postes** : la présence actuelle est par vendeur/organisation. Un registre de postes, heartbeat/expiration de présence et politique multi-sites doivent être définis avant une affectation avancée. Fermer brutalement un navigateur ne vaut pas logout serveur.
3. **Sessions existantes** : logout conserve le mécanisme actuel d’effacement de cookies et ajoute l’indisponibilité. La révocation centrale des anciens jetons signés et la traçabilité détaillée des reprises restent une évolution de l’authentification existante, non une nouvelle authentification ajoutée ici.
4. **Planning/Missions/RH/messagerie** : restent hors intégration. Aucune tâche ne bascule automatiquement la présence.
5. **File existante** : l’attribution est toujours déclenchée par le polling GET et la lecture de la file globale existante. Son coût et son verrou de cinq secondes mériteront une optimisation dédiée si le volume augmente. Une expiration échoue sans écriture, puis l’interface réessaie.
6. **Périmètre visuel** : les écrans RH/messagerie complets restent dans le prototype isolé ; dans l’accueil intégré, ils ne sont pas présentés comme de vraies fonctions connectées.

Aucun DiagnosticEngineV2, aucune route borne/outil, aucune variable d’environnement ni configuration Vercel modifiée. Aucun commit, push, déploiement, nettoyage ou suppression Redis.

## Fichiers modifiés pendant cette intégration

- `C:\Users\gpa08\plateforme\frontend-v2\app\comptoir\page.tsx`
- `C:\Users\gpa08\plateforme\frontend-v2\components\counter\CounterWorkspace.tsx`
- `C:\Users\gpa08\plateforme\frontend-v2\app\TpaLogoutButton.tsx`
- `C:\Users\gpa08\plateforme\frontend-v2\app\api\comptoir\context\route.ts`
- `C:\Users\gpa08\plateforme\frontend-v2\app\api\showroom\counter\route.ts`
- `C:\Users\gpa08\plateforme\frontend-v2\app\api\auth\logout\route.ts`
- `C:\Users\gpa08\plateforme\frontend-v2\app\api\auth\client\login\route.ts`
- `C:\Users\gpa08\plateforme\frontend-v2\lib\counter\CounterTicketStore.ts`

## Fichiers créés

- `C:\Users\gpa08\plateforme\frontend-v2\components\counter\LiveCounter.tsx`
- `C:\Users\gpa08\plateforme\frontend-v2\components\counter\LiveCounter.module.css`
- `C:\Users\gpa08\plateforme\frontend-v2\lib\counter\CounterSellerAccess.ts`
- `C:\Users\gpa08\plateforme\frontend-v2\lib\counter\CounterTicketPresentation.ts`
- `C:\Users\gpa08\plateforme\frontend-v2\app\api\comptoir\presence\route.ts`
- `C:\Users\gpa08\plateforme\frontend-v2\tests\counter-integration.test.ts`
- `C:\Users\gpa08\plateforme\frontend-v2\tests\counter-presence-store.test.ts`
- `C:\Users\gpa08\plateforme\frontend-v2\docs\COUNTER-CONTROLLED-INTEGRATION.md`
