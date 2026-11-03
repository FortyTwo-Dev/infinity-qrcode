<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { LEGAL, isLegalIncomplete, legalValue } from '@/lib/legal'

const incomplete = isLegalIncomplete()

const publisherRows = [
  { label: 'Nom commercial', value: legalValue(LEGAL.publisher) },
  { label: 'Forme juridique', value: legalValue(LEGAL.status) },
  { label: 'SIREN', value: legalValue(LEGAL.siren) },
  { label: 'SIRET du siège', value: legalValue(LEGAL.siret) },
  { label: 'RCS', value: legalValue(LEGAL.rcs) },
  { label: 'Adresse', value: legalValue(LEGAL.address) },
  { label: 'Contact', value: legalValue(LEGAL.contact) },
  { label: 'Directeur de la publication', value: legalValue(LEGAL.director) },
]

const hostRows = [
  { label: 'Hébergeur', value: legalValue(LEGAL.hostName) },
  { label: 'Adresse', value: legalValue(LEGAL.hostAddress) },
  { label: 'Téléphone', value: legalValue(LEGAL.hostPhone) },
]
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-8">
    <h1 class="text-3xl font-semibold sm:text-4xl">Mentions légales</h1>
    <p class="mt-2 text-sm opacity-70">Dernière mise à jour : {{ LEGAL.updatedAt }}.</p>

    <p v-if="incomplete" class="mt-6 border border-dashed border-border p-3 text-sm">
      Certaines informations de l'éditeur restent à compléter avant la mise en ligne.
    </p>

    <section class="mt-8">
      <h2 class="it-h5 text-lg font-semibold">Éditeur du site</h2>
      <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-[12rem_1fr]">
        <template v-for="row in publisherRows" :key="row.label">
          <dt class="font-medium">{{ row.label }}</dt>
          <dd class="m-0">{{ row.value }}</dd>
        </template>
      </dl>
      <p v-if="LEGAL.vat" class="mt-3 text-sm">{{ LEGAL.vat }}</p>
    </section>

    <section class="mt-8">
      <h2 class="it-h5 text-lg font-semibold">Hébergement</h2>
      <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-[12rem_1fr]">
        <template v-for="row in hostRows" :key="row.label">
          <dt class="font-medium">{{ row.label }}</dt>
          <dd class="m-0">{{ row.value }}</dd>
        </template>
      </dl>
    </section>

    <section class="mt-8">
      <h2 class="it-h5 text-lg font-semibold">Propriété intellectuelle</h2>
      <p class="mt-3 text-sm">
        Le code source est publié sous licence MIT dans le
        <a :href="LEGAL.repository" target="_blank" rel="noopener noreferrer">dépôt GitHub</a>. Le
        nom, l'identité visuelle et les textes du site restent la propriété de l'éditeur, sauf
        mention contraire.
      </p>
    </section>

    <section class="mt-8">
      <h2 class="it-h5 text-lg font-semibold">Données personnelles et cookies</h2>
      <p class="mt-3 text-sm">
        Le site ne collecte aucune donnée personnelle et n'utilise aucun cookie de mesure d'audience
        ni de publicité. Seules deux préférences d'affichage sont conservées dans le navigateur. La
        <RouterLink to="/privacy">politique de confidentialité</RouterLink> détaille ces valeurs et
        leur finalité.
      </p>
    </section>

    <section class="mt-8">
      <h2 class="it-h5 text-lg font-semibold">Responsabilité</h2>
      <p class="mt-3 text-sm">
        Les QR codes sont générés localement dans le navigateur. L'éditeur ne contrôle pas les
        contenus vers lesquels ils renvoient et décline toute responsabilité à leur sujet.
      </p>
    </section>

    <section class="mt-8">
      <h2 class="it-h5 text-lg font-semibold">Liens externes</h2>
      <p class="mt-3 text-sm">
        Le site renvoie vers des services tiers, notamment GitHub. Leur contenu et leurs pratiques
        relèvent de leurs éditeurs.
      </p>
    </section>
  </div>
</template>
