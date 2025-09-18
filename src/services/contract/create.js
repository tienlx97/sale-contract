// row.js
const { TableRow, TableCell, BorderStyle, Paragraph, TextRun, AlignmentType } = require('docx');

const borderNone = {
  top: { style: BorderStyle.NONE },
  bottom: { style: BorderStyle.NONE },
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
};

const COLUMN_WIDTHS = [3500, 400, 7500];

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

module.exports = { createProjectDetailRow, COLUMN_WIDTHS };
