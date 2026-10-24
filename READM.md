# AllInfo

Un site qui affiche les informations que ton navigateur donne sur ton appareil, avec un scan animé aux couleurs STYVENTHEDEV (noir et bleu néon).

**Démo :** https://styventhedev.github.io/Allinfo/

## Ce qui est affiché

- **Appareil** : système, modèle (si le navigateur le donne), cœurs CPU, mémoire approximative, écran tactile
- **Écran** : résolution, densité de pixels, zone visible, orientation, profondeur de couleur, thème préféré
- **Navigateur** : nom, langues, cookies, fuseau horaire
- **Réseau** : état, type et qualité de connexion, débit et latence estimés, IP publique
- **Batterie** : niveau et charge (Chrome et navigateurs basés dessus)
- **Stockage** : quota alloué au navigateur (pas l'espace libre total de l'appareil)
- **Position** : uniquement si tu cliques sur « Ajouter ma position » et que tu acceptes
- **Copier le rapport** pour coller les résultats ailleurs

## Limites

Un site web ne peut lire que ce que le navigateur accepte de donner. Selon l'appareil, certaines valeurs sont arrondies (mémoire), masquées (modèle, version d'Android) ou absentes (batterie sur Firefox et Safari). Les cases concernées indiquent « non disponible sur ce navigateur ».

## Vie privée

Tout est calculé dans ton navigateur et rien n'est enregistré. Seule l'IP publique est demandée à un service externe (ipify.org). La position n'est demandée que sur clic.

## Fichiers

- `index.html` : la page
- `style.css` : le style
- `script.js` : le scan
- `styvenshop_emoji-1.png` : l'icône

## Utiliser en local

Ouvre `index.html` dans ton navigateur. L'IP publique et la position demandent une connexion internet, et la position une page en HTTPS (GitHub Pages).

## Licence

Voir le fichier `LICENSE`.
