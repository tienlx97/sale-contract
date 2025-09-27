// numbering.js
const { AlignmentType, LevelFormat, LevelSuffix } = require('docx');
const { INDENT, FONT } = require('./docx-config');

/**
 * @type {import("docx").INumberingOptions}
 */
const numberingConfig = {
  config: [
    {
      reference: 'article-numbering',
      levels: [
        // Level 0: ARTICLE %1:
        {
          level: 0,
          format: LevelFormat.DECIMAL,
          text: 'ARTICLE %1:',
          suffix: LevelSuffix.TAB,
          alignment: AlignmentType.LEFT,

          style: {
            run: { bold: true, color: FONT.COLOR_BLACK, size: FONT.SIZE_16, underline: true },
          },
        },
        // Level 1: %1.%2
        {
          level: 1,
          format: LevelFormat.DECIMAL,
          text: '%1.%2',
          suffix: LevelSuffix.TAB,
          alignment: AlignmentType.LEFT,

          style: {
            run: { bold: true, color: FONT.COLOR_BLACK, size: FONT.SIZE_12 },
            paragraph: {
              indent: { left: INDENT.L1_LEFT, hanging: INDENT.L1_GAP },
            },
          },
        },
        // Level 2: (i)
        {
          level: 2,
          format: LevelFormat.LOWER_ROMAN,
          text: '(%3)',
          suffix: LevelSuffix.TAB,
          alignment: AlignmentType.LEFT,

          style: {
            run: { bold: true, color: FONT.COLOR_BLACK, size: FONT.SIZE_12 },
            paragraph: {
              indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT, hanging: INDENT.L2_GAP },
            },
          },
        },
        // Level 3: bullet
        {
          level: 3,
          format: LevelFormat.BULLET,
          text: '•',
          suffix: LevelSuffix.SPACE,
          alignment: AlignmentType.LEFT,
          style: {
            run: { bold: true, color: FONT.COLOR_BLACK, size: FONT.SIZE_12 },
            paragraph: {
              indent: { left: INDENT.BULLET_LEFT, hanging: INDENT.BULLET_GAP },
            },
          },
        },
      ],
    },
  ],
};

module.exports = { numberingConfig };
