const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Footer,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  PageNumber,
  WidthType,
} = require('docx');
const fs = require('fs');
const { FONT, PARAGRAPH_SPACING, PAGE, INDENT, BORDER_NONE } = require('./contract/docx-config');
const { numberingConfig } = require('./contract/numbering');
const { createHeaderImageParagraph } = require('./contract/header');
const { projectWorkDetailTable, projectDetailTable, createPartyTable } = require('./contract/tables');
const { createFooter } = require('./contract/footer');

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
            font: FONT.FAMILY,
            size: FONT.SIZE_12,
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
          // createHeaderImageParagraph('assets/header/1.png'),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: `Ho Chi Minh, ${String(signDate?.text1 ?? '')}`, size: FONT.SIZE_12 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'SALES CONTRACT', bold: true, size: FONT.SIZE_14 })],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `No: ${String(contractNo ?? '')}`, bold: true, size: FONT.SIZE_14, color: 'FF0000' }),
            ],
          }),

          // Project detail table (center)
          projectDetailTable(contractDetails),

          // Intro text
          new Paragraph({
            children: [
              new TextRun(
                `This Contract is entered into on ${String(
                  signDate?.text2 ?? ''
                )} at the office of DAI NGHIA INDUSTRIAL MECHANICS CO., LTD between the two parties:`
              ),
            ],
          }),

          ...createPartyTable(partyA, partyADetail, 'A'),
          new Paragraph({
            children: [new TextRun('___')],
          }),
          ...createPartyTable(partyB, partyBDetail, 'B'),
          new Paragraph({
            children: [new TextRun('___')],
          }),
          new Paragraph({
            children: [
              new TextRun('After negotiation, both parties have mutually agreed to sign this contract (“'),
              new TextRun({
                text: 'Contract',
                bold: true,
              }),
              new TextRun('”) with the following terms and conditions:'),
              new TextRun({ break: 1 }),
            ],
          }),

          // ARTICLE 1
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 0 },
            children: [
              new TextRun({ text: 'THE OBJECT OF THE CONTRACT', bold: true, color: FONT.COLOR_BLACK, size: FONT.SIZE_14 }),
            ],
          }),

          // // 1.1 line (bold)
          // new Paragraph({
          //   numbering: { reference: 'article-numbering', level: 1 },
          //   children: [
          //     new TextRun({
          //       text: 'Party A agrees to engage Party B for the supply and execution of steel structure works as described below:',
          //       bold: true,
          //     }),
          //   ],
          // }),

          // // 1.1 continuation as a table aligned under L1 text
          // projectWorkDetailTable(
          //   {
          //     projectName: projectWorkDetails.projectName,
          //     item: projectWorkDetails.item,
          //     location: projectWorkDetails.location,
          //     quotationDate: projectWorkDetails.quotationDate,
          //   },
          //   INDENT.L1_LEFT
          // ),
        ],
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync('file.docx', buf);
  // eslint-disable-next-line no-console
  console.log('Document created successfully!');
};

module.exports = { createContract };
