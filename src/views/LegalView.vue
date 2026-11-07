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
  <div class="app-container narrow-page page-body">
    <h1 class="page-title">Mentions légales</h1>
    <p class="lede it-small it-muted">Dernière mise à jour : {{ LEGAL.updatedAt }}.</p>

    <p v-if="incomplete" class="legal-note it-small">
      Certaines informations de l'éditeur restent à compléter avant la mise en ligne.
    </p>

    <section class="section-flow">
      <h2 class="it-h5 panel-title">Éditeur du site</h2>
      <dl class="legal-meta it-small">
        <template v-for="row in publisherRows" :key="row.label">
          <dt class="legal-term">{{ row.label }}</dt>
          <dd class="flush">{{ row.value }}</dd>
        </template>
      </dl>
      <p v-if="LEGAL.vat" class="legal-text it-small">{{ LEGAL.vat }}</p>
    </section>

    <section class="section-flow">
      <h2 class="it-h5 panel-title">Hébergement</h2>
      <dl class="legal-meta it-small">
        <template v-for="row in hostRows" :key="row.label">
          <dt class="legal-term">{{ row.label }}</dt>
          <dd class="flush">{{ row.value }}</dd>
        </template>
      </dl>
    </section>

    <section class="section-flow">
      <h2 class="it-h5 panel-title">Propriété intellectuelle</h2>
      <p class="legal-text it-small">
        Le code source est publié sous licence MIT dans le
        <a :href="LEGAL.repository" target="_blank" rel="noopener noreferrer">dépôt GitHub</a>. Le
        nom, l'identité visuelle et les textes du site restent la propriété de l'éditeur, sauf
        mention contraire.
      </p>
    </section>

    <section class="section-flow">
      <h2 class="it-h5 panel-title">Données personnelles et cookies</h2>
      <p class="legal-text it-small">
        Le site ne collecte aucune donnée personnelle et n'utilise aucun cookie de mesure d'audience
        ni de publicité. Seules deux préférences d'affichage sont conservées dans le navigateur. La
        <RouterLink to="/privacy">politique de confidentialité</RouterLink> détaille ces valeurs et
        leur finalité.
      </p>
    </section>

    <section class="section-flow">
      <h2 class="it-h5 panel-title">Responsabilité</h2>
      <p class="legal-text it-small">
        Les QR codes sont générés localement dans le navigateur. L'éditeur ne contrôle pas les
        contenus vers lesquels ils renvoient et décline toute responsabilité à leur sujet.
      </p>
    </section>

    <section class="section-flow">
      <h2 class="it-h5 panel-title">Liens externes</h2>
      <p class="legal-text it-small">
        Le site renvoie vers des services tiers, notamment GitHub. Leur contenu et leurs pratiques
        relèvent de leurs éditeurs.
      </p>
    </section>
  </div>
</template>
