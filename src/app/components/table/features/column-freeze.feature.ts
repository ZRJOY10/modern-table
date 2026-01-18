// ============================================================================
// Column Freeze Feature - Dynamic freeze/unfreeze columns
// ============================================================================

import { signal, WritableSignal } from '@angular/core';

// ============================================================================
// Types
// ============================================================================

export interface ColumnFreezeState {
  /** Map of column key to frozen position (null = not frozen, 'left' = frozen left, 'right' = frozen right) */
  frozenColumns: WritableSignal<Map<string, 'left' | 'right' | null>>;
}

export interface FreezeChangeEvent {
  columnKey: string;
  frozen: boolean;
  position: 'left' | 'right' | null;
}

// ============================================================================
// State Factory
// ============================================================================

export function createColumnFreezeState(): ColumnFreezeState {
  return {
    frozenColumns: signal(new Map<string, 'left' | 'right' | null>()),
  };
}

// ============================================================================
// Freeze Actions
// ============================================================================

/**
 * Freeze a column to the left side
 */
export function freezeColumnLeft(
  state: ColumnFreezeState,
  columnKey: string
): void {
  state.frozenColumns.update((map) => {
    const newMap = new Map(map);
    newMap.set(columnKey, 'left');
    return newMap;
  });
}

/**
 * Freeze a column to the right side
 */
export function freezeColumnRight(
  state: ColumnFreezeState,
  columnKey: string
): void {
  state.frozenColumns.update((map) => {
    const newMap = new Map(map);
    newMap.set(columnKey, 'right');
    return newMap;
  });
}

/**
 * Unfreeze a column (mark it as explicitly unfrozen)
 */
export function unfreezeColumn(
  state: ColumnFreezeState,
  columnKey: string
): void {
  state.frozenColumns.update((map) => {
    const newMap = new Map(map);
    // Set to null to indicate "explicitly unfrozen" (different from "no override")
    newMap.set(columnKey, null);
    return newMap;
  });
}

/**
 * Toggle freeze state for a column
 * If clicking the same position that's already active, unfreeze
 * If clicking a different position, switch to that position
 */
export function toggleColumnFreeze(
  state: ColumnFreezeState,
  columnKey: string,
  position: 'left' | 'right' = 'left'
): void {
  const currentPosition = getColumnFreezePosition(state, columnKey);
  
  if (currentPosition === position) {
    // Same position clicked - unfreeze
    unfreezeColumn(state, columnKey);
  } else {
    // Different position or not frozen - freeze to the new position
    if (position === 'right') {
      freezeColumnRight(state, columnKey);
    } else {
      freezeColumnLeft(state, columnKey);
    }
  }
}

/**
 * Get the freeze position of a column
 */
export function getColumnFreezePosition(
  state: ColumnFreezeState,
  columnKey: string
): 'left' | 'right' | null {
  return state.frozenColumns().get(columnKey) || null;
}

/**
 * Check if a column is frozen
 */
export function isColumnFrozen(
  state: ColumnFreezeState,
  columnKey: string
): boolean {
  return state.frozenColumns().has(columnKey);
}

/**
 * Clear all frozen columns
 */
export function clearAllFrozenColumns(state: ColumnFreezeState): void {
  state.frozenColumns.set(new Map());
}

/**
 * Apply dynamic freeze state to columns
 * This merges the initial column frozen config with the dynamic state
 */
export function applyDynamicFreeze<T extends { key: string; frozen?: boolean; frozenPosition?: 'left' | 'right' }>(
  columns: T[],
  state: ColumnFreezeState
): T[] {
  const frozenMap = state.frozenColumns();
  
  return columns.map((col) => {
    const dynamicPosition = frozenMap.get(col.key);
    
    // If there's a dynamic freeze state, use it
    if (dynamicPosition !== undefined) {
      if (dynamicPosition === null) {
        // Explicitly unfrozen
        return { ...col, frozen: false, frozenPosition: undefined };
      }
      // Frozen to a specific position
      return { ...col, frozen: true, frozenPosition: dynamicPosition };
    }
    
    // Otherwise, keep the original column config
    return col;
  });
}
