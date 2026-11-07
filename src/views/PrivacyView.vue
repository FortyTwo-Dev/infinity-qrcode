<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { LEGAL } from '@/lib/legal'
</script>

<template>
  <div class="app-container narrow-page page-body">
    <h1 class="page-title">Politique de confidentialité</h1>
    <p class="lede it-small it-muted">Dernière mise à jour : {{ LEGAL.updatedAt }}.</p>

    <section class="section-flow">
      <h2 class="it-h5 panel-title">Principe</h2>
      <p class="legal-text it-small">
        Infinity QRCode fonctionne entièrement dans le navigateur. Le contenu saisi pour créer un QR
        code n'est jamais envoyé à un serveur. Aucun compte n'est nécessaire.
      </p>
    </section>

    <section class="section-flow">
      <h2 class="it-h5 panel-title">Données stockées sur l'appareil</h2>
      <p class="legal-text it-small">
        Trois valeurs sont enregistrées dans le stockage local du navigateur :
      </p>
      <ul class="fine-list it-small">
        <li><code>theme</code> : le mode clair ou sombre ;</li>
        <li><code>locale</code> : la langue de l'interface ;</li>
        <li><code>readingFont</code> : la police adaptée à la dyslexie.</li>
      </ul>
      <p class="legal-text it-small">
        Elles servent uniquement à retrouver vos préférences d'affichage. Elles ne sont transmises à
        personne et peuvent être effacées dans les réglages du navigateur.
      </p>
    </section>

    <section class="section-flow">
      <h2 class="it-h5 panel-title">Cache hors ligne</h2>
      <p class="legal-text it-small">
        Un service worker met en cache les fichiers de l'application pour permettre l'utilisation
        hors ligne. Ce cache ne contient aucune donnée personnelle.
      </p>
    </section>

    <section class="section-flow">
      <h2 class="it-h5 panel-title">Cookies et mesure d'audience</h2>
      <p class="legal-text it-small">
        Le site n'utilise aucun cookie, aucun traceur et aucun outil de mesure d'audience.
      </p>
    </section>

    <section class="section-flow">
      <h2 class="it-h5 panel-title">Journaux de l'hébergeur</h2>
      <p class="legal-text it-small">
        L'hébergeur peut conserver des journaux techniques, comme l'adresse IP, la date et la page
        demandée, pour la sécurité et le bon fonctionnement du service. Les
        <RouterLink to="/legal">mentions légales</RouterLink> identifient cet hébergeur.
      </p>
    </section>

    <section class="section-flow">
      <h2 class="it-h5 panel-title">Vos droits</h2>
      <p class="legal-text it-small">
        L'éditeur ne traite aucune donnée personnelle. Pour toute question, utilisez le contact
        indiqué dans les <RouterLink to="/legal">mentions légales</RouterLink>. Vous pouvez
        également saisir la
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>.
      </p>
    </section>

    <section class="section-flow">
      <h2 class="it-h5 panel-title">Modification</h2>
      <p class="legal-text it-small">
        Cette politique peut évoluer. La date en haut de page indique la dernière version.
      </p>
    </section>
  </div>
</template>
