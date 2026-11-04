/**
 * A credits entry: project name, role catalog key, license label and project
 * URL. The role is a message key translated by the view, not display text.
 */
export type Credit = readonly [name: string, role: string, license: string, href: string]
