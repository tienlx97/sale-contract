const { WidthType, AlignmentType, LevelFormat, LevelSuffix, LineRuleType, BorderStyle } = require('docx');

// === Units & page ===
const DXA = {
  INCH: 1440,
  CM: 567,
};

const PAGE = {
  A4_WIDTH: 11907, // twips
  // 1.25/1/1.25/1 cm
  MARGIN: { TOP: 708, RIGHT: 567, BOTTOM: 708, LEFT: 567 },
};

const USABLE_WIDTH = PAGE.A4_WIDTH - PAGE.MARGIN.LEFT - PAGE.MARGIN.RIGHT;

// === Typography ===
const FONT = { FAMILY: 'Times New Roman', SIZE_12: 24, SIZE_14: 28, COLOR_BLACK: '000000', COLOR_RED: 'FF0000' };
const PARAGRAPH_SPACING = { line: 240, lineRule: LineRuleType.AUTO, before: 120, after: 120 }; // single + 6pt

// === Common indents (so you change once) ===
const INDENT = {
  L1_LEFT: 1 * DXA.INCH, // 1.0"
  L1_GAP: 0.5 * DXA.INCH, // 0.5"
  L2_LEFT_FROM_L1_TEXT: 1 * DXA.INCH + 0.5 * DXA.INCH, // align with L1 text col
  L2_GAP: 0.5 * DXA.INCH,
  BULLET_LEFT: 1 * DXA.INCH + 0.5 * DXA.INCH + 0.25 * DXA.INCH,
  BULLET_GAP: 0.25 * DXA.INCH,
};

// === Borders & table defaults ===
const BORDER_NONE = {
  top: { style: BorderStyle.NONE },
  bottom: { style: BorderStyle.NONE },
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
};

const TABLE_DEFAULTS = {
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
  cellMargin: { top: 80, bottom: 80, left: 120, right: 120 },
};

// === Column presets (base; scale when needed) ===
const COLS = {
  LABEL_SEP_VALUE: [3500, 400, 7500],
  LABEL_SEP_VALUE_2: [2000, 400, 7500],
};

// === Helpers ===
const scaleColumnsTo = (base, targetWidth) => {
  const sum = base.reduce((a, b) => a + b, 0);
  const k = targetWidth / sum;
  return base.map((w) => Math.floor(w * k));
};

module.exports = {
  DXA,
  PAGE,
  USABLE_WIDTH,
  FONT,
  PARAGRAPH_SPACING,
  INDENT,
  BORDER_NONE,
  TABLE_DEFAULTS,
  COLS,
  WidthType,
  AlignmentType,
  LevelFormat,
  LevelSuffix,
  scaleColumnsTo,
};
