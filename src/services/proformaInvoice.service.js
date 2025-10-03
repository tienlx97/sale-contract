// payment-request.js
/* eslint-disable no-console */
const {
  Packer,
  Paragraph,
  AlignmentType,
  TextRun,
  Table,
  TableLayoutType,
  TableRow,
  TableCell,
  WidthType,
  HeightRule,
  LevelFormat,
  LevelSuffix,
} = require('docx');

const { formatDayMonthYear, toOrdinal, amountInWordsCurrencyFirst } = require('../utils/toWordData');
const { createDocumentV2 } = require('../utils/createDocument');
const { FONT, TABLE_DEFAULTS, BORDER_NONE, scaleColumnsTo, INDENT, PAGE, COLS } = require('../utils/docx-config');
const { hbsMdToRuns } = require('../utils/hbsMdToRuns');
const { bankAccoutTableV2 } = require('./common/bank-account');

// ---------- Helpers ----------
/** Safer, lazy require so the module stays optional */
function safeRequire(mod) {
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(mod);
  } catch {
    return null;
  }
}

/** More defensive currency formatting (accepts number | string) */
function formatCurrency(value) {
  const n = typeof value === 'string' ? Number(value.replace(/,/g, '')) : Number(value);
  if (!Number.isFinite(n)) return String(value ?? '');
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function rowLabelSepValue(
  label,
  value,
  {
    boldKey = false,
    boldValue = false,
    caplockKey = false,
    caplockValue = false,
    size,
    minRowHeightTwips, // e.g. 720 * 4,
    alignment,
  } = {}
) {
  return new TableRow({
    height: minRowHeightTwips ? { value: minRowHeightTwips, rule: HeightRule.ATLEAST } : undefined,
    children: [
      new TableCell({
        borders: BORDER_NONE,
        children: [
          new Paragraph({
            alignment,
            children: hbsMdToRuns(label, undefined, { caplock: caplockKey, bold: boldKey, size }),
          }),
        ],
      }),
      new TableCell({
        borders: BORDER_NONE,
        children: [
          new Paragraph({
            alignment: 'center',
            children: [
              new TextRun({
                text: ':',
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        borders: BORDER_NONE,
        children: [
          new Paragraph({
            alignment,
            children: hbsMdToRuns(value, undefined, { caplock: caplockValue, bold: boldValue, size }),
          }),
        ],
      }),
    ],
  });
}

/** Compact row factory; supports optional row height */
function rowLabelSepValue2(
  label,
  value,
  {
    boldKey = false,
    boldValue = false,
    caplockKey = false,
    caplockValue = false,
    size,
    minRowHeightTwips, // e.g. 720 * 4,
    alignment,
  } = {}
) {
  return new TableRow({
    height: minRowHeightTwips ? { value: minRowHeightTwips, rule: HeightRule.ATLEAST } : undefined,
    children: [
      new TableCell({
        borders: BORDER_NONE,
        children: [
          new Paragraph({
            alignment,
            children: hbsMdToRuns(label, undefined, { caplock: caplockKey, bold: boldKey, size }),
          }),
        ],
      }),
      new TableCell({
        borders: BORDER_NONE,
        children: [
          new Paragraph({
            alignment,
            children: hbsMdToRuns(value, undefined, { caplock: caplockValue, bold: boldValue, size }),
          }),
        ],
      }),
    ],
  });
}

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

/** Signature block */
function signinTable() {
  const USABLE_WIDTH_V2 = PAGE.A4_WIDTH - PAGE.MARGIN_V2.LEFT - PAGE.MARGIN_V2.RIGHT;

  const tableWidth = USABLE_WIDTH_V2;
  const cols = scaleColumnsTo([2500, 4000], tableWidth);

  return [
    new Table({
      ...TABLE_DEFAULTS,
      alignment: AlignmentType.CENTER,
      layout: TableLayoutType.FIXED,
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: cols,
      rows: [
        rowLabelSepValue2('', 'DAI NGHIA INDUSTRIAL MECHANICS CO., LTD', {
          boldValue: true,
          boldKey: true,
          minRowHeightTwips: 720 * 4,
          alignment: 'center',
        }),
        rowLabelSepValue2('', 'Mr. Le Xuan Nghia', {
          boldValue: true,
          boldKey: true,
          alignment: 'center',
        }),
        rowLabelSepValue2('', 'General Director', {
          boldValue: true,
          boldKey: true,
          alignment: 'center',
        }),
      ],
    }),
  ];
}

function DateNoTable(no, signedDateInWords) {
  const USABLE_WIDTH_V2 = PAGE.A4_WIDTH - PAGE.MARGIN_V2.LEFT - PAGE.MARGIN_V2.RIGHT;

  const tableWidth = USABLE_WIDTH_V2;
  const cols = scaleColumnsTo([4000, 4000], tableWidth);

  return [
    new Table({
      ...TABLE_DEFAULTS,
      // cellMargin: { top: 80, bottom: 80, left: 0, right: 0 },
      layout: TableLayoutType.FIXED,
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: cols,
      rows: [
        new TableRow({
          // height: minRowHeightTwips ? { value: minRowHeightTwips, rule: HeightRule.ATLEAST } : undefined,
          children: [
            new TableCell({
              borders: BORDER_NONE,
              children: [
                new Paragraph({
                  alignment: 'left',
                  children: [
                    new TextRun({ text: 'No: ', bold: true, size: FONT.SIZE_12 }),
                    new TextRun({ text: String(no ?? ''), bold: true, size: FONT.SIZE_12 }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: BORDER_NONE,
              children: [
                new Paragraph({
                  alignment: 'right',
                  children: [new TextRun({ text: `Ho Chi Minh, ${signedDateInWords}`, size: FONT.SIZE_12 })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];
}

// ---------- Core builders ----------
/**
 * Build the Document (does not write to disk)
 * @param {Object} contractBody
 * @returns {Document}
 */
async function buildDoc(contractBody) {
  const { commercial, signDate, contractSignedDate, no, contractNo, payment, incoterm, parties } = contractBody;

  // Defensive read
  const signedDateInWords = formatDayMonthYear(signDate);
  const contractsignedDateInWords = formatDayMonthYear(contractSignedDate);

  const paymentValue = formatCurrency(payment?.value ?? 0);
  const paymentInWordsValue = amountInWordsCurrencyFirst(payment?.value ?? 0, 'USD');

  // Prefer your util to compute ordinals (e.g., 1->First)
  const nth = toOrdinal?.(payment?.num) ?? String(payment?.num ?? '');

  const doc = createDocumentV2({
    numbering: {
      config: [
        {
          reference: 'line-numbering',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              suffix: LevelSuffix.SPACE,
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: INDENT.L1_GAP, hanging: 0 },
                },
              },
            },
          ],
        },
      ],
    },
    children: [
      new Paragraph({}),
      ...DateNoTable(no, signedDateInWords),

      new Paragraph({}),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'PROFORMA INVOICE', allCaps: true, bold: true, size: 44 })],
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'PARTIES', allCaps: true, bold: true, underline: true, size: 44 })],
      }),

      ...createPartyATable(partyA),
      ...createPartyATable(partyB),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: 'SHIPPING AND CONTRACT DETAILS', allCaps: true, bold: true, underline: true, size: 44 }),
        ],
      }),

      new Paragraph({
        numbering: { reference: 'bullet-list', level: 0 },
        children: hbsMdToRuns('**Port of Shipment**: {{pos}}**', { pos }),
      }),
      new Paragraph({
        numbering: { reference: 'bullet-list', level: 0 },
        children: hbsMdToRuns('**Port of Destination**: {{pod}}**', { pod }),
      }),
      new Paragraph({
        numbering: { reference: 'bullet-list', level: 0 },
        children: hbsMdToRuns('**Contract No. & Date**: {{contractNo}} - {{contractsignedDateInWords}}', {
          contractNo,
          contractsignedDateInWords,
        }),
      }),
      new Paragraph({
        numbering: { reference: 'bullet-list', level: 0 },
        children: hbsMdToRuns('**Invoice No. & Date**: {{no}} - {{signedDateInWords}}', {
          paymentInWordsValue,
          signedDateInWords,
        }),
      }),

      new Paragraph({
        numbering: { reference: 'bullet-list', level: 0 },
        children: hbsMdToRuns('**Trade Term**: {{rule}} {{location}}, Incoterms® {{year}}', { rule, location, year }),
      }),

      new Paragraph({
        numbering: { reference: 'bullet-list', level: 0 },
        children: hbsMdToRuns('**Payment Terms**: {{paymentTerm}}', { paymentTerm }),
      }),

      new Paragraph({}),

      new Paragraph({
        children: [new TextRun({ text: 'DESCRIPTION OF GOODS AND AMOUNT', bold: true, underline: true })],
      }),

      new Paragraph({
        children: [new TextRun({ text: 'We look forward to receiving your kind cooperation. Yours faithfully' })],
      }),

      ...signinTable(),
    ],
  });

  return doc;
}

/**
 * Convert DOCX buffer -> PDF buffer using LibreOffice (if available)
 * @param {Buffer} docxBuffer
 * @returns {Promise<Buffer>}
 */
async function convertDocxToPdfBuffer(docxBuffer) {
  const libre = safeRequire('libreoffice-convert');
  if (!libre) {
    throw new Error(
      'PDF conversion requires "libreoffice-convert" and LibreOffice installed (soffice). Please install or request DOCX output.'
    );
  }
  return new Promise((resolve, reject) => {
    libre.convert(docxBuffer, '.pdf', undefined, (err, done) => (err ? reject(err) : resolve(done)));
  });
}

/**
 * Build buffer (DOCX or PDF). Optionally write to disk if outputPath provided.
 * @param {Object} contractBody
 * @param {{format?: 'docx'|'pdf', outputPath?: string}} options
 * @returns {Promise<Buffer>}
 */
async function createPaymentRequestBuffer(contractBody, options = {}) {
  const { format = 'pdf' } = options;
  const doc = await buildDoc(contractBody);
  const docxBuffer = await Packer.toBuffer(doc);
  // fs.writeFileSync('file.docx', docxBuffer);
  if (format === 'docx') {
    return docxBuffer;
  }
  if (format === 'pdf') {
    return convertDocxToPdfBuffer(docxBuffer);
  }
  throw new Error(`Unsupported format: ${format}`);
}

module.exports = { createPaymentRequestBuffer, buildDoc };
