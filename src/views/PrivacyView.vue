<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { LEGAL } from '@/lib/legal'
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-8">
    <h1 class="text-3xl font-semibold sm:text-4xl">Politique de confidentialité</h1>
    <p class="mt-2 text-sm opacity-70">Dernière mise à jour : {{ LEGAL.updatedAt }}.</p>

    <section class="mt-8">
      <h2 class="it-h5 text-lg font-semibold">Principe</h2>
      <p class="mt-3 text-sm">
        Infinity QRCode fonctionne entièrement dans le navigateur. Le contenu saisi pour créer un QR
        code n'est jamais envoyé à un serveur. Aucun compte n'est nécessaire.
      </p>
    </section>

    <section class="mt-8">
      <h2 class="it-h5 text-lg font-semibold">Données stockées sur l'appareil</h2>
      <p class="mt-3 text-sm">
        Deux valeurs sont enregistrées dans le stockage local du navigateur :
      </p>
      <ul class="mt-2 list-disc pl-5 text-sm">
        <li><code>theme</code> : le mode clair ou sombre ;</li>
        <li><code>themeColor</code> : la couleur d'accent.</li>
      </ul>
      <p class="mt-3 text-sm">
        Elles servent uniquement à retrouver vos préférences d'affichage. Elles ne sont transmises à
        personne et peuvent être effacées dans les réglages du navigateur.
      </p>
    </section>

    <section class="mt-8">
      <h2 class="it-h5 text-lg font-semibold">Cache hors ligne</h2>
      <p class="mt-3 text-sm">
        Un service worker met en cache les fichiers de l'application pour permettre l'utilisation
        hors ligne. Ce cache ne contient aucune donnée personnelle.
      </p>
    </section>

    <section class="mt-8">
      <h2 class="it-h5 text-lg font-semibold">Cookies et mesure d'audience</h2>
      <p class="mt-3 text-sm">
        Le site n'utilise aucun cookie, aucun traceur et aucun outil de mesure d'audience.
      </p>
    </section>

    <section class="mt-8">
      <h2 class="it-h5 text-lg font-semibold">Journaux de l'hébergeur</h2>
      <p class="mt-3 text-sm">
        L'hébergeur peut conserver des journaux techniques, comme l'adresse IP, la date et la page
        demandée, pour la sécurité et le bon fonctionnement du service. Les
        <RouterLink to="/legal">mentions légales</RouterLink> identifient cet hébergeur.
      </p>
    </section>

    <section class="mt-8">
      <h2 class="it-h5 text-lg font-semibold">Vos droits</h2>
      <p class="mt-3 text-sm">
        L'éditeur ne traite aucune donnée personnelle. Pour toute question, utilisez le contact
        indiqué dans les <RouterLink to="/legal">mentions légales</RouterLink>. Vous pouvez
        également saisir la
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>.
      </p>
    </section>

    <section class="mt-8">
      <h2 class="it-h5 text-lg font-semibold">Modification</h2>
      <p class="mt-3 text-sm">
        Cette politique peut évoluer. La date en haut de page indique la dernière version.
      </p>
    </section>
  </div>
</template>
