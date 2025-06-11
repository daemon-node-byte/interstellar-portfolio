import { writable } from 'svelte/store';
export const selectedPlanet = writable<string | null>(null);
