// tables.js
const {
  Table,
  TableRow,
  TableCell,
  Paragraph,
  TextRun,
  TableLayoutType,
  WidthType,
  AlignmentType,
  HeightRule,
  VerticalAlign,
} = require('docx');
const { BORDER_NONE, TABLE_DEFAULTS, COLS, USABLE_WIDTH, scaleColumnsTo, DXA, INDENT, FONT } = require('./docx-config');
const { hbsMdToRuns } = require('../../utils/hbsMdToRuns');

const rowLabelSepValue = (label, value, markup, data) =>
  new TableRow({
    children: [
      new TableCell({
        borders: BORDER_NONE,
        children: [
          new Paragraph({
            children: hbsMdToRuns(label, undefined, { caplock: markup?.caplocKey, bold: markup?.boldKey }),
          }),
        ],
      }),
      new TableCell({
        borders: BORDER_NONE,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: ':' })] })],
      }),
      new TableCell({
        borders: BORDER_NONE,
        children: [
          new Paragraph({ children: hbsMdToRuns(value, data, { caplock: markup?.caplockValue, bold: markup?.boldValue }) }),
        ],
      }),
    ],
  });

const rowLabelSepValue2 = (
  label,
  value,
  { boldKey = false, boldValue = false, caplockKey = false, caplockValue = false, size } = {},
  {
    heightRule = HeightRule.AUTO, // AUTO | ATLEAST | EXACT
    heightValue = 0, // twips; 0 = auto
  } = {}
) =>
  new TableRow({
    height: { value: heightValue, rule: heightRule },
    children: [
      new TableCell({
        borders: BORDER_NONE,
        verticalAlign: VerticalAlign.TOP,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: hbsMdToRuns(label, undefined, { caplock: caplockKey, bold: boldKey, size }),
          }),
        ],
      }),
      new TableCell({
        borders: BORDER_NONE,
        verticalAlign: VerticalAlign.TOP,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: hbsMdToRuns(value, undefined, { caplock: caplockValue, bold: boldValue, size }),
          }),
        ],
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
const projectDetailTable = (
  contractInformationTable,
  markup = {
    caplockValue: true,
    boldValue: true,
  }
) => {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `No: ${String(contractInformationTable.no.value ?? '')}`,
          bold: true,
          color: 'FF0000',
        }),
      ],
    }),
    new Table({
      ...TABLE_DEFAULTS,
      layout: TableLayoutType.FIXED,
      width: { size: 60, type: WidthType.PERCENTAGE },
      columnWidths: COLS.LABEL_SEP_VALUE_2,
      alignment: AlignmentType.CENTER,
      rows: [
        rowLabelSepValue(contractInformationTable.project.key, contractInformationTable.project.value, markup),
        rowLabelSepValue(contractInformationTable.item.key, contractInformationTable.item.value, markup),
        rowLabelSepValue(contractInformationTable.location.key, contractInformationTable.location.value, markup),
      ],
    }),
  ];
};

//  projectWorkDetails: {
//     projectName: {
//       key: '*. Project',
//       value: 'Q-2025-059 Comstock Pond Cover',
//       markup: {
//         boldValue: true,
//       },
//     },
//     location: {
//       key: '*. Location',
//       value: 'CANADA',
//       markup: {
//         boldValue: true,
//         caplockValue: true,
//       },
//     },
//     volOfWork: {
//       key: '*. Volume of works',
//       value:
//         'As specified in Party B’s Quotation dated {{quotationDate}}, including the scope of quotation, the list of materials and applicable standards attached to this Contract, Party A’s architectural design drawings, and Party B’s steel structure design drawings as approved by Party A.',
//     },
//   },
const projectWorkDetailTable = ({ projectWorkDetails, quotationDate }, indentLeftDXA = 1 * DXA.INCH) => {
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
        rowLabelSepValue(
          projectWorkDetails.projectName.key,
          projectWorkDetails.projectName.value,
          projectWorkDetails.projectName.markup
        ),
        rowLabelSepValue(projectWorkDetails.item.key, projectWorkDetails.item.value, projectWorkDetails.item.markup),
        rowLabelSepValue(
          projectWorkDetails.location.key,
          projectWorkDetails.location.value,
          projectWorkDetails.location.markup
        ),
        rowLabelSepValue(
          projectWorkDetails.volOfWork.key,
          projectWorkDetails.volOfWork.value,
          projectWorkDetails.volOfWork.markup,
          { quotationDate }
        ),
      ],
    }),

    new Paragraph({
      indent: { left: INDENT.L1_LEFT },
      children: hbsMdToRuns(projectWorkDetails.theProject),
    }),
  ];
};

const bankAccoutTable = (bankInformation, indentLeftDXA = 1 * DXA.INCH, markup = { boldValue: true }) => {
  const tableWidth = USABLE_WIDTH - indentLeftDXA;
  const cols = scaleColumnsTo(COLS.LABEL_SEP_VALUE_4, tableWidth);
  return [
    new Table({
      ...TABLE_DEFAULTS,
      layout: TableLayoutType.FIXED,
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: cols,
      indent: { size: indentLeftDXA, type: WidthType.DXA },
      rows: [
        rowLabelSepValue(bankInformation.beneficiary.key, bankInformation.beneficiary.value, markup),
        rowLabelSepValue(bankInformation.accountNo.key, bankInformation.accountNo.value, markup),
        rowLabelSepValue(bankInformation.bankName.key, bankInformation.bankName.value, markup),
        rowLabelSepValue(bankInformation.branch.key, bankInformation.branch.value, markup),
        rowLabelSepValue(bankInformation.address.key, bankInformation.address.value, markup),
        rowLabelSepValue(bankInformation.swift.key, bankInformation.swift.value, markup),
      ],
    }),
  ];
};

const requireDocumentTable = (requireDocument, indentLeftDXA = 1 * DXA.INCH) => {
  const tableWidth = USABLE_WIDTH - indentLeftDXA;
  const cols = scaleColumnsTo(COLS.LABEL_SEP_VALUE_5, tableWidth);
  return [
    new Paragraph({
      numbering: { reference: 'article-numbering', level: 1 },
      children: [
        new TextRun({
          text: 'Required document including:',
          bold: true,
        }),
      ],
    }),
    new Table({
      ...TABLE_DEFAULTS,
      layout: TableLayoutType.FIXED,
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: cols,
      indent: { size: indentLeftDXA, type: WidthType.DXA },
      rows: [...requireDocument.map((doc) => rowLabelSepValue(doc.key, doc.value))],
    }),
  ];
};

const signinTable = ({ partyA, partyB }) => {
  const tableWidth = USABLE_WIDTH;
  const cols = scaleColumnsTo([4000, 4000], tableWidth);
  return [
    new Table({
      ...TABLE_DEFAULTS,
      layout: TableLayoutType.FIXED,
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: cols,
      rows: [
        rowLabelSepValue2(
          'For and on behalf of Party A',
          'For and on behalf of Party B',
          {
            boldValue: true,
            boldKey: true,
          },
          {
            size: FONT.SIZE_12,
          }
        ),
        rowLabelSepValue2(
          partyA.company,
          partyB.company,
          {
            boldValue: true,
            boldKey: true,
            size: FONT.SIZE_12,
          },
          {
            heightRule: HeightRule.ATLEAST, // or HeightRule.EXACT to force
            heightValue: 720 * 4,
          }
        ),
        rowLabelSepValue2(partyA.representedBy, partyB.representedBy, {
          boldValue: true,
          boldKey: true,
          size: FONT.SIZE_12,
        }),
        rowLabelSepValue2(partyA.position, partyB.position, {
          boldValue: true,
          boldKey: true,
          size: FONT.SIZE_12,
        }),
      ],
    }),
  ];
};

// === Party table (Party A / Party B details) ===
const createPartyATable = (partyA) => [
  new Table({
    ...TABLE_DEFAULTS,
    layout: TableLayoutType.FIXED,
    columnWidths: COLS.LABEL_SEP_VALUE,
    rows: [
      rowLabelSepValue(partyA.company.key, partyA.company.value, { caplockValue: true, boldValue: true, boldKey: true }),
      rowLabelSepValue(partyA.representedBy.key, partyA.representedBy.value, { boldValue: true, boldKey: true }),
      rowLabelSepValue(partyA.position.key, partyA.position.value, partyA.position.markup),
      rowLabelSepValue(partyA.address.key, partyA.address.value, partyA.address.markup),
      ...(partyA.optional && partyA.optional.map((item) => rowLabelSepValue(item.key, item.value, item.markup))),
    ],
  }),
  new Paragraph({
    children: hbsMdToRuns('(Hereinafter referred to as **Party A**)'),
  }),
  new Paragraph({
    children: [new TextRun('___')],
  }),
];

const createPartyBTable = (partyB) => [
  new Table({
    ...TABLE_DEFAULTS,
    layout: TableLayoutType.FIXED,
    columnWidths: COLS.LABEL_SEP_VALUE,
    rows: [
      rowLabelSepValue(partyB.company.key, partyB.company.value, { caplockValue: true, boldValue: true, boldKey: true }),
      rowLabelSepValue(partyB.representedBy.key, partyB.representedBy.value, {
        caplockValue: true,
        boldValue: true,
        boldKey: true,
      }),
      rowLabelSepValue(partyB.position.key, partyB.position.value, partyB.position.markup),
      rowLabelSepValue(partyB.address.key, partyB.address.value, partyB.address.markup),
      rowLabelSepValue(partyB.taxCode.key, partyB.taxCode.value, partyB.taxCode.markup),
      ...(partyB.optional && partyB.optional.map((item) => rowLabelSepValue(item.key, item.value, item.markup))),
    ],
  }),
  new Paragraph({
    children: hbsMdToRuns('(Hereinafter referred to as **Party B**)'),
  }),
  new Paragraph({
    children: [new TextRun('___')],
  }),
];

module.exports = {
  rowLabelSepValue,
  tableLabelSepValue,
  projectDetailTable,
  projectWorkDetailTable,
  createPartyATable,
  createPartyBTable,
  bankAccoutTable,
  signinTable,
  requireDocumentTable,
};
