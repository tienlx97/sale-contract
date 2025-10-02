const { Document } = require('docx');
const { FONT, PARAGRAPH_SPACING, PAGE } = require('./docx-config');
const { createFooter } = require('./footer');
const { createHeader, createHeaderV2 } = require('./docx.util');

const createDocument = ({ children, options = {} }) => {
  const { font = FONT.FAMILY, size = FONT.SIZE_13, numbering } = options;

  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font,
            size,
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

const createDocumentV2 = ({ children, options = {} }) => {
  const { numbering } = options;

  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT.FAMILY,
            size: FONT.SIZE_13,
          },
          paragraph: {
            spacing: {
              line: 360,
            },
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
              top: PAGE.MARGIN_V2.TOP,
              bottom: PAGE.MARGIN_V2.BOTTOM,
              left: PAGE.MARGIN_V2.LEFT,
              right: PAGE.MARGIN_V2.RIGHT,
            },
          },

          titlePage: true,
        },

        footers: {
          default: createFooter(),
        },

        headers: {
          first: createHeaderV2('assets/header/1.png'),
        },

        children,
      },
    ],
  });
};

module.exports = {
  createDocument,
  createDocumentV2,
};
