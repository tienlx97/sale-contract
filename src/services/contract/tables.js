// tables.js
const { Table, TableRow, TableCell, Paragraph, TextRun, TableLayoutType, WidthType, AlignmentType } = require('docx');
const { BORDER_NONE, TABLE_DEFAULTS, COLS, USABLE_WIDTH, scaleColumnsTo, DXA, INDENT } = require('./docx-config');

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
  return [
    new Table({
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
    }),

    new Paragraph({
      indent: { left: 1440 },
      children: [
        new TextRun('(Hereinafter referred to as '),
        new TextRun({
          text: '“The Project',
          bold: true,
        }),
        new TextRun(')'),
        new TextRun({ break: 1 }),
      ],
    }),
  ];
};

const bankAccoutTable = (prop, indentLeftDXA = 1 * DXA.INCH) => {
  const tableWidth = USABLE_WIDTH - indentLeftDXA;
  const cols = scaleColumnsTo(COLS.LABEL_SEP_VALUE_3, tableWidth);
  return [
    new Table({
      ...TABLE_DEFAULTS,
      layout: TableLayoutType.FIXED,
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: cols,
      indent: { size: indentLeftDXA, type: WidthType.DXA },
      rows: [
        rowLabelSepValue('Beneficiary', 'DAI NGHIA INDUSTRIAL MECHANICS CO., LTD', { boldValue: true }),
        rowLabelSepValue('Bank account No.', '1032407684', { boldValue: true }),
        rowLabelSepValue('Bank', 'Joint Stock Commercial Bank Foreign Trade of Viet Nam', { boldValue: true }),
        rowLabelSepValue('Branch', 'Tan Binh', { boldValue: true }),
        rowLabelSepValue('Address', '108 Tay Thanh Street, Tay Thanh Ward, Ho Chi Minh City, Vietnam', { boldValue: true }),
        rowLabelSepValue('SWIFT Code', 'BFTVVNVX044', { boldValue: true }),
      ],
    }),

    new Paragraph({
      indent: { left: INDENT.L1_LEFT },
      children: [new TextRun({ text: 'Required document including:', bold: true })],
    }),

    new Table({
      ...TABLE_DEFAULTS,
      layout: TableLayoutType.FIXED,
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: cols,
      indent: { size: indentLeftDXA, type: WidthType.DXA },
      rows: [
        rowLabelSepValue('- Commercial Invoice', '01 original(s) electronic'),
        rowLabelSepValue('- Packing list', '01 original(s) electronic'),
        rowLabelSepValue('- Bill of Lading', '01 surrender Bill'),
        rowLabelSepValue('- Certificate of Origin (Form D)', '01 original(s) electronic'),
      ],
    }),
  ];
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

module.exports = {
  rowLabelSepValue,
  tableLabelSepValue,
  projectDetailTable,
  projectWorkDetailTable,
  createPartyTable,
  bankAccoutTable,
};
