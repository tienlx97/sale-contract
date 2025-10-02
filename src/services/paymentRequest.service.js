// payment-request.js
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
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
const { createDocument } = require('../utils/createDocument');
const { FONT, TABLE_DEFAULTS, BORDER_NONE, USABLE_WIDTH, scaleColumnsTo, INDENT } = require('../utils/docx-config');
const { hbsMdToRuns } = require('../utils/hbsMdToRuns');
const { bankAccoutTable } = require('./common/bank-account');

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

/** Party table */
function createPartyTable({ company, address }) {
  return [
    new Table({
      ...TABLE_DEFAULTS,
      layout: TableLayoutType.FIXED,
      columnWidths: [1000, 400, 7500],
      rows: [
        rowLabelSepValue('To', company, { caplockValue: true, boldValue: true, boldKey: true }),
        rowLabelSepValue('Address', address),
      ],
    }),
  ];
}

/** Signature block */
function signinTable() {
  const tableWidth = USABLE_WIDTH;
  const cols = scaleColumnsTo([3000, 4000], tableWidth);

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
          size: FONT.SIZE_12,
          minRowHeightTwips: 720 * 4,
          alignment: 'center',
        }),
        rowLabelSepValue2('', 'Mr. Le Xuan Nghia', {
          boldValue: true,
          boldKey: true,
          size: FONT.SIZE_12,
          alignment: 'center',
        }),
        rowLabelSepValue2('', 'General Director', {
          boldValue: true,
          boldKey: true,
          size: FONT.SIZE_12,
          alignment: 'center',
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
  const { signDate, contractSignedDate, payment, no, contractNo, company, address, bank, proformaInvoiceNo } = contractBody;

  // Defensive read
  const signedDateInWords = formatDayMonthYear(signDate);
  const contractsignedDateInWords = formatDayMonthYear(contractSignedDate);

  const paymentValue = formatCurrency(payment?.value ?? 0);
  const paymentInWordsValue = amountInWordsCurrencyFirst(payment?.value ?? 0, 'USD');

  // Prefer your util to compute ordinals (e.g., 1->First)
  const nth = toOrdinal?.(payment?.num) ?? String(payment?.num ?? '');

  const doc = createDocument({
    options: {
      size: FONT.SIZE_12,
      font: 'Times New Roman',
      numbering: {
        config: [
          // 1. Bulleted list
          {
            reference: 'bullet-list',
            levels: [
              {
                level: 0,
                format: LevelFormat.BULLET,
                text: '•',
                suffix: LevelSuffix.SPACE,
                alignment: AlignmentType.LEFT,
                style: {
                  run: { bold: true, color: FONT.COLOR_BLACK },
                  paragraph: {
                    indent: { left: INDENT.VAL['0.5'] },
                  },
                },
              },
            ],
          },
        ],
      },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: `Ho Chi Minh, ${signedDateInWords}` })],
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'PAYMENT REQUEST', allCaps: true, bold: true, size: FONT.SIZE_16 })],
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: 'No: ', bold: true }),
          new TextRun({ text: String(no ?? ''), bold: true, color: 'FF0000' }),
        ],
      }),

      ...createPartyTable({ company, address }),

      new Paragraph({
        children: [new TextRun({ text: 'Dear Sir/Madam,' })],
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'We sincerely appreciate your trust and cooperation in using our products and services.' }),
        ],
      }),

      new Paragraph({
        children: hbsMdToRuns(
          `Based on Sale Contract No. **{{contractNo}}** dated {{contractsignedDateInWords}} and Proforma Invoice No. **{{proformaInvoiceNo}}** between **{{company}}** and **DAI NGHIA INDUSTRIAL MECHANICS CO., LTD**, and pursuant to Article 4 – Contract Value and Payment Terms, we hereby request payment as follows:`,
          { contractNo, company, contractsignedDateInWords, proformaInvoiceNo }
        ),
      }),

      new Paragraph({
        numbering: { reference: 'bullet-list', level: 0 },
        children: hbsMdToRuns('**Amount requested:** USD {{paymentValue}}', { paymentValue }),
      }),
      new Paragraph({
        numbering: { reference: 'bullet-list', level: 0 },
        children: hbsMdToRuns('**In words:** {{paymentInWordsValue}}', { paymentInWordsValue }),
      }),

      new Paragraph({
        numbering: { reference: 'bullet-list', level: 0 },
        children: hbsMdToRuns(
          '**Reason for payment**: The {{nth}} installment payment for goods under Sales Contract No. {{contractNo}}',
          { nth, contractNo }
        ),
      }),

      new Paragraph({
        children: [new TextRun({ text: 'Please remit payment to the following account:', bold: true, underline: true })],
      }),

      ...bankAccoutTable(bank, 0),

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
