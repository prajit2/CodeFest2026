/**
 * crisisCache.ts
 *
 * Persists CRISIS_RESOURCES into MMKV on first call so Rocky can surface
 * crisis contact numbers even when the device is offline during the demo.
 *
 * Usage:
 *   Call `seedCrisisCache()` once at app startup (e.g. in the root layout).
 *   Use `getCachedCrisisResources()` anywhere you need the crisis data —
 *   it returns the live constant first, falling back to the MMKV copy.
 */

import { createMMKV } from 'react-native-mmkv';
import { CRISIS_RESOURCES } from '@/services/rockyIntent';

const CRISIS_CACHE_KEY = 'crisis_resources_v1';

const storage = createMMKV({ id: 'crisis-cache' });

/** Write crisis data to MMKV. Safe to call multiple times — only writes once per install. */
export function seedCrisisCache(): void {
  // Always refresh the cache so updates ship with new app builds.
  try {
    storage.set(CRISIS_CACHE_KEY, JSON.stringify(CRISIS_RESOURCES));
  } catch (e) {
    console.warn('crisisCache: failed to seed crisis resources', e);
  }
}

export type CrisisResource = (typeof CRISIS_RESOURCES)[number];

/**
 * Returns crisis resources. Prefers the bundled constant (always available
 * offline) but also reads from MMKV as a belt-and-suspenders fallback in
 * case the import tree is somehow unavailable (e.g. code-push partial update).
 */
export function getCachedCrisisResources(): CrisisResource[] {
  // The bundled constant is always the primary source — it's in the JS bundle.
  if (CRISIS_RESOURCES.length > 0) return CRISIS_RESOURCES;

  // Fallback: read from MMKV cache seeded on last successful launch.
  try {
    const raw = storage.getString(CRISIS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CrisisResource[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('crisisCache: failed to read cached crisis resources', e);
  }

  // Last resort: return an empty array — caller should handle gracefully.
  return [];
}
