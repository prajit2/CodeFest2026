import { create } from 'zustand';
import { ResourceCategory, MapDispatchAction } from '@/constants/types';

interface MapStore {
  // Active layer filters — true = visible
  visibleCategories: Record<ResourceCategory, boolean>;
  crimeOverlayVisible: boolean;

  // Camera
  centerLatitude: number | null;
  centerLongitude: number | null;
  zoom: number;

  // Focused resource (for detail panel)
  focusedResourceId: string | null;

  // Actions
  toggleCategory: (category: ResourceCategory) => void;
  toggleCrimeOverlay: () => void;
  setFocusedResource: (id: string | null) => void;
  showAllCategories: () => void;

  // Chat-to-map bridge — Rocky calls this, map listens to it
  dispatch: (action: MapDispatchAction) => void;
}

const ALL_VISIBLE: Record<ResourceCategory, boolean> = {
  food_bank: true,
  shelter: true,
  clinic: true,
  mental_health: true,
  septa: true,
  support_group: true,
  campus_resource: true,
};

export const useMapStore = create<MapStore>((set) => ({
  visibleCategories: { ...ALL_VISIBLE },
  crimeOverlayVisible: false,
  centerLatitude: null,
  centerLongitude: null,
  zoom: 13,
  focusedResourceId: null,

  toggleCategory: (category) =>
    set((state) => ({
      visibleCategories: {
        ...state.visibleCategories,
        [category]: !state.visibleCategories[category],
      },
    })),

  showAllCategories: () => set({ visibleCategories: { ...ALL_VISIBLE } }),

  toggleCrimeOverlay: () =>
    set((state) => ({ crimeOverlayVisible: !state.crimeOverlayVisible })),

  setFocusedResource: (id) => set({ focusedResourceId: id }),

  // Receiving end of chat-to-map bridge
  dispatch: (action) => {
    switch (action.type) {
      case 'FILTER_CATEGORY':
        if (action.category) {
          // Reset all filters then show only the requested category
          const updated = Object.fromEntries(
            Object.keys(ALL_VISIBLE).map((k) => [k, k === action.category])
          ) as Record<ResourceCategory, boolean>;
          set({ visibleCategories: updated });
        }
        break;

      case 'CENTER_ON_LOCATION':
        set({
          centerLatitude: action.latitude ?? null,
          centerLongitude: action.longitude ?? null,
          zoom: action.zoom ?? 14,
        });
        break;

      case 'SHOW_RESOURCE':
        set({ focusedResourceId: action.resourceId ?? null });
        break;
    }
  },
}));
