/* eslint-disable no-use-before-define */
const {
  Document,
  Packer,
  Paragraph,
  AlignmentType,
  TextRun,
  LineRuleType,
  LevelFormat,
  LevelSuffix,
  BorderStyle,
  TableRow,
  TableCell,
  WidthType,
  Table,
  TableLayoutType,
  ImageRun,
} = require('docx');
const fs = require('fs');
const { imageSize } = require('image-size');

/**
 * Create a contract
 * @param {Object} contractBody
 */
const createContract = async (contractBody) => {
  // eslint-disable-next-line no-unused-vars
  const { incoterm, signDate, contractDetails, contractNo, partyA, partyADetail, partyB, partyBDetail, projectWorkDetails } =
    contractBody;

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 24, // 12pt
          },
          paragraph: {
            spacing: {
              line: 240,
              lineRule: LineRuleType.AUTO,
              before: 120, // 6pt
              after: 120, // 6pt
            },
          },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: 'article-numbering',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: 'ARTICLE %1:',
              alignment: AlignmentType.LEFT,

              style: {
                run: { bold: true, color: '000000', size: 28 },
              },
            },
            {
              level: 1,
              format: LevelFormat.DECIMAL,
              text: '%1.%2',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 1440, hanging: 720 },
                },
                run: { bold: true, color: '000000', size: 24 },
              },
            },
            {
              level: 2,
              format: LevelFormat.LOWER_ROMAN,
              text: '(%3)',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 2160, hanging: 720 },
                },
                run: { bold: true, color: '000000', size: 24 },
              },
            },
            {
              level: 3,
              format: LevelFormat.BULLET,
              text: '•', // bullet marker
              suffix: LevelSuffix.SPACE,
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 2520, hanging: 360 },
                },
                run: { bold: true, color: '000000', size: 24 },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 708, right: 567, bottom: 708, left: 567 }, // 1.25/1/1.25/1 cm
          },
        },
        children: [
          createDNCHeader('assets/header/1.png'),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Ho Chi Minh, ${signDate.text1}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'CONTRACT FOR SUPPLY OF STEEL STRUCTURE',
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `No: ${contractNo}`,
                bold: true,
                size: 28,
                color: 'FF0000',
              }),
            ],
          }),
          createProjectDetail(contractDetails),
          new Paragraph({
            children: [
              new TextRun(
                `This Contract is entered into on ${signDate.text2} at the office of DAI NGHIA INDUSTRIAL MECHANICS CO., LTD between the two parties:`
              ),
            ],
          }),
          createPartyTable(partyA, partyADetail),
          new Paragraph({
            children: [
              new TextRun('(Hereinafter referred to as '),
              new TextRun({
                text: 'Party A',
                bold: true,
              }),
              new TextRun(')'),
            ],
          }),
          //
          new Paragraph({
            children: [new TextRun('___')],
          }),
          //
          createPartyTable(partyB, partyBDetail),
          new Paragraph({
            children: [
              new TextRun('(Hereinafter referred to as '),
              new TextRun({
                text: 'Party B',
                bold: true,
              }),
              new TextRun(')'),
            ],
          }),
          //
          new Paragraph({
            children: [
              new TextRun('After negotiation, both parties have mutually agreed to sign this contract (“'),
              new TextRun({
                text: 'Contract',
                bold: true,
              }),
              new TextRun('”) with the following terms and conditions:'),
            ],
          }),
          //
          new Paragraph({}),
          //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 0 },
            children: [
              new TextRun({
                text: 'THE OBJECT OF THE CONTRACT',
                bold: true,
                color: '000000',
                size: 28,
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Party A agrees to engage Party B for the supply and execution of steel structure works as described below:',
                bold: true,
                size: 24,
              }),
              new TextRun({ break: 1 }),
              //
            ],
            numbering: {
              reference: 'article-numbering',
              level: 1,
            },
          }),
          createProjectWorkDetailTable({
            projectName: projectWorkDetails.projectName,
            item: projectWorkDetails.item,
            location: projectWorkDetails.location,
            quotationDate: projectWorkDetails.quotationDate,
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
            ],
          }),
          new Paragraph({}),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Detailed scope of works is as follows:',
                bold: true,
                size: 24,
              }),
            ],
            numbering: {
              reference: 'article-numbering',
              level: 1,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Party B carries out the following works:',
                size: 24,
              }),
            ],
            numbering: {
              reference: 'article-numbering',
              level: 2,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Steel structure',
                size: 24,
              }),
            ],
            numbering: {
              reference: 'article-numbering',
              level: 3,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Any work not expressly specified herein or not shown in the approved drawings shall be excluded from the scope of this Contract.',
                size: 24,
              }),
            ],
            numbering: {
              reference: 'article-numbering',
              level: 2,
            },
          }),
          new Paragraph({}),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 0 },
            children: [
              new TextRun({
                text: 'DOCUMENTS ATTACHED TO THE CONTRACT',
                bold: true,
                color: '000000',
                size: 28,
              }),
            ],
          }),

          new Paragraph({
            indent: { left: 2160 },
            children: [
              new TextRun({
                text: 'Quotation date: ',
                italics: true,
                bold: true,
                color: '000000',
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync('file.docx', buf);
  // eslint-disable-next-line no-console
  console.log('Document created successfully!');
};

const borderNone = {
  top: { style: BorderStyle.NONE },
  bottom: { style: BorderStyle.NONE },
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
};

const PROJECT_DETAIL_COLUMN_WIDTHS = [3500, 400, 7500];
const PARTY_DETAIL_COLUMN_WIDTHS = [3500, 400, 7500];

const createProjectDetailRow = (label, value) =>
  new TableRow({
    children: [
      new TableCell({
        borders: borderNone,
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
      }),
      new TableCell({
        borders: borderNone,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: ':', bold: true })],
          }),
        ],
      }),
      new TableCell({
        borders: borderNone,
        children: [new Paragraph({ children: [new TextRun({ text: value })] })],
      }),
    ],
  });

const createProjectDetail = (contractDetails) => {
  return new Table({
    width: { size: 70, type: WidthType.PERCENTAGE }, // table stretches to page width
    layout: TableLayoutType.FIXED, // respect columnWidths
    columnWidths: PROJECT_DETAIL_COLUMN_WIDTHS, // applies to ALL rows
    alignment: AlignmentType.CENTER,
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [...contractDetails.map((cd) => createProjectDetailRow(cd.key, cd.value))],
  });
};

const createPartyDetailRow = (label, value, opt = {}) =>
  new TableRow({
    children: [
      new TableCell({
        borders: borderNone,
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: opt.bold })] })],
      }),
      new TableCell({
        borders: borderNone,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: ':', bold: opt.bold })],
          }),
        ],
      }),
      new TableCell({
        borders: borderNone,
        children: [new Paragraph({ children: [new TextRun({ text: value, bold: opt.bold })] })],
      }),
    ],
  });

const createProjectWorkDetailRow = ({ projectName, item, location, quotationDate }) => [
  new TableRow({
    children: [
      new TableCell({
        borders: borderNone,
        children: [new Paragraph({ children: [new TextRun({ text: `*. Project` })] })],
      }),
      new TableCell({
        borders: borderNone,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: ':' })],
          }),
        ],
      }),
      new TableCell({
        borders: borderNone,
        children: [new Paragraph({ children: [new TextRun({ text: projectName, bold: true, allCaps: true })] })],
      }),
    ],
  }),
  new TableRow({
    children: [
      new TableCell({
        borders: borderNone,
        children: [new Paragraph({ children: [new TextRun({ text: `*. Item` })] })],
      }),
      new TableCell({
        borders: borderNone,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: ':' })],
          }),
        ],
      }),
      new TableCell({
        borders: borderNone,
        children: [new Paragraph({ children: [new TextRun({ text: item, bold: true, allCaps: true })] })],
      }),
    ],
  }),
  new TableRow({
    children: [
      new TableCell({
        borders: borderNone,
        children: [new Paragraph({ children: [new TextRun({ text: `*. Item` })] })],
      }),
      new TableCell({
        borders: borderNone,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: ':' })],
          }),
        ],
      }),
      new TableCell({
        borders: borderNone,
        children: [new Paragraph({ children: [new TextRun({ text: item, bold: true })] })],
      }),
    ],
  }),
  new TableRow({
    children: [
      new TableCell({
        borders: borderNone,
        children: [new Paragraph({ children: [new TextRun({ text: `*. Location` })] })],
      }),
      new TableCell({
        borders: borderNone,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: ':' })],
          }),
        ],
      }),
      new TableCell({
        borders: borderNone,
        children: [new Paragraph({ children: [new TextRun({ text: location, bold: true, allCaps: true })] })],
      }),
    ],
  }),
  new TableRow({
    children: [
      new TableCell({
        borders: borderNone,
        children: [new Paragraph({ children: [new TextRun({ text: `*. Volume of works` })] })],
      }),
      new TableCell({
        borders: borderNone,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: ':' })],
          }),
        ],
      }),
      new TableCell({
        borders: borderNone,
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
];

const createPartyTable = (partyName, partyDetails) => {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, // table stretches to page width
    layout: TableLayoutType.FIXED, // respect columnWidths
    columnWidths: PARTY_DETAIL_COLUMN_WIDTHS, // applies to ALL rows
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      createPartyDetailRow(partyName.key, partyName.value, partyName.markup),
      ...partyDetails.map((cd) => createPartyDetailRow(cd.key, cd.value, cd.markup)),
    ],
  });
};

const createDNCHeader = (headerPathName) => {
  // Read image as Buffer
  const dncHeader = fs.readFileSync(headerPathName);

  // image-size@2.x => pass Buffer (or ArrayBuffer), not a path string
  const dimensions = imageSize(dncHeader); // { width, height, type }
  if (!dimensions || !dimensions.width || !dimensions.height) {
    throw new Error('Cannot read image dimensions');
  }

  // Page/margins in twips (A4 width ≈ 11907 twips; 1 cm ≈ 567 twips)
  const pageWidthTwips = 11907;
  const marginLeft = 567; // 1 cm
  const marginRight = 567; // 1 cm
  const usableWidthTwips = pageWidthTwips - marginLeft - marginRight;

  // Convert twips→px (approx): 1 px ≈ 15 twips (96 DPI)
  const usableWidthPx = Math.floor(usableWidthTwips / 15);

  // Keep aspect ratio; avoid upscaling past natural width
  const naturalW = dimensions.width;
  const naturalH = dimensions.height;
  const targetW = Math.min(usableWidthPx, naturalW);
  const targetH = Math.round((naturalH / naturalW) * targetW);

  return new Paragraph({
    children: [
      new ImageRun({
        data: dncHeader,
        transformation: {
          width: targetW, // fill usable page width (minus margins)
          height: targetH, // proportional
        },
      }),
    ],
  });
};

const createProjectWorkDetailTable = (projectWorkDetails) => {
  const A4_WIDTH = 11907; // twips
  const MARGIN_LEFT = 567; // ~1 cm
  const MARGIN_RIGHT = 567; // ~1 cm
  const USABLE = A4_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  const INDENT = 1440; // 1 inch
  const TABLE_WIDTH = USABLE - INDENT;

  // cột gốc (DXA). Ta sẽ scale cho khớp TABLE_WIDTH
  const BASE_COLS = [3500, 400, 7500];
  const sum = BASE_COLS.reduce((a, b) => a + b, 0);
  const SCALE = TABLE_WIDTH / sum;
  const COLS = BASE_COLS.map((w) => Math.floor(w * SCALE));

  return new Table({
    // ❗ dùng DXA thay vì 100%
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: COLS, // đã scale vừa TABLE_WIDTH
    indent: { size: INDENT, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: createProjectWorkDetailRow(projectWorkDetails),
  });
};

module.exports = { createContract };
