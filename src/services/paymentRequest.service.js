const { Packer, Document, Paragraph, AlignmentType, TextRun } = require('docx');
const fs = require('fs');

const libre = require('libreoffice-convert');
const { FONT, PARAGRAPH_SPACING, PAGE } = require('./contract/docx-config');
const { createFooter } = require('./contract/footer');
const { createHeader } = require('../utils/docx.util');

const { formatDayMonthYear, toOrdinal } = require('../utils/toWordData');
const { createPartyTable } = require('./payment/tables');

const buildDoc = async (contractBody) => {
  const { signDate, payment, no, company, address } = contractBody;

  const ordinalPaymentNum = toOrdinal(payment.num);
  const signedDateInWords = formatDayMonthYear(signDate);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT.FAMILY,
            size: FONT.SIZE_13,
          },
          paragraph: {
            spacing: PARAGRAPH_SPACING,
          },
        },
      },
    },

    //

    sections: [
      {
        properties: {
          page: {
            margin: {
              top: PAGE.MARGIN.TOP,
              right: PAGE.MARGIN.RIGHT,
              bottom: PAGE.MARGIN.BOTTOM,
              left: PAGE.MARGIN.LEFT,
            },
          },
        },

        footers: {
          default: createFooter(),
        },

        headers: {
          default: createHeader('assets/header/1.png'),
        },

        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: `Ho Chi Minh, ${signedDateInWords}` })],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `PAYMENT REQUEST – ${ordinalPaymentNum} INSTALLMENT`,
                    allCaps: true,
                    bold: true,
                    size: FONT.SIZE_18,
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
              //

              // createPartyTable(company, address),
            ],
          }),
        ],
      },
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
