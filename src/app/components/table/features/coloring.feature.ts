// ============================================================================
// Row & Column Coloring Feature
// ============================================================================

import { signal, WritableSignal } from '@angular/core';

// ============================================================================
// Types
// ============================================================================

export interface ColorOption {
  name: string;
  value: string;
  textColor: string;
}

export interface ColoringState {
  /** Map of row key to background color */
  rowColors: WritableSignal<Map<any, string>>;
  /** Map of column key to background color */
  columnColors: WritableSignal<Map<string, string>>;
  /** Map of cell key (rowKey:columnKey) to background color */
  cellColors: WritableSignal<Map<string, string>>;
  /** Currently open color picker context */
  activeColorPicker: WritableSignal<ColorPickerContext | null>;
}

export interface ColorPickerContext {
  type: 'row' | 'column' | 'cell';
  rowKey?: any;
  columnKey?: string;
  position: { x: number; y: number };
}

// ============================================================================
// Predefined Color Palette
// ============================================================================

export const COLOR_PALETTE: ColorOption[] = [
  { name: 'None', value: '', textColor: '' },
  { name: 'Red', value: '#fee2e2', textColor: '#991b1b' },
  { name: 'Orange', value: '#ffedd5', textColor: '#9a3412' },
  { name: 'Amber', value: '#fef3c7', textColor: '#92400e' },
  { name: 'Yellow', value: '#fef9c3', textColor: '#854d0e' },
  { name: 'Lime', value: '#ecfccb', textColor: '#3f6212' },
  { name: 'Green', value: '#dcfce7', textColor: '#166534' },
  { name: 'Emerald', value: '#d1fae5', textColor: '#065f46' },
  { name: 'Teal', value: '#ccfbf1', textColor: '#115e59' },
  { name: 'Cyan', value: '#cffafe', textColor: '#155e75' },
  { name: 'Sky', value: '#e0f2fe', textColor: '#075985' },
  { name: 'Blue', value: '#dbeafe', textColor: '#1e40af' },
  { name: 'Indigo', value: '#e0e7ff', textColor: '#3730a3' },
  { name: 'Violet', value: '#ede9fe', textColor: '#5b21b6' },
  { name: 'Purple', value: '#f3e8ff', textColor: '#6b21a8' },
  { name: 'Fuchsia', value: '#fae8ff', textColor: '#86198f' },
  { name: 'Pink', value: '#fce7f3', textColor: '#9d174d' },
  { name: 'Rose', value: '#ffe4e6', textColor: '#9f1239' },
  { name: 'Gray', value: '#f3f4f6', textColor: '#374151' },
];

// ============================================================================
// State Factory
// ============================================================================

export function createColoringState(): ColoringState {
  return {
    rowColors: signal(new Map<any, string>()),
    columnColors: signal(new Map<string, string>()),
    cellColors: signal(new Map<string, string>()),
    activeColorPicker: signal<ColorPickerContext | null>(null),
  };
}

// ============================================================================
// Color Picker Actions
// ============================================================================

export function openColorPicker(
  state: ColoringState,
  context: ColorPickerContext
): void {
  state.activeColorPicker.set(context);
}

export function closeColorPicker(state: ColoringState): void {
  state.activeColorPicker.set(null);
}

// ============================================================================
// Row Coloring
// ============================================================================

export function setRowColor(
  state: ColoringState,
  rowKey: any,
  color: string
): void {
  state.rowColors.update((map) => {
    const newMap = new Map(map);
    if (color) {
      newMap.set(rowKey, color);
    } else {
      newMap.delete(rowKey);
    }
    return newMap;
  });
  closeColorPicker(state);
}

export function getRowColor(state: ColoringState, rowKey: any): string {
  return state.rowColors().get(rowKey) || '';
}

export function clearRowColor(state: ColoringState, rowKey: any): void {
  setRowColor(state, rowKey, '');
}

export function clearAllRowColors(state: ColoringState): void {
  state.rowColors.set(new Map());
}

// ============================================================================
// Column Coloring
// ============================================================================

export function setColumnColor(
  state: ColoringState,
  columnKey: string,
  color: string
): void {
  state.columnColors.update((map) => {
    const newMap = new Map(map);
    if (color) {
      newMap.set(columnKey, color);
    } else {
      newMap.delete(columnKey);
    }
    return newMap;
  });
  closeColorPicker(state);
}

export function getColumnColor(state: ColoringState, columnKey: string): string {
  return state.columnColors().get(columnKey) || '';
}

export function clearColumnColor(state: ColoringState, columnKey: string): void {
  setColumnColor(state, columnKey, '');
}

export function clearAllColumnColors(state: ColoringState): void {
  state.columnColors.set(new Map());
}

// ============================================================================
// Cell Coloring (specific cell)
// ============================================================================

export function getCellKey(rowKey: any, columnKey: string): string {
  return `${rowKey}:${columnKey}`;
}

export function setCellColor(
  state: ColoringState,
  rowKey: any,
  columnKey: string,
  color: string
): void {
  const key = getCellKey(rowKey, columnKey);
  state.cellColors.update((map) => {
    const newMap = new Map(map);
    if (color) {
      newMap.set(key, color);
    } else {
      newMap.delete(key);
    }
    return newMap;
  });
  closeColorPicker(state);
}

export function getCellColor(
  state: ColoringState,
  rowKey: any,
  columnKey: string
): string {
  const key = getCellKey(rowKey, columnKey);
  return state.cellColors().get(key) || '';
}

export function clearCellColor(
  state: ColoringState,
  rowKey: any,
  columnKey: string
): void {
  setCellColor(state, rowKey, columnKey, '');
}

export function clearAllCellColors(state: ColoringState): void {
  state.cellColors.set(new Map());
}

// ============================================================================
// Combined Color Resolution (Cell > Row > Column priority)
// ============================================================================

export function getResolvedCellColor(
  state: ColoringState,
  rowKey: any,
  columnKey: string
): string {
  // Priority: Cell color > Row color > Column color
  const cellColor = getCellColor(state, rowKey, columnKey);
  if (cellColor) return cellColor;

  const rowColor = getRowColor(state, rowKey);
  if (rowColor) return rowColor;

  const columnColor = getColumnColor(state, columnKey);
  if (columnColor) return columnColor;

  return '';
}

export function getTextColorForBackground(backgroundColor: string): string {
  const colorOption = COLOR_PALETTE.find((c) => c.value === backgroundColor);
  return colorOption?.textColor || '';
}

// ============================================================================
// Clear All Colors
// ============================================================================

export function clearAllColors(state: ColoringState): void {
  clearAllRowColors(state);
  clearAllColumnColors(state);
  clearAllCellColors(state);
}
