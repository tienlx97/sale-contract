const { Document } = require('docx');
const { FONT, PARAGRAPH_SPACING, PAGE } = require('./docx-config');
const { createFooter } = require('./footer');
const { createHeader } = require('./docx.util');

const createDocument = ({ children, numbering }) => {
  return new Document({
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

    numbering,

    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: 'PORTRAIT',
            },

            margin: {
              top: PAGE.MARGIN.TOP,
              bottom: PAGE.MARGIN.BOTTOM,
              left: PAGE.MARGIN.LEFT,
              right: PAGE.MARGIN.RIGHT,
            },
          },

          titlePage: true,
        },

        footers: {
          default: createFooter(),
        },

        headers: {
          first: createHeader('assets/header/1.png'),
        },

        children,
      },
    ],
  });
};

module.exports = {
  createDocument,
};
