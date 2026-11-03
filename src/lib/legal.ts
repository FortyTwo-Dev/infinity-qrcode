/**
 * Legal identity of the publisher and of the host.
 *
 * Every mandatory field must be filled before the site goes live. Empty fields
 * render as "À compléter" and raise a notice on the legal page.
 */
export const LEGAL = {
  publisher: 'InfinityApp',
  status: 'Entrepreneur individuel (micro-entreprise)',
  siren: '934 964 255',
  siret: '934 964 255 00012',
  rcs: '934 964 255 R.C.S. Paris, inscrit le 7 novembre 2024',
  address: '8 B rue Abel, 75012 Paris',
  contact: 'the.fortytwo_dev@proton.me',
  // The publisher chose the commercial name instead of a personal name.
  director: 'InfinityApp',
  // Optional: a VAT number, or the franchise mention, only when relevant.
  vat: '',
  hostName: 'OVH SAS',
  hostAddress: '2 rue Kellermann, 59100 Roubaix, France',
  hostPhone: '1007, ou +33 9 72 10 10 07 depuis l’étranger',
  repository: 'https://github.com/FortyTwo-Dev/infinity-qrcode',
  updatedAt: '3 novembre 2026',
}

export const LEGAL_MISSING = 'À compléter'

export function legalValue(value: string): string {
  return value.trim() || LEGAL_MISSING
}

export function isLegalIncomplete(): boolean {
  return [
    LEGAL.publisher,
    LEGAL.status,
    LEGAL.siren,
    LEGAL.address,
    LEGAL.contact,
    LEGAL.director,
  ].some((value) => !value.trim())
}
