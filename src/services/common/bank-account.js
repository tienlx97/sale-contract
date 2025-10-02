// tables.js (excerpt)
const { Table, TableRow, TableCell, Paragraph, TextRun, AlignmentType, TableLayoutType, WidthType } = require('docx');
const {
  USABLE_WIDTH,
  COLS,
  scaleColumnsTo,
  TABLE_DEFAULTS,
  BORDER_NONE,
  FONT,
  DXA,
  PAGE,
} = require('../../utils/docx-config');
const { hbsMdToRuns } = require('../../utils/hbsMdToRuns');

/**
 * Build a single "Label : Value" row with consistent styling.
 * - Null/empty label/value are skipped by the caller (see below).
 */
function rowLabelSepValue(label, value, markup = {}, data) {
  return new TableRow({
    children: [
      new TableCell({
        borders: BORDER_NONE,
        children: [
          new Paragraph({
            children: hbsMdToRuns(label, undefined, {
              caplock: markup?.caplockKey, // (fixed from caplocKey)
              bold: markup?.boldKey,
              size: markup?.sizeKey,
            }),
          }),
        ],
      }),
      new TableCell({
        borders: BORDER_NONE,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: ':' })],
          }),
        ],
      }),
      new TableCell({
        borders: BORDER_NONE,
        children: [
          new Paragraph({
            children: hbsMdToRuns(value, data, {
              caplock: markup?.caplockValue,
              bold: markup?.boldValue,
              size: markup?.sizeValue ?? FONT.SIZE_10,
            }),
          }),
        ],
      }),
    ],
  });
}

/**
 * Builds a bank account table as a single-element array (spread-friendly).
 *
 * @param {Object} bankInformation
 *   Expecting shape:
 *   {
 *     beneficiary: { key, value },
 *     accountNo:   { key, value },
 *     bankName:    { key, value },
 *     branch:      { key, value },
 *     address:     { key, value },
 *     swift:       { key, value },
 *   }
 * @param {number} indentLeftDXA   Left indent in DXA (default 1 inch)
 * @param {Object} markup          Style toggles (bold/caplock/size)
 * @param {string[]} visibleFields Optional explicit field order/filter
 *                                 e.g. ['beneficiary','accountNo','bankName','swift']
 *                                 (Missing fields are skipped safely.)
 * @returns {Array<Table>}         Array with a single Table for `...spread` usage.
 */
function bankAccoutTable(bankInformation, indentLeftDXA = 1 * DXA.INCH, markup = { boldValue: true }, visibleFields) {
  const tableWidth = Math.max(0, (USABLE_WIDTH ?? 0) - (indentLeftDXA ?? 0));
  const cols = scaleColumnsTo(COLS.LABEL_SEP_VALUE_4, tableWidth);

  // Default order if not provided
  const order =
    visibleFields && Array.isArray(visibleFields) && visibleFields.length > 0
      ? visibleFields
      : ['beneficiary', 'accountNo', 'bankName', 'branch', 'address', 'swift'];

  // Build rows only for fields that exist & have both key/value
  const rows = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const field of order) {
    const item = bankInformation?.[field];
    const label = item?.key?.toString?.() ?? item?.key;
    const value = item?.value?.toString?.() ?? item?.value;
    if (label && value) {
      rows.push(rowLabelSepValue(label, value, markup));
    }
  }

  // If nothing to show, return an empty array so spreading does nothing
  if (rows.length === 0) return [];

  return [
    new Table({
      ...TABLE_DEFAULTS,
      layout: TableLayoutType.FIXED,
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: cols,
      indent: { size: indentLeftDXA, type: WidthType.DXA },
      rows,
    }),
  ];
}

function bankAccoutTableV2(bankInformation, indentLeftDXA = 1 * DXA.INCH, markup = { boldValue: true }, visibleFields) {
  const USABLE_WIDTH_V2 = PAGE.A4_WIDTH - PAGE.MARGIN_V2.LEFT - PAGE.MARGIN_V2.RIGHT;

  const tableWidth = Math.max(0, (USABLE_WIDTH_V2 ?? 0) - (indentLeftDXA ?? 0));
  const cols = scaleColumnsTo(COLS.LABEL_SEP_VALUE_4, tableWidth);

  // Default order if not provided
  const order =
    visibleFields && Array.isArray(visibleFields) && visibleFields.length > 0
      ? visibleFields
      : ['beneficiary', 'accountNo', 'bankName', 'branch', 'address', 'swift'];

  // Build rows only for fields that exist & have both key/value
  const rows = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const field of order) {
    const item = bankInformation?.[field];
    const label = item?.key?.toString?.() ?? item?.key;
    const value = item?.value?.toString?.() ?? item?.value;
    if (label && value) {
      rows.push(rowLabelSepValue(label, value, markup));
    }
  }

  // If nothing to show, return an empty array so spreading does nothing
  if (rows.length === 0) return [];

  return [
    new Table({
      ...TABLE_DEFAULTS,
      layout: TableLayoutType.FIXED,
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: cols,
      indent: { size: indentLeftDXA, type: WidthType.DXA },
      rows,
    }),
  ];
}

module.exports = { bankAccoutTable, rowLabelSepValue, bankAccoutTableV2 };
