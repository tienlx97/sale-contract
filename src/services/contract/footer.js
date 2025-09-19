const {
  Footer,
  Table,
  WidthType,
  TableRow,
  TableCell,
  Paragraph,
  AlignmentType,
  BorderStyle,
  TextRun,
  PageNumber,
} = require('docx');

const createFooter = () =>
  new Footer({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              // Trái: tên công ty (có border top)
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.LEFT,
                    border: {
                      top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                    },
                    spacing: { before: 0, after: 0 },
                    children: [new TextRun({ text: 'DAI NGHIA STEEL', bold: true })],
                  }),
                ],
              }),
              // Phải: Page X of Y (cùng border top)
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    border: {
                      top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                    },
                    spacing: { before: 0, after: 0 },
                    children: [new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES] })],
                  }),
                ],
              }),
            ],
          }),
        ],
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
      }),
    ],
  });

module.exports = { createFooter };
