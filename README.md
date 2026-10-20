# Mon projet de formation – DEAES

Questionnaire en ligne pour les étudiants AES (formation initiale).
Site 100 % statique : HTML, CSS, JavaScript. **Aucune donnée collectée** : pas de nom demandé, pas de base de données, pas de cookie, pas de stockage navigateur, aucune requête vers un service externe (polices système, bibliothèque PDF hébergée dans le dépôt, politique CSP qui bloque tout appel réseau).

L'étudiant remplit, télécharge son PDF (généré sur son appareil), puis l'envoie par mail en pièce jointe.

## Mise en ligne sur GitHub Pages

1. Créer un dépôt public sur GitHub (ex. `projet-formation-aes`).
2. Déposer à la racine : `index.html`, `style.css`, `script.js`, le dossier `vendor/` (avec `jspdf.umd.min.js`) et ce `README.md`.
3. Dans le dépôt : **Settings → Pages → Build and deployment → Source : Deploy from a branch**, branche `main`, dossier `/ (root)` → **Save**.
4. Après 1 à 2 minutes, le site est en ligne à l'adresse `https://<votre-compte>.github.io/projet-formation-aes/`.
5. Générer un QR code de cette adresse pour la projection en salle.

## Personnaliser

En haut de `script.js`, bloc `CONFIG` :

- `emailReferent` : votre adresse professionnelle (pré-remplie dans le bouton « Ouvrir mon mail »).
- `promotion` : libellé imprimé en tête du PDF.
- `stages` : périodes, blocs et dates de soutenance (à mettre à jour chaque année).

## Bon à savoir

- Le mail ne peut pas joindre le PDF automatiquement (limite des liens `mailto:`) : l'étudiant ajoute la pièce jointe lui-même.
- Recharger la page efface les réponses (choix volontaire : aucune trace). Un avertissement s'affiche si l'étudiant tente de quitter la page sans avoir généré son PDF.
- Bibliothèque PDF : jsPDF 2.5.1 (licence MIT), servie depuis le dépôt.
