# Spécifications — Licornes

## 1. Présentation

**Licornes** est un jeu de casse-tête solo sur une grille. Le joueur doit placer une licorne dans chaque zone de couleur en respectant les contraintes de lignes et de colonnes. L’application est conçue pour être agréable à utiliser sur mobile comme sur ordinateur.

## 2. Règles du jeu

Pour résoudre une grille :

1. Chaque zone colorée doit contenir exactement une licorne.
2. Chaque ligne doit contenir exactement une licorne.
3. Chaque colonne doit contenir exactement une licorne.
4. Deux licornes ne peuvent pas occuper des cases voisines, y compris en diagonale : leurs cases doivent être séparées par au moins une case vide.
5. Une case ne peut contenir qu’une licorne au maximum.
6. Une case peut être vide pendant la résolution.

## 3. Boucle de jeu

1. Le joueur arrive sur un parcours composé de paquets de dix casse-têtes.
2. Il choisit un niveau accessible sur la page du parcours et découvre une grille colorée.
3. Le chronomètre démarre au premier lancement du niveau. Le joueur peut le mettre en pause et le reprendre ; le temps est conservé en quittant puis en rouvrant le niveau.
4. La progression, les niveaux terminés, les notes et les temps sont sauvegardés localement.
5. Un clic sur une case vide y place une croix de note.
6. Un second clic remplace la croix par une licorne ; un troisième clic vide la case.
7. L’interface indique clairement les lignes, colonnes et zones qui contiennent déjà leur licorne.
8. La partie est gagnée lorsque toutes les contraintes sont satisfaites.
9. Le joueur peut recommencer le niveau ou revenir au parcours.

Le jeu ne doit pas révéler automatiquement la solution. Les erreurs sont signalées sans bloquer les autres placements.

## 4. Grille et niveaux

### Première version

- Les quatre premiers niveaux sont des tutoriels prédéfinis sur une grille **4 × 4** : chacun met en avant une règle.
- Les niveaux suivants utilisent une grille carrée de **8 × 8** avec huit zones de couleur distinctes.
- Une licorne attendue par ligne, colonne et zone.
- Les zones sont contiguës et peuvent avoir des formes irrégulières.
- Chaque grille doit avoir une solution valide unique.
- La solution doit pouvoir être trouvée sans deviner : les déductions de base consistent à placer une licorne quand une ligne, une colonne ou une zone n'a plus qu'une case candidate, en éliminant également les cases voisines autour des licornes placées.
- Le générateur vérifie le nombre de solutions et que cette méthode de déduction permet de compléter la grille avant de la proposer.
- Les niveaux sont présentés par paquets de dix. Les dix premiers sont accessibles au départ.
- Six niveaux terminés sur dix (60 %) débloquent le paquet suivant.
- Il n'y a pas de système d'étoiles.

La taille et le nombre de zones varient entre les tutoriels et les niveaux classiques. Chaque grille a autant de zones que de lignes et de colonnes.

## 5. Interface et expérience utilisateur

- Interface en français.
- Les règles sont consultables depuis l’accueil via un bouton d’information et une fenêtre modale ; elles ne sont pas répétées sur l’écran de jeu.
- Plateau centré, lisible et utilisable au toucher.
- Les cases ont une taille adaptée aux petits écrans et une zone tactile confortable.
- Les couleurs des zones restent suffisamment distinctes ; les indices ne reposent pas uniquement sur la couleur.
- Une licorne est représentée par un pictogramme ou un emoji, avec une indication accessible pour les lecteurs d’écran.
- Les lignes et colonnes complètes sont indiquées visuellement.
- Un message de victoire apparaît lorsque la grille est résolue.
- Les boutons et textes restent utilisables sur mobile, tablette et ordinateur.

## 6. Exigences fonctionnelles

- **Annotations :** le premier clic place une croix de note, le deuxième la remplace par une licorne, le troisième vide la case. Le cycle se répète.
- **Validation :** les croix sont des notes personnelles et ne comptent pas comme des licornes.
- **Validation :** le jeu détecte si chaque ligne, colonne et zone contient exactement une licorne.
- **Progression :** l’état des lignes, colonnes et zones est mis à jour après chaque action.
- **Nouvelle partie :** une nouvelle grille valide peut être lancée à tout moment.
- **Recommencer :** le joueur peut vider le plateau actuel sans changer de grille.
- **Victoire :** l’état gagné n’est affiché que si toutes les règles sont respectées.
- **Parcours :** seuls les niveaux des paquets débloqués peuvent être lancés.
- **Progression :** terminer six niveaux d'un paquet ouvre le paquet suivant.
- **Chronomètre :** il est visible dans le niveau, peut être mis en pause/repris et conserve son temps lors d'un changement de page.
- **Sauvegarde locale :** niveaux terminés, placements, notes et temps sont conservés dans le navigateur.

## 7. Exigences techniques

- Application réalisée avec **Angular** et **TypeScript**.
- Tests unitaires exécutés avec **Vitest** via le builder de tests Angular.
- Interface découpée en composants Angular standalone (plateau, panneau de jeu, consignes et éléments de page) ; l'état et les commandes de partie sont centralisés dans un service Angular.
- Les règles, le générateur et la validation du puzzle restent dans un module TypeScript indépendant de l'interface.
- Mise en page responsive, pensée d’abord pour les écrans mobiles.
- La logique des règles est séparée de l’affichage afin de pouvoir être testée indépendamment.
- Les interactions essentielles fonctionnent au clavier et au toucher.
- Le parcours présente les niveaux en paquets de dix, avec le premier paquet accessible au départ.
- Le sixième niveau terminé dans un paquet débloque le paquet suivant.
- Les niveaux 1 à 4 affichent chacun une règle à découvrir et un plateau 4 × 4 prédéfini.
- Le chronomètre reste visible et son temps est conservé en pause lors du retour au parcours.
- La progression est conservée après rechargement de la page.
- Aucun compte utilisateur ni serveur n’est nécessaire pour la première version.

## 8. Critères d’acceptation

- Le projet démarre localement et affiche le jeu sans erreur.
- Les niveaux 1 à 4 affichent chacun un tutoriel prédéfini de 4 × 4 sur une règle différente.
- À partir du niveau 5, le plateau comporte 8 lignes, 8 colonnes et 8 zones colorées.
- Le joueur peut placer et retirer les licornes sur ordinateur et sur mobile.
- Un clic successif sur la même case alterne entre croix de note, licorne et case vide ; les croix ne comptent pas dans la validation.
- Une ligne, une colonne ou une zone avec plusieurs licornes est signalée comme invalide.
- Deux licornes voisines, même en diagonale, sont signalées comme une erreur.
- Chaque nouvelle grille n'a qu'une solution, et celle-ci est résoluble par déductions sans supposition.
- Une grille incomplète n’est pas déclarée gagnée.
- Une grille respectant exactement toutes les contraintes déclenche le message de victoire.
- Les commandes « Recommencer » et « Nouvelle partie » ont des comportements distincts et fonctionnels.
- Le plateau reste lisible et manipulable sur un écran de téléphone.

## 9. Hors périmètre de la première version

- Comptes et sauvegarde en ligne.
- Classement, mode multijoueur et partage de parties.
- Système de score, étoiles ou pénalités.
- Indices révélant la position d’une licorne.
- Éditeur de niveaux et campagne de difficulté.
