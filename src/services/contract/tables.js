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
  { boldKey = false, boldValue = false, caplockKey = false, caplockValue = false } = {},
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
            children: hbsMdToRuns(label, undefined, { caplock: caplockKey, bold: boldKey }),
          }),
        ],
      }),
      new TableCell({
        borders: BORDER_NONE,
        verticalAlign: VerticalAlign.TOP,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: hbsMdToRuns(value, undefined, { caplock: caplockValue, bold: boldValue }),
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
const projectDetailTable = (contractInformationTable) => {
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
        rowLabelSepValue(
          contractInformationTable.project.key,
          contractInformationTable.project.value,
          contractInformationTable.project.markup
        ),
        rowLabelSepValue(
          contractInformationTable.item.key,
          contractInformationTable.item.value,
          contractInformationTable.item.markup
        ),
        rowLabelSepValue(
          contractInformationTable.location.key,
          contractInformationTable.location.value,
          contractInformationTable.location.markup
        ),
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

const bankAccoutTable = (bankInformation, indentLeftDXA = 1 * DXA.INCH) => {
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
        rowLabelSepValue(
          bankInformation.beneficiary.key,
          bankInformation.beneficiary.value,
          bankInformation.beneficiary.markup
        ),
        rowLabelSepValue(bankInformation.accountNo.key, bankInformation.accountNo.value, bankInformation.accountNo.markup),
        rowLabelSepValue(bankInformation.bankName.key, bankInformation.bankName.value, bankInformation.bankName.markup),
        rowLabelSepValue(bankInformation.branch.key, bankInformation.branch.value, bankInformation.branch.markup),
        rowLabelSepValue(bankInformation.address.key, bankInformation.address.value, bankInformation.beneficiary.markup),
        rowLabelSepValue(bankInformation.swift.key, bankInformation.swift.value, bankInformation.swift.markup),
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
  const cols = scaleColumnsTo([4000, 6000], tableWidth);
  return [
    new Table({
      ...TABLE_DEFAULTS,
      layout: TableLayoutType.FIXED,
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: cols,
      rows: [
        rowLabelSepValue2(
          partyA.company,
          partyB.company,
          {
            boldValue: true,
            boldKey: true,
          },
          {
            heightRule: HeightRule.ATLEAST, // or HeightRule.EXACT to force
            heightValue: 720 * 3,
          }
        ),
        rowLabelSepValue2(partyA.representedBy, partyB.representedBy, {
          boldValue: true,
          boldKey: true,
        }),
        rowLabelSepValue2(partyA.position, partyB.position, {
          boldValue: true,
          boldKey: true,
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
      rowLabelSepValue(partyA.company.key, partyA.company.value, partyA.company.markup),
      rowLabelSepValue(partyA.representedBy.key, partyA.representedBy.value, partyA.representedBy.markup),
      rowLabelSepValue(partyA.position.key, partyA.position.value, partyA.position.markup),
      rowLabelSepValue(partyA.address.key, partyA.address.value, partyA.address.markup),
      ...(partyA.optional && partyA.optional.map((item) => rowLabelSepValue(item.key, item.value, item.markup))),
    ],
  }),
  new Paragraph({
    children: hbsMdToRuns(partyA.title),
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
      rowLabelSepValue(partyB.company.key, partyB.company.value, partyB.company.markup),
      rowLabelSepValue(partyB.representedBy.key, partyB.representedBy.value, partyB.representedBy.markup),
      rowLabelSepValue(partyB.position.key, partyB.position.value, partyB.position.markup),
      rowLabelSepValue(partyB.address.key, partyB.address.value, partyB.address.markup),
      rowLabelSepValue(partyB.taxCode.key, partyB.taxCode.value, partyB.taxCode.markup),
      ...(partyB.optional && partyB.optional.map((item) => rowLabelSepValue(item.key, item.value, item.markup))),
    ],
  }),
  new Paragraph({
    children: hbsMdToRuns(partyB.title),
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
