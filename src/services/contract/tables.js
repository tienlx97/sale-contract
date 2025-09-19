// tables.js
const { Table, TableRow, TableCell, Paragraph, TextRun, TableLayoutType, WidthType, AlignmentType } = require('docx');
const { BORDER_NONE, TABLE_DEFAULTS, COLS, USABLE_WIDTH, scaleColumnsTo, DXA } = require('./docx-config');

const rowLabelSepValue = (label, value, { boldLabel = false, boldValue = false } = {}) =>
  new TableRow({
    children: [
      new TableCell({
        borders: BORDER_NONE,
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: boldLabel })] })],
      }),
      new TableCell({
        borders: BORDER_NONE,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: ':' })] })],
      }),
      new TableCell({
        borders: BORDER_NONE,
        children: [new Paragraph({ children: [new TextRun({ text: value, bold: boldValue })] })],
      }),
    ],
  });

const tableLabelSepValue = (rows) =>
  new Table({
    ...TABLE_DEFAULTS,
    layout: TableLayoutType.FIXED,
    columnWidths: COLS.LABEL_SEP_VALUE,
    rows,
  });

// Project detail (centered 70% width)
const projectDetailTable = (pairs /* [{key,value}] */) =>
  new Table({
    ...TABLE_DEFAULTS,
    layout: TableLayoutType.FIXED,
    width: { size: 60, type: WidthType.PERCENTAGE },
    columnWidths: COLS.LABEL_SEP_VALUE_2,
    alignment: AlignmentType.CENTER,
    rows: pairs.map(({ key, value }) => rowLabelSepValue(key, value, { boldLabel: true, boldValue: true })),
  });

// Work detail table aligned under level-1 text (INDENT)
const projectWorkDetailTable = ({ projectName, item, location, quotationDate }, indentLeftDXA = 1 * DXA.INCH) => {
  const tableWidth = USABLE_WIDTH - indentLeftDXA;
  const cols = scaleColumnsTo(COLS.LABEL_SEP_VALUE, tableWidth);
  return new Table({
    ...TABLE_DEFAULTS,
    layout: TableLayoutType.FIXED,
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: cols,
    indent: { size: indentLeftDXA, type: WidthType.DXA },
    rows: [
      rowLabelSepValue('*. Project', projectName, { boldValue: true }),
      rowLabelSepValue('*. Item', item, { boldValue: true }),
      rowLabelSepValue('*. Location', location, { boldValue: true }),
      new TableRow({
        children: [
          new TableCell({
            borders: BORDER_NONE,
            children: [new Paragraph({ children: [new TextRun({ text: '*. Volume of works' })] })],
          }),
          new TableCell({ borders: BORDER_NONE, children: [new Paragraph({ children: [new TextRun({ text: ':' })] })] }),
          new TableCell({
            borders: BORDER_NONE,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'As specified in Party B’s Quotation dated ' }),
                  new TextRun({ text: quotationDate }),
                  new TextRun({
                    text: ', including the scope of quotation, the list of materials and applicable standards attached to this Contract, Party A’s architectural design drawings, and Party B’s steel structure design drawings as approved by Party A.',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
};

// === Party table (Party A / Party B details) ===
const createPartyTable = (partyName, partyDetails, partyChar) => [
  new Table({
    ...TABLE_DEFAULTS,
    layout: TableLayoutType.FIXED,
    columnWidths: COLS.LABEL_SEP_VALUE,
    rows: [
      rowLabelSepValue(partyName.key, partyName.value, {
        boldLabel: partyName.markup?.bold,
        boldValue: partyName.markup?.bold,
      }),
      ...partyDetails.map((cd) =>
        rowLabelSepValue(cd.key, cd.value, { boldLabel: cd.markup?.bold, boldValue: cd.markup?.bold })
      ),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun('(Hereinafter referred to as '),
      new TextRun({
        text: `Party ${partyChar}`,
        bold: true,
      }),
      new TextRun(')'),
    ],
  }),
];

module.exports = { rowLabelSepValue, tableLabelSepValue, projectDetailTable, projectWorkDetailTable, createPartyTable };
