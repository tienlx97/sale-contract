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
} = require('docx');
const fs = require('fs');

const libre = require('libreoffice-convert');

const { formatDayMonthYear, toOrdinal, amountInWordsCurrencyFirst } = require('../utils/toWordData');
const { createDocument } = require('../utils/createDocument');
const { FONT, TABLE_DEFAULTS, COLS, BORDER_NONE, USABLE_WIDTH, scaleColumnsTo } = require('../utils/docx-config');
const { hbsMdToRuns } = require('../utils/hbsMdToRuns');
const { bankAccoutTable } = require('./contract/tables');

const rowLabelSepValue2 = (
  label,
  value,
  { boldKey = false, boldValue = false, caplockKey = false, caplockValue = false, size } = {}
) =>
  new TableRow({
    children: [
      new TableCell({
        borders: BORDER_NONE,
        children: [
          new Paragraph({
            children: hbsMdToRuns(label, undefined, { caplock: caplockKey, bold: boldKey, size }),
          }),
        ],
      }),
      new TableCell({
        borders: BORDER_NONE,
        children: [
          new Paragraph({
            children: hbsMdToRuns(value, undefined, { caplock: caplockValue, bold: boldValue, size }),
          }),
        ],
      }),
    ],
  });

const createPartyTable = ({ company, address }) => [
  new Table({
    ...TABLE_DEFAULTS,
    layout: TableLayoutType.FIXED,
    columnWidths: [3500, 7500],
    rows: [
      rowLabelSepValue2('TO', company, { caplockValue: true, boldValue: true, boldKey: true }),
      rowLabelSepValue2('ADDRESS', address, { boldValue: true, boldKey: true }),
    ],
  }),
];

const formatCurrency = (currency) => {
  const formatted = currency.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatted;
};

const signinTable = () => {
  const tableWidth = USABLE_WIDTH;
  const cols = scaleColumnsTo([3000, 4000], tableWidth);
  return [
    new Table({
      ...TABLE_DEFAULTS,
      layout: TableLayoutType.FIXED,
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: cols,
      rows: [
        rowLabelSepValue2(
          '',
          'DAI NGHIA INDUSTRIAL MECHANICS CO., LTD',
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
        rowLabelSepValue2('', 'Mr. Le Xuan Nghia', {
          boldValue: true,
          boldKey: true,
          size: FONT.SIZE_12,
        }),
        rowLabelSepValue2('', 'General Director', {
          boldValue: true,
          boldKey: true,
          size: FONT.SIZE_12,
        }),
      ],
    }),
  ];
};

const original = ['_', 'First', 'Second', 'Third', 'FOURTH', 'FIFTH'];

const buildDoc = async (contractBody) => {
  const { signDate, contractSignedDate, payment, no, contractNo, company, address, bank } = contractBody;

  const signedDateInWords = formatDayMonthYear(signDate);
  const contractsignedDateInWords = formatDayMonthYear(contractSignedDate);
  const paymentValue = formatCurrency(payment.value);

  const paymentInWordsValue = amountInWordsCurrencyFirst(payment.value, 'USD');

  const doc = createDocument({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: `Ho Chi Minh, ${signedDateInWords}` })],
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: `PAYMENT REQUEST`,
            allCaps: true,
            bold: true,
            size: FONT.SIZE_17,
          }),
        ],
      }),
      //
      new Paragraph({
        children: [
          new TextRun({
            text: 'No: ',
            bold: true,
          }),
          new TextRun({
            text: no,
            bold: true,
          }),
        ],
      }),
      ...createPartyTable({ company, address }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'We sincerely appreciate your trust and cooperation in using our products and services',
          }),
        ],
      }),
      new Paragraph({
        children: hbsMdToRuns(
          `Based on Contract No. **{{contractNo}}** dated {{contractsignedDateInWords}} between **{{company}}** and **DAI NGHIA INDUSTRIAL MECHANICS CO., LTD**, and pursuant to Article 4 – Contract Value and Payment Terms, we hereby request payment as follows:`,
          { contractNo, company, contractsignedDateInWords }
        ),
      }),

      new Paragraph({
        children: hbsMdToRuns('**Amount requested:** USD {{paymentValue}}', { paymentValue }),
      }),

      new Paragraph({
        children: hbsMdToRuns('**In words:** {{paymentInWordsValue}}', { paymentInWordsValue }),
      }),

      new Paragraph({
        children: hbsMdToRuns(
          '**Reason for payment**: The {{original1}} compensation payment for termination of contract no {{contractNo}}',
          { contractNo, original1: original[payment.num] }
        ),
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: `Please pay through the following account:`,
            bold: true,
          }),
        ],
      }),

      ...bankAccoutTable(bank, 0),

      new Paragraph({
        children: [
          new TextRun({
            text: `Wish to receive your support soon. Yours Faithfully`,
          }),
        ],
      }),

      ...signinTable(),
    ],
  });

  const docxBuffer = await Packer.toBuffer(doc);
  fs.writeFileSync('file.docx', docxBuffer);
};

/** Convert DOCX buffer -> PDF buffer using LibreOffice (if available) */
async function convertDocxToPdfBuffer(docxBuffer) {
  if (!libre) throw new Error('PDF conversion requires libreoffice-convert and LibreOffice installed');
  return new Promise((resolve, reject) => {
    libre.convert(docxBuffer, '.pdf', undefined, (err, done) => (err ? reject(err) : resolve(done)));
  });
}

/**
 * Main: return Buffer (docx or pdf)
 * @param {Object} contractBody
 * @param {{format?: 'docx'|'pdf'}} options
 */
async function createPaymentRequestBuffer(contractBody, options = {}) {
  const { format = 'pdf' } = options;
  const doc = await buildDoc(contractBody);
  const docxBuffer = await Packer.toBuffer(doc);
  fs.writeFileSync('file.docx', docxBuffer);
  if (format === 'docx') {
    return docxBuffer;
  }
  if (format === 'pdf') {
    return convertDocxToPdfBuffer(docxBuffer);
  }
  throw new Error(`Unsupported format: ${format}`);
}

module.exports = { createPaymentRequestBuffer, buildDoc };
