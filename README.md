# Licorne

Jeu de logique Angular : place une licorne par ligne, colonne et zone colorée sans que deux licornes se touchent.

## Développement

```bash
npm ci
npm start
```

L’application locale est disponible sur `http://localhost:4200/`.

## Tests et build

```bash
npm test -- --watch=false
npm run build
```

## Publier sur GitHub Pages

Le workflow `.github/workflows/deploy.yml` teste et déploie automatiquement l’application à chaque push sur `main`. Il configure le chemin de base selon le nom du dépôt et ajoute un fallback pour que les routes Angular fonctionnent lorsqu’on recharge une page.

1. Crée un dépôt GitHub (sans ajouter de README, licence ou `.gitignore`).
2. À la racine du projet, remplace `VOTRE-UTILISATEUR` et `NOM-DU-DEPOT` par les valeurs de ton dépôt, puis configure le dépôt distant :

   ```bash
   git add README.md .github/workflows/deploy.yml
   git commit -m "Configure GitHub Pages deployment"
   git remote add origin https://github.com/VOTRE-UTILISATEUR/NOM-DU-DEPOT.git
   git push -u origin main
   ```

3. Dans GitHub, ouvre **Settings → Pages** et sélectionne **GitHub Actions** comme source de publication.
4. Attends la réussite du workflow dans l’onglet **Actions**. Le site sera publié à l’adresse `https://VOTRE-UTILISATEUR.github.io/NOM-DU-DEPOT/`.

Pour publier les changements suivants :

```bash
git add .
git commit -m "Décrire les changements"
git push
```
