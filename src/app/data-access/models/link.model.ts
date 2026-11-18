/** Router-friendly link description, so mock data can point at in-app routes without hard-coded URLs. */
export interface AppLink {
  readonly commands: readonly string[];
  readonly queryParams?: Readonly<Record<string, string>>;
}
