/* eslint-disable no-unused-vars */
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  ImageRun,
  AlignmentType,
  TextRun,
  Table,
  WidthType,
  BorderStyle,
  TableLayoutType,
  LineRuleType,
} = require('docx');
const fs = require('fs');
const { imageSize } = require('image-size');
const { createProjectDetailRow, COLUMN_WIDTHS } = require('./contract/create');

/**
 * Create a contract
 * @param {Object} contractBody
 */
const createContract = async (contractBody) => {
  // eslint-disable-next-line no-unused-vars
  const { incoterm, signDate, contractDetails, contractNo } = contractBody;

  // const headerPath = path.resolve('assets/header/1.png');

  // // Read image as Buffer
  // const dncHeader = fs.readFileSync(headerPath);

  // // image-size@2.x => pass Buffer (or ArrayBuffer), not a path string
  // const dimensions = imageSize(dncHeader); // { width, height, type }
  // if (!dimensions || !dimensions.width || !dimensions.height) {
  //   throw new Error('Cannot read image dimensions');
  // }

  // // Page/margins in twips (A4 width ≈ 11907 twips; 1 cm ≈ 567 twips)
  // const pageWidthTwips = 11907;
  // const marginLeft = 567; // 1 cm
  // const marginRight = 567; // 1 cm
  // const usableWidthTwips = pageWidthTwips - marginLeft - marginRight;

  // // Convert twips→px (approx): 1 px ≈ 15 twips (96 DPI)
  // const usableWidthPx = Math.floor(usableWidthTwips / 15);

  // // Keep aspect ratio; avoid upscaling past natural width
  // const naturalW = dimensions.width;
  // const naturalH = dimensions.height;
  // const targetW = Math.min(usableWidthPx, naturalW);
  // const targetH = Math.round((naturalH / naturalW) * targetW);

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
              line: 240, // single
              lineRule: LineRuleType.AUTO, // important on some Word versions
              after: 120, // remove extra space after
              before: 120, // remove extra space before
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 708, right: 567, bottom: 708, left: 567 }, // 1.25/1/1.25/1 cm
          },
        },
        children: [
          // 1. Header
          // new Paragraph({
          //   children: [
          //     new ImageRun({
          //       data: dncHeader,
          //       transformation: {
          //         width: targetW, // fill usable page width (minus margins)
          //         height: targetH, // proportional
          //       },
          //     }),
          //   ],
          // }),
          // 2.
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Ho Chi Minh, ${signDate.text1}`,
                size: 24,
              }),
            ],
          }),

          // 3. Title
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
          // 4. Contract n.o
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `No: ${contractNo}`,
                bold: true,
                size: 28,
                color: '#FF0000',
              }),
            ],
          }),

          // 5. Table:
          // Project: {project_name}
          // Item: {item}
          // Location: {contract_country}
          new Table({
            width: { size: 70, type: WidthType.PERCENTAGE }, // table stretches to page width
            layout: TableLayoutType.FIXED, // respect columnWidths
            columnWidths: COLUMN_WIDTHS, // applies to ALL rows
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
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.resolve('example.docx'), buffer);
  // eslint-disable-next-line no-console
  console.log('Document created successfully!');
};

module.exports = { createContract };
