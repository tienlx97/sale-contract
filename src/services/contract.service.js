/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');
const fs = require('fs');
const libre = require('libreoffice-convert');
const { FONT, PARAGRAPH_SPACING, PAGE, INDENT } = require('./contract/docx-config');
const { numberingConfig } = require('./contract/numbering');
const { createHeaderImageParagraph } = require('./contract/header');
const {
  projectDetailTable,
  bankAccoutTable,
  signinTable,
  createPartyATable,
  createPartyBTable,
  requireDocumentTable,
} = require('./contract/tables');
const { createFooter } = require('./contract/footer');
const { hbsMdToRuns } = require('../utils/hbsMdToRuns');
const { DEFAULT_CONTRACT_VALUE } = require('../constant/contract');
const {
  formatDayMonthYear,
  formatTheDayOf,
  isoToDDMMYYYY,
  percentToWords,
  amountInWordsCurrencyFirst,
  numberToWords,
} = require('../utils/toWordData');

/**
 * Convert intent number to left indent in DXA.
 * - intent = 1  -> thụt 1 bậc
 * - intent = 2  -> thụt 2 bậc, v.v.
 * Ưu tiên dùng INDENT.STEP nếu bạn định nghĩa; mặc định 720 twips (~0.5")
 */
function indentFromIntent(intent = 1) {
  // L1_LEFT: 1 * DXA.INCH, // 1.0"
  // L1_GAP: 0.5 * DXA.INCH, // 0.5"
  // L2_LEFT_FROM_L1_TEXT: 1 * DXA.INCH + 0.5 * DXA.INCH, // align with L1 text col
  // L2_GAP: 0.5 * DXA.INCH,
  // BULLET_LEFT: 1 * DXA.INCH + 0.5 * DXA.INCH + 0.25 * DXA.INCH,
  // BULLET_GAP: 0.25 * DXA.INCH,

  switch (intent) {
    case 1:
      return INDENT.L1_LEFT;
    default:
      break;
  }
}

/**
 * Convert a block structure into docx Paragraphs
 * @param {object} article
 * @returns {Paragraph[]}
 */
function renderArticle(article, data = {}) {
  const out = [];

  if (article.title) {
    out.push(
      new Paragraph({
        numbering: { reference: 'article-numbering', level: 0 },
        children: [
          new TextRun({
            text: article.title,
            allCaps: true,
            bold: true,
            color: FONT.COLOR_BLACK,
            size: FONT.SIZE_15,
          }),
        ],
      })
    );
  }

  for (const b of article.block || []) {
    out.push(
      new Paragraph({
        ...(b.level !== undefined && { numbering: { reference: 'article-numbering', level: b.level } }),
        ...(b.intent !== undefined && { indent: { left: indentFromIntent(b.intent) } }),
        children: hbsMdToRuns(String(b.text || ''), data),
      })
    );

    // eslint-disable-next-line no-loop-func
    (b.items?.val || []).forEach((raw) => {
      out.push(
        new Paragraph({
          ...(b.items.level !== undefined && { numbering: { reference: 'article-numbering', level: b.items.level } }),
          ...(b.items.intent !== undefined && { indent: { left: indentFromIntent(b.items.intent) } }),
          children: hbsMdToRuns(raw, data),
        })
      );
    });
  }

  return out;
}

const formatCurrency = (currency) => {
  const formatted = currency.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatted;
};

function createPaymentArticle({ appendPayments, commercial, payments }, { formatContractValue }) {
  const appendPaymentArr = [];

  const contractValueInWords = amountInWordsCurrencyFirst(
    commercial.contractValue.value,
    commercial.contractValue.currencyCode
  );

  if (appendPayments) {
    appendPayments.forEach((append) => {
      const percentInWords = percentToWords(append.percent);
      const contractValue = formatContractValue;
      const paymentValue = formatCurrency((commercial.contractValue.value / 100) * append.percent);
      const paymentInWordsValue = amountInWordsCurrencyFirst(
        (commercial.contractValue.value / 100) * append.percent,
        commercial.contractValue.currencyCode
      );

      appendPaymentArr.push(
        new Paragraph({
          numbering: { reference: 'article-numbering', level: 2 },
          children: hbsMdToRuns(append.paymentPercentText, {
            appendPayments,
            percentInWords,
          }),
        }),
        new Paragraph({
          indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
          children: hbsMdToRuns(append.paymentValueText, {
            appendPayments,
            commercial,
            contractValue,
            paymentValue,
          }),
        }),
        new Paragraph({
          indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
          children: hbsMdToRuns(append.moneyTextInword, { paymentInWordsValue }),
        }),
        new Paragraph({
          indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
          children: hbsMdToRuns(append.termText, { appendPayments }),
        })
      );
    });
  }

  const createPayment = (p) => {
    const { days, term, percent } = p;
    const percentInWords = percentToWords(percent);
    const currency = commercial.contractValue.currencyCode;
    const contractValue = formatContractValue;
    const paymentValue = formatCurrency((commercial.contractValue.value / 100) * percent);
    const paymentInWords = amountInWordsCurrencyFirst(
      (commercial.contractValue.value / 100) * percent,
      commercial.contractValue.currencyCode
    );

    const daysInWords = numberToWords(days, {
      capitalizeFirst: false,
    });

    return [
      new Paragraph({
        numbering: { reference: 'article-numbering', level: 2 },
        children: hbsMdToRuns(p.format.paymentPercentText, { percentInWords, percent }),
      }),
      new Paragraph({
        indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
        children: hbsMdToRuns(p.format.paymentValueText, {
          currency,
          contractValue,
          percent,
          paymentValue,
        }),
      }),
      new Paragraph({
        indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
        children: hbsMdToRuns(p.format.moneyTextInword, { paymentInWords }),
      }),
      new Paragraph({
        indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
        children: hbsMdToRuns(p.format.termText, { term, daysInWords, days }),
      }),
      new Paragraph({
        indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
        children: hbsMdToRuns(p.format.endText),
      }),
    ];
  };

  return [
    // ARTICLE 4: CONTRACT VALUE AND PAYMENT TERMS
    new Paragraph({
      numbering: { reference: 'article-numbering', level: 0 },
      children: [
        new TextRun({
          text: 'CONTRACT VALUE AND PAYMENT TERMS',
          bold: true,
          size: FONT.SIZE_15,
        }),
      ],
    }),
    new Paragraph({
      numbering: { reference: 'article-numbering', level: 1 },
      children: [
        new TextRun({
          text: 'Contract Value',
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      indent: { left: INDENT.L1_LEFT },
      children: hbsMdToRuns(DEFAULT_CONTRACT_VALUE.format.contractValueText, {
        commercial,
        formatContractValue,
        contractValueInWords,
      }),
    }),
    new Paragraph({
      indent: { left: INDENT.L1_LEFT },
      children: hbsMdToRuns(DEFAULT_CONTRACT_VALUE.format.contractValueInWord, {
        contractValueInWords,
      }),
    }),
    new Paragraph({
      indent: { left: INDENT.L1_LEFT },
      children: hbsMdToRuns(DEFAULT_CONTRACT_VALUE.format.contractDeliveryTermText, {
        commercial,
      }),
    }),
    new Paragraph({
      indent: { left: INDENT.L1_LEFT },
      children: hbsMdToRuns(DEFAULT_CONTRACT_VALUE.format.incotermRule[commercial.incoterm.rule]),
    }),
    new Paragraph({
      indent: { left: INDENT.L1_LEFT },
      children: [
        new TextRun({
          text: 'The unit rates for steel structure and materials shall conform to the standards and specifications as listed in the attached material list. Any changes to materials, or clarification following technical discussions with Party A, may result in adjusted pricing by Party B.',
        }),
      ],
    }),
    new Paragraph({
      numbering: { reference: 'article-numbering', level: 1 },
      children: [
        new TextRun({
          text: 'Payment Terms',
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      indent: { left: INDENT.L1_LEFT },
      children: [
        new TextRun({
          text: 'Party A shall make payment to Party B in the following:',
        }),
      ],
    }),
    ...createPayment(payments[0]),
    ...createPayment(payments[1]),
    // =======================
    ...appendPaymentArr,
  ];
}

/**
 * Create a contract
 * @param {Object} contractBody
 */
const buildDoc = async (contractBody) => {
  // eslint-disable-next-line no-param-reassign

  // eslint-disable-next-line no-unused-vars
  const { appendPayments, commercial, headerImagePath, info, parties, payments, periods, quotationDate, signDate } =
    contractBody;

  let transportationLocation;

  switch (commercial.incoterm.rule) {
    case 'DDP':
      transportationLocation = 'site';

      break;
    case 'EXW':
    case 'CIF':
    case 'FOB':
      transportationLocation = commercial.incoterm.location;
      break;

    default:
      transportationLocation = commercial.incoterm.location;
      break;
  }

  const formatContractValue = formatCurrency(commercial.contractValue.value);
  // const formatPayment1 = formatCurrency((commercial.contractValue.value / 100) * payments[0].percent);
  // const formatPayment2 = formatCurrency((commercial.contractValue.value / 100) * payments[1].percent);

  const signedDateInWords = {
    t1: formatDayMonthYear(signDate),
    t2: formatTheDayOf(signDate),
  };

  const quotationDateInWords = {
    t1: formatDayMonthYear(quotationDate),
    t2: isoToDDMMYYYY(signDate),
  };

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

    numbering: numberingConfig,

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
        children: [
          createHeaderImageParagraph(headerImagePath),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: `Ho Chi Minh, ${signedDateInWords.t1}` })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: DEFAULT_CONTRACT_VALUE.dump.contractTitle,
                allCaps: true,
                bold: true,
                size: FONT.SIZE_18,
              }),
            ],
          }),
          ...projectDetailTable(info),
          new Paragraph({
            children: hbsMdToRuns(DEFAULT_CONTRACT_VALUE.dump[1], {
              signDate: signedDateInWords.t2,
              partyBCompany: parties.B.company.value,
            }),
          }),
          ...createPartyATable(parties.A),
          ...createPartyBTable(parties.B),
          new Paragraph({
            children: hbsMdToRuns(DEFAULT_CONTRACT_VALUE.dump[2]),
          }),

          new Paragraph({
            numbering: { reference: 'article-numbering', level: 0 },
            children: [
              new TextRun({
                text: DEFAULT_CONTRACT_VALUE.article.articleObjectOfcontract.title_,
                allCaps: true,
                bold: true,
                color: FONT.COLOR_BLACK,
                size: FONT.SIZE_15,
              }),
            ],
          }),
          // new Paragraph({
          //   numbering: { reference: 'article-numbering', level: 1 },
          //   children: [
          //     new TextRun({
          //       text: DEFAULT_CONTRACT_VALUE.article.articleObjectOfcontract.b1,
          //       bold: true,
          //     }),
          //   ],
          // }),
          // ...projectWorkDetailTable({ projectWorkDetails, quotationDate: quotationDate.text2 }, INDENT.L1_LEFT),
          ...renderArticle(DEFAULT_CONTRACT_VALUE.article.articleObjectOfcontract, {
            quotationDate: quotationDateInWords.t1,
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 0 },
            children: [
              new TextRun({
                text: DEFAULT_CONTRACT_VALUE.article.articleDocumentAttachToTheContract.title_,
                bold: true,
                size: FONT.SIZE_15,
              }),
            ],
          }),
          ...renderArticle(DEFAULT_CONTRACT_VALUE.article.articleDocumentAttachToTheContract, {
            quotationDate: quotationDateInWords.t2,
          }),
          ...renderArticle(DEFAULT_CONTRACT_VALUE.article.articleContractPeriod, {
            periods,
            transportationLocation,
          }),
          ...createPaymentArticle({ appendPayments, commercial, payments }, { formatContractValue }),

          // //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Bank Information',
                bold: true,
              }),
            ],
          }),
          ...bankAccoutTable(commercial.bank),

          ...requireDocumentTable(commercial.documents),

          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Packing',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: hbsMdToRuns(DEFAULT_CONTRACT_VALUE.packing),
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Consignee',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: hbsMdToRuns(commercial.consignee.company),
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: hbsMdToRuns(commercial.consignee.address),
          }),
          // //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Notify Party',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: hbsMdToRuns(commercial.notifyParty.company),
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: hbsMdToRuns(commercial.notifyParty.address),
          }),
          // //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Port of shipment',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: hbsMdToRuns(commercial.pol),
          }),
          // //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Port of destination',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: hbsMdToRuns(commercial.pod),
          }),
          //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Shipment terms',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: hbsMdToRuns(commercial.shipmentTerms),
          }),
          // //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Partial Shipments and Transshipment',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: 'Partial shipments: Allowed',
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: 'Transshipment: Allowed',
              }),
            ],
          }),

          ...renderArticle(DEFAULT_CONTRACT_VALUE.article.articleauthorityAndResponsibilitiesOfPartyA),
          ...renderArticle(DEFAULT_CONTRACT_VALUE.article.articleauthorityAndResponsibilitiesOfPartyB),
          ...renderArticle(DEFAULT_CONTRACT_VALUE.article.articleWarranty),
          ...renderArticle(DEFAULT_CONTRACT_VALUE.article.articleTermination),
          ...renderArticle(DEFAULT_CONTRACT_VALUE.article.articleLiquidation),
          ...renderArticle(DEFAULT_CONTRACT_VALUE.article.forceMajeure),
          ...renderArticle(DEFAULT_CONTRACT_VALUE.article.commonArticle),
          new Paragraph({}),
          //
          ...signinTable({
            partyA: {
              company: parties.A.company.value,
              representedBy: parties.A.representedBy.value,
              position: parties.A.position.value,
            },
            partyB: {
              company: parties.B.company.value,
              representedBy: parties.B.representedBy.value,
              position: parties.B.position.value,
            },
          }),
        ],
      },
    ],
  });

  return doc;
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
async function createContractBuffer(contractBody, options = {}) {
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

module.exports = { createContractBuffer };
