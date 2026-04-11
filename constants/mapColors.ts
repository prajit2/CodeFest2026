import { ResourceCategory } from './types';

export const MARKER_COLORS: Record<ResourceCategory, string> = {
  food_bank: '#4CAF50',       // Green
  shelter: '#2196F3',         // Blue
  clinic: '#9C27B0',          // Purple
  mental_health: '#9C27B0',   // Purple
  septa: '#FF9800',           // Amber
  support_group: '#009688',   // Teal
  campus_resource: '#FFC107', // Gold
};

export const MARKER_LABELS: Record<ResourceCategory, string> = {
  food_bank: 'Food Banks',
  shelter: 'Shelters',
  clinic: 'Health Clinics',
  mental_health: 'Mental Health',
  septa: 'SEPTA Stops',
  support_group: 'Support Groups',
  campus_resource: 'Campus Resources',
};

export const CRIME_OVERLAY_COLOR = 'rgba(244, 67, 54, 0.35)'; // Red, semi-transparent
