// ============================================================================
// Footer Aggregation Feature
// ============================================================================

import { signal, WritableSignal, computed, Signal } from '@angular/core';
import { ColumnConfig } from '../table.types';

// ============================================================================
// Types
// ============================================================================

export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'custom';

export interface ColumnAggregation {
  /** Column key to aggregate */
  columnKey: string;
  /** Type of aggregation */
  type: AggregationType;
  /** Custom label (optional, defaults to "Total {columnTitle}") */
  label?: string;
  /** Format function for the value (optional) */
  format?: (value: number) => string;
  /** Custom value for 'custom' aggregation type (counts rows matching this value) */
  customValue?: string | number | boolean;
}

export interface FooterAggregationState {
  /** Aggregations configuration */
  aggregations: WritableSignal<ColumnAggregation[]>;
  /** Whether to use only selected rows for aggregation */
  useSelectedOnly: WritableSignal<boolean>;
}

export interface AggregationResult {
  columnKey: string;
  type: AggregationType;
  label: string;
  value: number;
  formattedValue: string;
  customValue?: string | number | boolean;
}

// ============================================================================
// State Factory
// ============================================================================

export function createFooterAggregationState(): FooterAggregationState {
  return {
    aggregations: signal<ColumnAggregation[]>([]),
    useSelectedOnly: signal<boolean>(true), // Default: aggregate selected rows
  };
}

// ============================================================================
// Aggregation Configuration
// ============================================================================

/**
 * Adds an aggregation for a column (supports multiple types per column)
 */
export function addAggregation(
  state: FooterAggregationState,
  aggregation: ColumnAggregation
): void {
  state.aggregations.update(aggs => {
    // For custom type, check if same column+type+customValue exists
    if (aggregation.type === 'custom') {
      const exists = aggs.some(
        a => a.columnKey === aggregation.columnKey && 
             a.type === aggregation.type && 
             a.customValue === aggregation.customValue
      );
      if (exists) return aggs;
      return [...aggs, aggregation];
    }
    // Check if this exact column+type combination already exists
    const exists = aggs.some(
      a => a.columnKey === aggregation.columnKey && a.type === aggregation.type
    );
    if (exists) return aggs;
    return [...aggs, aggregation];
  });
}

/**
 * Removes a specific aggregation (by column and type)
 */
export function removeAggregation(
  state: FooterAggregationState,
  columnKey: string,
  type?: AggregationType
): void {
  state.aggregations.update(aggs => {
    if (type) {
      // Remove specific type for this column
      return aggs.filter(a => !(a.columnKey === columnKey && a.type === type));
    } else {
      // Remove all aggregations for this column
      return aggs.filter(a => a.columnKey !== columnKey);
    }
  });
}

/**
 * Toggles a specific aggregation type for a column
 */
export function toggleAggregation(
  state: FooterAggregationState,
  columnKey: string,
  type: AggregationType = 'sum',
  label?: string,
  format?: (value: number) => string
): void {
  const existing = state.aggregations().find(
    a => a.columnKey === columnKey && a.type === type
  );
  if (existing) {
    removeAggregation(state, columnKey, type);
  } else {
    addAggregation(state, { columnKey, type, label, format });
  }
}

/**
 * Checks if a column has any aggregation enabled
 */
export function hasAggregation(
  state: FooterAggregationState,
  columnKey: string,
  type?: AggregationType
): boolean {
  if (type) {
    return state.aggregations().some(a => a.columnKey === columnKey && a.type === type);
  }
  return state.aggregations().some(a => a.columnKey === columnKey);
}

/**
 * Gets all aggregation configs for a column
 */
export function getAggregation(
  state: FooterAggregationState,
  columnKey: string
): ColumnAggregation[] {
  return state.aggregations().filter(a => a.columnKey === columnKey);
}

/**
 * Gets aggregation types enabled for a column
 */
export function getAggregationTypes(
  state: FooterAggregationState,
  columnKey: string
): AggregationType[] {
  return state.aggregations()
    .filter(a => a.columnKey === columnKey)
    .map(a => a.type);
}

/**
 * Clears all aggregations
 */
export function clearAllAggregations(state: FooterAggregationState): void {
  state.aggregations.set([]);
}

/**
 * Sets whether to use only selected rows
 */
export function setUseSelectedOnly(
  state: FooterAggregationState,
  useSelectedOnly: boolean
): void {
  state.useSelectedOnly.set(useSelectedOnly);
}

// ============================================================================
// Aggregation Calculations
// ============================================================================

/**
 * Gets a value from a row, supporting both regular and computed columns
 */
function getRowValue<T>(
  row: T,
  columnKey: string,
  valueGetter?: (row: T, columnKey: string) => any
): any {
  if (valueGetter) {
    return valueGetter(row, columnKey);
  }
  return (row as any)[columnKey];
}

/**
 * Calculates aggregation value for a column
 */
export function calculateAggregation<T>(
  data: T[],
  columnKey: string,
  type: AggregationType,
  customValue?: string | number | boolean,
  valueGetter?: (row: T, columnKey: string) => any
): number {
  if (data.length === 0) return 0;

  // For custom, count rows where value matches the customValue exactly
  if (type === 'custom' && customValue !== undefined) {
    return data.filter(row => {
      const val = getRowValue(row, columnKey, valueGetter);
      // Handle type conversion for comparison
      if (typeof customValue === 'number') {
        return Number(val) === customValue;
      }
      if (typeof customValue === 'boolean') {
        return val === customValue || val === String(customValue);
      }
      // String comparison (case-insensitive)
      return String(val).toLowerCase() === String(customValue).toLowerCase();
    }).length;
  }

  // For count, count all non-null/non-undefined values (any type: string, boolean, number, etc.)
  if (type === 'count') {
    return data.filter(row => {
      const val = getRowValue(row, columnKey, valueGetter);
      return val !== null && val !== undefined && val !== '';
    }).length;
  }

  // For other aggregations, only use numeric values
  const values = data
    .map(row => {
      const val = getRowValue(row, columnKey, valueGetter);
      return typeof val === 'number' ? val : parseFloat(val);
    })
    .filter(v => !isNaN(v));

  if (values.length === 0) return 0;

  switch (type) {
    case 'sum':
      return values.reduce((acc, val) => acc + val, 0);
    case 'avg':
      return values.reduce((acc, val) => acc + val, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return 0;
  }
}

/**
 * Formats aggregation value with default formatting
 */
export function formatAggregationValue(
  value: number,
  type: AggregationType,
  customFormat?: (value: number) => string
): string {
  if (customFormat) {
    return customFormat(value);
  }

  switch (type) {
    case 'avg':
      return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'count':
    case 'custom':
      return value.toString();
    default:
      return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
}

/**
 * Gets the default label for an aggregation type
 */
export function getAggregationLabel(
  type: AggregationType,
  columnTitle: string,
  customLabel?: string,
  customValue?: string | number | boolean
): string {
  if (customLabel) return customLabel;

  switch (type) {
    case 'sum':
      return `Total ${columnTitle}`;
    case 'avg':
      return `Avg ${columnTitle}`;
    case 'min':
      return `Min ${columnTitle}`;
    case 'max':
      return `Max ${columnTitle}`;
    case 'count':
      return `Count ${columnTitle}`;
    case 'custom':
      return `Total Match of "${customValue}" in ${columnTitle}`;
    default:
      return columnTitle;
  }
}

/**
 * Computes all aggregation results
 */
export function computeAggregationResults<T>(
  data: T[],
  selectedData: T[],
  columns: ColumnConfig<T>[],
  state: FooterAggregationState,
  valueGetter?: (row: T, columnKey: string) => any
): AggregationResult[] {
  const aggregations = state.aggregations();
  const useSelectedOnly = state.useSelectedOnly();
  
  // Use selected data if enabled and there are selections, otherwise use all data
  const dataToAggregate = useSelectedOnly && selectedData.length > 0 ? selectedData : data;
  
  return aggregations.map(agg => {
    const column = columns.find(c => c.key === agg.columnKey);
    const columnTitle = column?.title || agg.columnKey;
    
    const value = calculateAggregation(dataToAggregate, agg.columnKey, agg.type, agg.customValue, valueGetter);
    const formattedValue = formatAggregationValue(value, agg.type, agg.format);
    const label = getAggregationLabel(agg.type, columnTitle, agg.label, agg.customValue);
    
    return {
      columnKey: agg.columnKey,
      type: agg.type,
      label,
      value,
      formattedValue,
      customValue: agg.customValue,
    };
  });
}

// ============================================================================
// Aggregation Type Labels
// ============================================================================

export const AGGREGATION_TYPES: { value: AggregationType; label: string }[] = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
  { value: 'count', label: 'Count' },
  { value: 'custom', label: 'Custom' },
];
