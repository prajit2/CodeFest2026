import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { UserPreferences, University } from '@/constants/types';

const storage = new MMKV({ id: 'user-preferences' });

function loadPrefs(): UserPreferences {
  const raw = storage.getString('prefs');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fall through to defaults
    }
  }
  return {
    isStudent: false,
    substanceSupport: false,
    mentalHealthSupport: false,
    hasCompletedOnboarding: false,
  };
}

interface UserStore extends UserPreferences {
  setIsStudent: (val: boolean) => void;
  setUniversity: (val: University) => void;
  setSubstanceSupport: (val: boolean) => void;
  setMentalHealthSupport: (val: boolean) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  ...loadPrefs(),

  setIsStudent: (val) => {
    set({ isStudent: val });
    storage.set('prefs', JSON.stringify(get()));
  },
  setUniversity: (val) => {
    set({ university: val });
    storage.set('prefs', JSON.stringify(get()));
  },
  setSubstanceSupport: (val) => {
    set({ substanceSupport: val });
    storage.set('prefs', JSON.stringify(get()));
  },
  setMentalHealthSupport: (val) => {
    set({ mentalHealthSupport: val });
    storage.set('prefs', JSON.stringify(get()));
  },
  completeOnboarding: () => {
    set({ hasCompletedOnboarding: true });
    storage.set('prefs', JSON.stringify(get()));
  },
  reset: () => {
    const defaults: UserPreferences = {
      isStudent: false,
      substanceSupport: false,
      mentalHealthSupport: false,
      hasCompletedOnboarding: false,
    };
    set(defaults);
    storage.set('prefs', JSON.stringify(defaults));
  },
}));
