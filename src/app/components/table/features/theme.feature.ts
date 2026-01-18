// ============================================================================
// Table Theme Feature
// ============================================================================

import { signal, WritableSignal, computed, Signal } from '@angular/core';

// ============================================================================
// Types
// ============================================================================

export type ThemeId = 
  | 'default'
  | 'modern-blue'
  | 'dark'
  | 'midnight'
  | 'forest'
  | 'ocean'
  | 'sunset'
  | 'lavender'
  | 'minimal'
  | 'corporate';

export interface TableTheme {
  id: ThemeId;
  name: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
  };
  colors: ThemeColors;
}

export interface ThemeColors {
  // Header
  headerBg: string;
  headerText: string;
  headerBorder: string;
  
  // Body
  rowBg: string;
  rowAltBg: string;
  rowHoverBg: string;
  rowSelectedBg: string;
  rowText: string;
  cellBorder: string;
  
  // Table container
  tableBg: string;
  tableBorder: string;
  tableRadius: string;
  tableShadow: string;
  
  // Toolbar
  toolbarBg: string;
  toolbarBorder: string;
  
  // Footer/Pagination
  footerBg: string;
  footerText: string;
  footerBorder: string;
  
  // Accents
  primaryColor: string;
  primaryHover: string;
  accentColor: string;
}

export interface ThemeState {
  currentTheme: WritableSignal<ThemeId>;
  dropdownOpen: WritableSignal<boolean>;
}

// ============================================================================
// Theme Definitions
// ============================================================================

export const TABLE_THEMES: TableTheme[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Clean and professional light theme',
    preview: { primary: '#3B82F6', secondary: '#F3F4F6', accent: '#10B981' },
    colors: {
      headerBg: '#F9FAFB',
      headerText: '#374151',
      headerBorder: '#E5E7EB',
      rowBg: '#FFFFFF',
      rowAltBg: '#F9FAFB',
      rowHoverBg: '#EFF6FF',
      rowSelectedBg: '#DBEAFE',
      rowText: '#374151',
      cellBorder: '#E5E7EB',
      tableBg: '#FFFFFF',
      tableBorder: '#E5E7EB',
      tableRadius: '0.75rem',
      tableShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      toolbarBg: '#F9FAFB',
      toolbarBorder: '#E5E7EB',
      footerBg: '#FFFFFF',
      footerText: '#6B7280',
      footerBorder: '#E5E7EB',
      primaryColor: '#3B82F6',
      primaryHover: '#2563EB',
      accentColor: '#10B981',
    },
  },
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Sleek blue gradient header',
    preview: { primary: '#2563EB', secondary: '#DBEAFE', accent: '#3B82F6' },
    colors: {
      headerBg: 'linear-gradient(to right, #2563EB, #1D4ED8)',
      headerText: '#FFFFFF',
      headerBorder: '#1D4ED8',
      rowBg: '#FFFFFF',
      rowAltBg: '#EFF6FF',
      rowHoverBg: '#DBEAFE',
      rowSelectedBg: '#BFDBFE',
      rowText: '#1F2937',
      cellBorder: '#DBEAFE',
      tableBg: '#FFFFFF',
      tableBorder: '#BFDBFE',
      tableRadius: '1rem',
      tableShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.1)',
      toolbarBg: 'linear-gradient(to right, #EFF6FF, #E0E7FF)',
      toolbarBorder: '#BFDBFE',
      footerBg: '#EFF6FF',
      footerText: '#1D4ED8',
      footerBorder: '#BFDBFE',
      primaryColor: '#2563EB',
      primaryHover: '#1D4ED8',
      accentColor: '#10B981',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Easy on the eyes dark theme',
    preview: { primary: '#6366F1', secondary: '#1F2937', accent: '#818CF8' },
    colors: {
      headerBg: '#1F2937',
      headerText: '#F3F4F6',
      headerBorder: '#374151',
      rowBg: '#111827',
      rowAltBg: '#1F2937',
      rowHoverBg: '#374151',
      rowSelectedBg: '#312E81',
      rowText: '#D1D5DB',
      cellBorder: '#374151',
      tableBg: '#111827',
      tableBorder: '#374151',
      tableRadius: '0.75rem',
      tableShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      toolbarBg: '#1F2937',
      toolbarBorder: '#374151',
      footerBg: '#1F2937',
      footerText: '#9CA3AF',
      footerBorder: '#374151',
      primaryColor: '#6366F1',
      primaryHover: '#4F46E5',
      accentColor: '#34D399',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep purple dark theme',
    preview: { primary: '#7C3AED', secondary: '#1E1B4B', accent: '#A78BFA' },
    colors: {
      headerBg: 'linear-gradient(to right, #5B21B6, #7C3AED)',
      headerText: '#EDE9FE',
      headerBorder: '#5B21B6',
      rowBg: '#0F172A',
      rowAltBg: '#1E1B4B',
      rowHoverBg: '#312E81',
      rowSelectedBg: '#4C1D95',
      rowText: '#E2E8F0',
      cellBorder: '#312E81',
      tableBg: '#0F172A',
      tableBorder: '#5B21B6',
      tableRadius: '1rem',
      tableShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.2)',
      toolbarBg: '#1E293B',
      toolbarBorder: '#5B21B6',
      footerBg: '#1E293B',
      footerText: '#A78BFA',
      footerBorder: '#5B21B6',
      primaryColor: '#7C3AED',
      primaryHover: '#6D28D9',
      accentColor: '#34D399',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Nature-inspired green theme',
    preview: { primary: '#059669', secondary: '#ECFDF5', accent: '#10B981' },
    colors: {
      headerBg: 'linear-gradient(to right, #059669, #10B981)',
      headerText: '#FFFFFF',
      headerBorder: '#047857',
      rowBg: '#FFFFFF',
      rowAltBg: '#ECFDF5',
      rowHoverBg: '#D1FAE5',
      rowSelectedBg: '#A7F3D0',
      rowText: '#1F2937',
      cellBorder: '#D1FAE5',
      tableBg: '#FFFFFF',
      tableBorder: '#A7F3D0',
      tableRadius: '0.75rem',
      tableShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.1)',
      toolbarBg: 'linear-gradient(to right, #ECFDF5, #D1FAE5)',
      toolbarBorder: '#A7F3D0',
      footerBg: '#ECFDF5',
      footerText: '#047857',
      footerBorder: '#A7F3D0',
      primaryColor: '#059669',
      primaryHover: '#047857',
      accentColor: '#F59E0B',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calm teal and cyan colors',
    preview: { primary: '#0891B2', secondary: '#ECFEFF', accent: '#06B6D4' },
    colors: {
      headerBg: 'linear-gradient(to right, #0891B2, #0D9488)',
      headerText: '#FFFFFF',
      headerBorder: '#0E7490',
      rowBg: '#FFFFFF',
      rowAltBg: '#ECFEFF',
      rowHoverBg: '#CFFAFE',
      rowSelectedBg: '#A5F3FC',
      rowText: '#1F2937',
      cellBorder: '#CFFAFE',
      tableBg: '#FFFFFF',
      tableBorder: '#A5F3FC',
      tableRadius: '0.75rem',
      tableShadow: '0 20px 25px -5px rgba(6, 182, 212, 0.1)',
      toolbarBg: 'linear-gradient(to right, #ECFEFF, #CCFBF1)',
      toolbarBorder: '#A5F3FC',
      footerBg: '#ECFEFF',
      footerText: '#0E7490',
      footerBorder: '#A5F3FC',
      primaryColor: '#0891B2',
      primaryHover: '#0E7490',
      accentColor: '#10B981',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and red tones',
    preview: { primary: '#EA580C', secondary: '#FFF7ED', accent: '#F97316' },
    colors: {
      headerBg: 'linear-gradient(to right, #EA580C, #DC2626)',
      headerText: '#FFFFFF',
      headerBorder: '#C2410C',
      rowBg: '#FFFFFF',
      rowAltBg: '#FFF7ED',
      rowHoverBg: '#FFEDD5',
      rowSelectedBg: '#FED7AA',
      rowText: '#1F2937',
      cellBorder: '#FFEDD5',
      tableBg: '#FFFFFF',
      tableBorder: '#FED7AA',
      tableRadius: '0.75rem',
      tableShadow: '0 20px 25px -5px rgba(249, 115, 22, 0.1)',
      toolbarBg: 'linear-gradient(to right, #FFF7ED, #FEF2F2)',
      toolbarBorder: '#FED7AA',
      footerBg: '#FFF7ED',
      footerText: '#C2410C',
      footerBorder: '#FED7AA',
      primaryColor: '#EA580C',
      primaryHover: '#C2410C',
      accentColor: '#10B981',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Soft purple pastel theme',
    preview: { primary: '#9333EA', secondary: '#FAF5FF', accent: '#A855F7' },
    colors: {
      headerBg: 'linear-gradient(to right, #9333EA, #DB2777)',
      headerText: '#FFFFFF',
      headerBorder: '#7E22CE',
      rowBg: '#FFFFFF',
      rowAltBg: '#FAF5FF',
      rowHoverBg: '#F3E8FF',
      rowSelectedBg: '#E9D5FF',
      rowText: '#1F2937',
      cellBorder: '#F3E8FF',
      tableBg: '#FFFFFF',
      tableBorder: '#E9D5FF',
      tableRadius: '1rem',
      tableShadow: '0 20px 25px -5px rgba(147, 51, 234, 0.1)',
      toolbarBg: 'linear-gradient(to right, #FAF5FF, #FCE7F3)',
      toolbarBorder: '#E9D5FF',
      footerBg: '#FAF5FF',
      footerText: '#7E22CE',
      footerBorder: '#E9D5FF',
      primaryColor: '#9333EA',
      primaryHover: '#7E22CE',
      accentColor: '#10B981',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean borderless design',
    preview: { primary: '#374151', secondary: '#FFFFFF', accent: '#6B7280' },
    colors: {
      headerBg: '#FFFFFF',
      headerText: '#111827',
      headerBorder: 'transparent',
      rowBg: '#FFFFFF',
      rowAltBg: '#FFFFFF',
      rowHoverBg: '#F9FAFB',
      rowSelectedBg: '#F3F4F6',
      rowText: '#374151',
      cellBorder: '#F3F4F6',
      tableBg: '#FFFFFF',
      tableBorder: 'transparent',
      tableRadius: '0',
      tableShadow: 'none',
      toolbarBg: '#FFFFFF',
      toolbarBorder: '#F3F4F6',
      footerBg: '#FFFFFF',
      footerText: '#6B7280',
      footerBorder: '#F3F4F6',
      primaryColor: '#374151',
      primaryHover: '#1F2937',
      accentColor: '#10B981',
    },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional business style',
    preview: { primary: '#1E3A5F', secondary: '#F8FAFC', accent: '#2563EB' },
    colors: {
      headerBg: '#1E293B',
      headerText: '#FFFFFF',
      headerBorder: '#334155',
      rowBg: '#FFFFFF',
      rowAltBg: '#F8FAFC',
      rowHoverBg: '#EFF6FF',
      rowSelectedBg: '#DBEAFE',
      rowText: '#334155',
      cellBorder: '#E2E8F0',
      tableBg: '#FFFFFF',
      tableBorder: '#CBD5E1',
      tableRadius: '0.5rem',
      tableShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      toolbarBg: '#F1F5F9',
      toolbarBorder: '#CBD5E1',
      footerBg: '#F8FAFC',
      footerText: '#475569',
      footerBorder: '#CBD5E1',
      primaryColor: '#1D4ED8',
      primaryHover: '#1E40AF',
      accentColor: '#10B981',
    },
  },
];

// ============================================================================
// State Factory
// ============================================================================

export function createThemeState(): ThemeState {
  return {
    currentTheme: signal<ThemeId>('default'),
    dropdownOpen: signal<boolean>(false),
  };
}

// ============================================================================
// Theme Functions
// ============================================================================

/**
 * Gets the current theme configuration
 */
export function getCurrentTheme(state: ThemeState): TableTheme {
  const themeId = state.currentTheme();
  return TABLE_THEMES.find(t => t.id === themeId) || TABLE_THEMES[0];
}

/**
 * Gets theme colors for the current theme
 */
export function getThemeColors(state: ThemeState): ThemeColors {
  return getCurrentTheme(state).colors;
}

/**
 * Sets the current theme
 */
export function setTheme(state: ThemeState, themeId: ThemeId): void {
  state.currentTheme.set(themeId);
  // Save to localStorage for persistence
  try {
    localStorage.setItem('table-theme', themeId);
  } catch (e) {
    // localStorage not available
  }
}

/**
 * Loads theme from localStorage
 */
export function loadSavedTheme(state: ThemeState): void {
  try {
    const saved = localStorage.getItem('table-theme') as ThemeId | null;
    if (saved && TABLE_THEMES.some(t => t.id === saved)) {
      state.currentTheme.set(saved);
    }
  } catch (e) {
    // localStorage not available
  }
}

/**
 * Toggles theme dropdown
 */
export function toggleThemeDropdown(state: ThemeState): void {
  state.dropdownOpen.update(v => !v);
}

/**
 * Closes theme dropdown
 */
export function closeThemeDropdown(state: ThemeState): void {
  state.dropdownOpen.set(false);
}

/**
 * Gets all available themes
 */
export function getAllThemes(): TableTheme[] {
  return TABLE_THEMES;
}

/**
 * Gets a theme by ID
 */
export function getThemeById(themeId: ThemeId): TableTheme | undefined {
  return TABLE_THEMES.find(t => t.id === themeId);
}

/**
 * Generates CSS custom properties for a theme
 */
export function getThemeCssVariables(theme: TableTheme): Record<string, string> {
  const colors = theme.colors;
  return {
    '--table-header-bg': colors.headerBg,
    '--table-header-text': colors.headerText,
    '--table-header-border': colors.headerBorder,
    '--table-row-bg': colors.rowBg,
    '--table-row-alt-bg': colors.rowAltBg,
    '--table-row-hover-bg': colors.rowHoverBg,
    '--table-row-selected-bg': colors.rowSelectedBg,
    '--table-row-text': colors.rowText,
    '--table-cell-border': colors.cellBorder,
    '--table-bg': colors.tableBg,
    '--table-border': colors.tableBorder,
    '--table-radius': colors.tableRadius,
    '--table-shadow': colors.tableShadow,
    '--table-toolbar-bg': colors.toolbarBg,
    '--table-toolbar-border': colors.toolbarBorder,
    '--table-footer-bg': colors.footerBg,
    '--table-footer-text': colors.footerText,
    '--table-footer-border': colors.footerBorder,
    '--table-primary': colors.primaryColor,
    '--table-primary-hover': colors.primaryHover,
    '--table-accent': colors.accentColor,
  };
}
