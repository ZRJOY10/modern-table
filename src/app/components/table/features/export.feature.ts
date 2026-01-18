// ============================================================================
// Table Export Feature
// ============================================================================

import { ColumnConfig } from '../table.types';
import { AggregationResult } from './footer-aggregation.feature';

// ============================================================================
// Types
// ============================================================================

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'word' | 'print';

export interface ExportColorInfo {
  /** Get the resolved color for a cell (considers cell > row > column priority) */
  getCellColor: (rowKey: any, columnKey: string) => string;
  /** Get the text color for a background color */
  getTextColor: (backgroundColor: string) => string;
  /** Get row key from a row */
  getRowKey: (row: any) => any;
}

export interface ExportOptions {
  /** Export format */
  format: ExportFormat;
  /** Include only selected rows */
  selectedOnly?: boolean;
  /** Include computed columns */
  includeComputed?: boolean;
  /** Custom columns to export (if empty, export all visible) */
  columns?: string[];
  /** File name (without extension) */
  fileName?: string;
  /** Include headers */
  includeHeaders?: boolean;
  /** Sheet name for Excel */
  sheetName?: string;
  /** Color information for styled export */
  colorInfo?: ExportColorInfo;
  /** Aggregation results to include in export */
  aggregationResults?: AggregationResult[];
}

export interface ExportColumn {
  key: string;
  title: string;
  isComputed?: boolean;
}

// ============================================================================
// CSV Export
// ============================================================================

/**
 * Escapes a value for CSV format
 */
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // If the value contains comma, newline, or quote, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts data to CSV format
 */
export function convertToCSV<T>(
  data: T[],
  columns: ExportColumn[],
  getCellValue: (row: T, column: ExportColumn) => any,
  includeHeaders: boolean = true,
  aggregationResults?: AggregationResult[]
): string {
  const lines: string[] = [];
  
  // Add headers
  if (includeHeaders) {
    const headerLine = columns.map(col => escapeCsvValue(col.title)).join(',');
    lines.push(headerLine);
  }
  
  // Add data rows
  for (const row of data) {
    const values = columns.map(col => escapeCsvValue(getCellValue(row, col)));
    lines.push(values.join(','));
  }
  
  // Add aggregation summary
  if (aggregationResults && aggregationResults.length > 0) {
    lines.push(''); // Empty line separator
    lines.push('SUMMARY');
    for (const result of aggregationResults) {
      lines.push(`${escapeCsvValue(result.label)},${escapeCsvValue(result.formattedValue)}`);
    }
  }
  
  return lines.join('\n');
}

/**
 * Downloads a CSV file
 */
export function downloadCSV(csvContent: string, fileName: string): void {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${fileName}.csv`);
}

// ============================================================================
// Excel Export (XLSX)
// ============================================================================

/**
 * Converts data to Excel format and downloads
 * Uses a simple XML-based approach for basic Excel support with coloring
 */
export function downloadExcel<T>(
  data: T[],
  columns: ExportColumn[],
  getCellValue: (row: T, column: ExportColumn) => any,
  fileName: string,
  sheetName: string = 'Sheet1',
  colorInfo?: ExportColorInfo,
  aggregationResults?: AggregationResult[]
): void {
  // Create XML spreadsheet
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
  
  // Collect all unique colors used
  const usedColors = new Set<string>();
  if (colorInfo) {
    for (const row of data) {
      const rowKey = colorInfo.getRowKey(row);
      for (const col of columns) {
        const color = colorInfo.getCellColor(rowKey, col.key);
        if (color) usedColors.add(color);
      }
    }
  }
  
  // Styles
  xml += '  <Styles>\n';
  xml += '    <Style ss:ID="Header">\n';
  xml += '      <Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/>\n';
  xml += '      <Interior ss:Color="#4472C4" ss:Pattern="Solid"/>\n';
  xml += '    </Style>\n';
  xml += '    <Style ss:ID="Data">\n';
  xml += '      <Font ss:Size="11"/>\n';
  xml += '    </Style>\n';
  xml += '    <Style ss:ID="Summary">\n';
  xml += '      <Font ss:Bold="1" ss:Size="12" ss:Color="#1F2937"/>\n';
  xml += '      <Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/>\n';
  xml += '      <Borders>\n';
  xml += '        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#3B82F6"/>\n';
  xml += '      </Borders>\n';
  xml += '    </Style>\n';
  xml += '    <Style ss:ID="SummaryLabel">\n';
  xml += '      <Font ss:Bold="1" ss:Size="11" ss:Color="#374151"/>\n';
  xml += '      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>\n';
  xml += '      <Borders>\n';
  xml += '        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>\n';
  xml += '      </Borders>\n';
  xml += '    </Style>\n';
  xml += '    <Style ss:ID="SummaryValue">\n';
  xml += '      <Font ss:Bold="1" ss:Size="11" ss:Color="#3B82F6"/>\n';
  xml += '      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>\n';
  xml += '      <Borders>\n';
  xml += '        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>\n';
  xml += '      </Borders>\n';
  xml += '    </Style>\n';
  
  // Add style for each color used
  usedColors.forEach(color => {
    const styleId = `Color_${color.replace('#', '')}`;
    const textColor = colorInfo?.getTextColor(color) || '#000000';
    xml += `    <Style ss:ID="${styleId}">\n`;
    xml += `      <Font ss:Size="11" ss:Color="${textColor}"/>\n`;
    xml += `      <Interior ss:Color="${color}" ss:Pattern="Solid"/>\n`;
    xml += '    </Style>\n';
  });
  
  xml += '  </Styles>\n';
  
  xml += `  <Worksheet ss:Name="${escapeXml(sheetName)}">\n`;
  xml += '    <Table>\n';
  
  // Column widths
  for (const col of columns) {
    xml += '      <Column ss:AutoFitWidth="1" ss:Width="120"/>\n';
  }
  
  // Header row
  xml += '      <Row>\n';
  for (const col of columns) {
    xml += `        <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(col.title)}</Data></Cell>\n`;
  }
  xml += '      </Row>\n';
  
  // Data rows
  for (const row of data) {
    xml += '      <Row>\n';
    const rowKey = colorInfo?.getRowKey(row);
    
    for (const col of columns) {
      const value = getCellValue(row, col);
      const type = typeof value === 'number' ? 'Number' : 'String';
      
      // Get cell color
      let styleId = 'Data';
      if (colorInfo && rowKey !== undefined) {
        const cellColor = colorInfo.getCellColor(rowKey, col.key);
        if (cellColor) {
          styleId = `Color_${cellColor.replace('#', '')}`;
        }
      }
      
      xml += `        <Cell ss:StyleID="${styleId}"><Data ss:Type="${type}">${escapeXml(String(value ?? ''))}</Data></Cell>\n`;
    }
    xml += '      </Row>\n';
  }
  
  // Add aggregation summary rows
  if (aggregationResults && aggregationResults.length > 0) {
    // Empty row separator
    xml += '      <Row></Row>\n';
    
    // Summary header
    xml += '      <Row>\n';
    xml += `        <Cell ss:StyleID="Summary" ss:MergeAcross="${columns.length - 1}"><Data ss:Type="String">SUMMARY</Data></Cell>\n`;
    xml += '      </Row>\n';
    
    // Summary rows
    for (const result of aggregationResults) {
      xml += '      <Row>\n';
      xml += `        <Cell ss:StyleID="SummaryLabel"><Data ss:Type="String">${escapeXml(result.label)}</Data></Cell>\n`;
      xml += `        <Cell ss:StyleID="SummaryValue"><Data ss:Type="String">${escapeXml(result.formattedValue)}</Data></Cell>\n`;
      xml += '      </Row>\n';
    }
  }
  
  xml += '    </Table>\n';
  xml += '  </Worksheet>\n';
  xml += '</Workbook>';
  
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, `${fileName}.xls`);
}

// ============================================================================
// PDF Export
// ============================================================================

/**
 * Generates PDF content and downloads
 * Creates a printable HTML that can be saved as PDF with coloring support
 */
export function downloadPDF<T>(
  data: T[],
  columns: ExportColumn[],
  getCellValue: (row: T, column: ExportColumn) => any,
  fileName: string,
  title?: string,
  colorInfo?: ExportColorInfo,
  aggregationResults?: AggregationResult[]
): void {
  const html = generatePrintableHTML(data, columns, getCellValue, title || fileName, colorInfo, aggregationResults);
  
  // Open in new window for PDF save
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

// ============================================================================
// Word Export
// ============================================================================

/**
 * Downloads data as Word document
 * Uses HTML format that Word can open with coloring support
 */
export function downloadWord<T>(
  data: T[],
  columns: ExportColumn[],
  getCellValue: (row: T, column: ExportColumn) => any,
  fileName: string,
  title?: string,
  colorInfo?: ExportColorInfo,
  aggregationResults?: AggregationResult[]
): void {
  console.log('downloadWord called with', { dataLength: data.length, columnsLength: columns.length });
  
  let html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>${escapeHtml(title || fileName)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: Arial, sans-serif; font-size: 11pt; }
    h1 { color: #333; margin-bottom: 20px; font-size: 18pt; }
    h2 { color: #1F2937; margin-top: 30px; margin-bottom: 10px; font-size: 14pt; border-bottom: 2px solid #3B82F6; padding-bottom: 8px; }
    p.meta { color: #666; font-size: 10pt; margin-bottom: 15px; }
    table { border-collapse: collapse; width: 100%; margin-top: 10px; }
    th { background-color: #4472C4; color: white; padding: 8px; text-align: left; border: 1px solid #2F5496; font-weight: bold; }
    td { padding: 6px 8px; border: 1px solid #ddd; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .summary-table { width: auto; margin-top: 10px; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; }
    .summary-table th { background-color: #F9FAFB; color: #1F2937; border: none; border-bottom: 2px solid #3B82F6; }
    .summary-table td { background-color: #FFFFFF; border: none; border-bottom: 1px solid #F3F4F6; }
    .summary-table td:last-child { color: #3B82F6; font-weight: bold; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title || fileName)}</h1>
  <p class="meta">Generated on ${new Date().toLocaleString()} &bull; Total: ${data.length} records</p>
  <table>
    <thead>
      <tr>
`;

  for (const col of columns) {
    html += `        <th>${escapeHtml(col.title)}</th>\n`;
  }

  html += `      </tr>
    </thead>
    <tbody>
`;

  for (const row of data) {
    html += '      <tr>\n';
    const rowKey = colorInfo?.getRowKey(row);
    
    for (const col of columns) {
      const value = getCellValue(row, col);
      
      // Get cell color and text color
      let style = '';
      if (colorInfo && rowKey !== undefined) {
        const cellColor = colorInfo.getCellColor(rowKey, col.key);
        if (cellColor) {
          const textColor = colorInfo.getTextColor(cellColor);
          style = ` style="background-color: ${cellColor};${textColor ? ` color: ${textColor};` : ''}"`;
        }
      }
      
      html += `        <td${style}>${escapeHtml(String(value ?? ''))}</td>\n`;
    }
    html += '      </tr>\n';
  }

  html += `    </tbody>
  </table>`;

  // Add aggregation summary
  if (aggregationResults && aggregationResults.length > 0) {
    html += `
  <h2>Summary</h2>
  <table class="summary-table">
    <thead>
      <tr>
        <th>Aggregation</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
`;
    for (const result of aggregationResults) {
      html += `      <tr>
        <td><strong>${escapeHtml(result.label)}</strong></td>
        <td>${escapeHtml(result.formattedValue)}</td>
      </tr>\n`;
    }
    html += `    </tbody>
  </table>`;
  }

  html += `
  <p class="meta" style="margin-top: 20px;">End of document - ${data.length} total records</p>
</body>
</html>`;

  console.log('Word HTML generated, first 500 chars:', html.substring(0, 500));
  console.log('Word HTML generated, last 500 chars:', html.substring(html.length - 500));
  
  // Add BOM for proper encoding
  const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
  downloadBlob(blob, `${fileName}.doc`);
}

// ============================================================================
// Print View
// ============================================================================

/**
 * Opens a print-friendly view with coloring support
 */
export function openPrintView<T>(
  data: T[],
  columns: ExportColumn[],
  getCellValue: (row: T, column: ExportColumn) => any,
  title?: string,
  colorInfo?: ExportColorInfo,
  aggregationResults?: AggregationResult[]
): void {
  const html = generatePrintableHTML(data, columns, getCellValue, title, colorInfo, aggregationResults);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Generates printable HTML with coloring support
 */
function generatePrintableHTML<T>(
  data: T[],
  columns: ExportColumn[],
  getCellValue: (row: T, column: ExportColumn) => any,
  title?: string,
  colorInfo?: ExportColorInfo,
  aggregationResults?: AggregationResult[]
): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title || 'Table Export')}</title>
  <style>
    @media print {
      @page { margin: 1cm; }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      color: #333;
    }
    h1 { 
      color: #1e40af; 
      margin-bottom: 20px;
      font-size: 24px;
      border-bottom: 2px solid #1e40af;
      padding-bottom: 10px;
    }
    .meta {
      color: #666;
      font-size: 12px;
      margin-bottom: 20px;
    }
    table { 
      border-collapse: collapse; 
      width: 100%; 
      font-size: 12px;
    }
    th { 
      background-color: #1e40af !important; 
      color: white !important; 
      padding: 10px 8px; 
      text-align: left; 
      font-weight: 600;
      border: 1px solid #1e40af;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    td { 
      padding: 8px; 
      border: 1px solid #ddd;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    tr:hover {
      background-color: #e2e8f0;
    }
    .footer {
      margin-top: 20px;
      font-size: 11px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  ${title ? `<h1>${escapeHtml(title)}</h1>` : ''}
  <div class="meta">
    Generated on ${new Date().toLocaleString()} • ${data.length} rows
  </div>
  <table>
    <thead>
      <tr>
`;

  for (const col of columns) {
    html += `        <th>${escapeHtml(col.title)}</th>\n`;
  }

  html += `      </tr>
    </thead>
    <tbody>
`;

  for (const row of data) {
    const rowKey = colorInfo?.getRowKey(row);
    html += '      <tr>\n';
    
    for (const col of columns) {
      const value = getCellValue(row, col);
      
      // Get cell color and text color
      let style = '';
      if (colorInfo && rowKey !== undefined) {
        const cellColor = colorInfo.getCellColor(rowKey, col.key);
        if (cellColor) {
          const textColor = colorInfo.getTextColor(cellColor);
          style = ` style="background-color: ${cellColor} !important;${textColor ? ` color: ${textColor} !important;` : ''}"`;
        }
      }
      
      html += `        <td${style}>${escapeHtml(String(value ?? ''))}</td>\n`;
    }
    html += '      </tr>\n';
  }

  html += `    </tbody>
  </table>`;

  // Add aggregation summary
  if (aggregationResults && aggregationResults.length > 0) {
    html += `
  <div style="margin-top: 30px;">
    <h2 style="color: #1F2937; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #3B82F6; padding-bottom: 8px;">Summary</h2>
    <table style="width: auto; min-width: 350px; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; border-collapse: separate;">
      <thead>
        <tr>
          <th style="background-color: #F9FAFB !important; color: #1F2937 !important; border: none; border-bottom: 2px solid #3B82F6; padding: 12px 16px;">Aggregation</th>
          <th style="background-color: #F9FAFB !important; color: #1F2937 !important; border: none; border-bottom: 2px solid #3B82F6; padding: 12px 16px; text-align: right;">Value</th>
        </tr>
      </thead>
      <tbody>
`;
    for (const result of aggregationResults) {
      html += `        <tr>
          <td style="background-color: #FFFFFF !important; border: none; border-bottom: 1px solid #F3F4F6; padding: 10px 16px; font-weight: 500;">${escapeHtml(result.label)}</td>
          <td style="background-color: #FFFFFF !important; border: none; border-bottom: 1px solid #F3F4F6; padding: 10px 16px; font-weight: 700; color: #3B82F6; text-align: right;">${escapeHtml(result.formattedValue)}</td>
        </tr>\n`;
    }
    html += `      </tbody>
    </table>
  </div>`;
  }

  html += `
  <div class="footer">
    Total: ${data.length} records
  </div>
</body>
</html>`;

  return html;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Downloads a blob as a file
 */
function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Escapes XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Exports table data based on options
 */
export function exportTable<T>(
  allData: T[],
  selectedData: T[],
  columns: ColumnConfig<T>[],
  getCellValue: (row: T, column: ColumnConfig<T>) => any,
  options: ExportOptions
): void {
  // Determine which data to export
  const data = options.selectedOnly ? selectedData : allData;
  
  if (data.length === 0) {
    alert('No data to export');
    return;
  }
  
  // Filter columns based on options
  let exportColumns: ExportColumn[] = columns
    .filter(col => {
      // If specific columns are specified, only include those
      if (options.columns && options.columns.length > 0) {
        return options.columns.includes(col.key);
      }
      // If not including computed, filter them out
      if (!options.includeComputed && col.isComputed) {
        return false;
      }
      return true;
    })
    .map(col => ({
      key: col.key,
      title: col.title,
      isComputed: col.isComputed,
    }));
  
  const fileName = options.fileName || `table-export-${new Date().toISOString().slice(0, 10)}`;
  
  // Create a wrapper function for getCellValue that works with ExportColumn
  const getValue = (row: T, exportCol: ExportColumn): any => {
    const column = columns.find(c => c.key === exportCol.key);
    if (column) {
      return getCellValue(row, column);
    }
    return (row as any)[exportCol.key];
  };
  
  // Get color info and aggregation results
  const colorInfo = options.colorInfo;
  const aggregationResults = options.aggregationResults;
  
  switch (options.format) {
    case 'csv':
      // CSV doesn't support colors but includes aggregation summary
      const csv = convertToCSV(data, exportColumns, getValue, options.includeHeaders !== false, aggregationResults);
      downloadCSV(csv, fileName);
      break;
      
    case 'excel':
      downloadExcel(data, exportColumns, getValue, fileName, options.sheetName, colorInfo, aggregationResults);
      break;
      
    case 'pdf':
      downloadPDF(data, exportColumns, getValue, fileName, fileName, colorInfo, aggregationResults);
      break;
      
    case 'word':
      downloadWord(data, exportColumns, getValue, fileName, fileName, colorInfo, aggregationResults);
      break;
      
    case 'print':
      openPrintView(data, exportColumns, getValue, fileName, colorInfo, aggregationResults);
      break;
  }
}
