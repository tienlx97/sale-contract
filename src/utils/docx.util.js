// header.js
const { Paragraph, ImageRun, Header } = require('docx');
const fs = require('fs');
const { imageSize } = require('image-size');
const { USABLE_WIDTH } = require('./docx-config');

const createHeader = (path) => {
  const buf = fs.readFileSync(path);
  const dim = imageSize(buf);
  if (!dim?.width || !dim?.height) throw new Error('Cannot read header image dimensions');

  // rough twips->px conversion not needed because docx expects px here
  const usableWidthPx = Math.floor(USABLE_WIDTH / 15); // ~ 15 twips/px @96dpi
  const targetW = Math.min(usableWidthPx, dim.width);
  const targetH = Math.round((dim.height / dim.width) * targetW);

  return new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            data: buf,
            transformation: { width: targetW, height: targetH },
          }),
        ],
      }),
    ],
  });
};

module.exports = {
  createHeader,
};

/*

// header.js
const { Paragraph, ImageRun, Header, AlignmentType } = require('docx');
const fs = require('fs');
const { imageSize } = require('image-size');
const { USABLE_WIDTH } = require('./docx-config');
// lưu ý: USABLE_WIDTH_TWIP phải là twip

const twipToPx = (twip, dpi = 96) => Math.round((twip / 1440) * dpi);

const createHeader = (path) => {
  const buf = fs.readFileSync(path);
  const dim = imageSize(buf);
  const w = dim?.width;
  const h = dim?.height;
  if (!w || !h) throw new Error('Cannot read header image dimensions');

  // docx ImageRun nhận px; quy đổi usable width từ twip → px
  const usableWidthPx = twipToPx(USABLE_WIDTH, 96);

  // Không upscale để tránh mờ
  const targetW = Math.min(usableWidthPx, w);
  const targetH = Math.round((h / w) * targetW);

  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER, // hoặc LEFT tùy ý
        spacing: { before: 0, after: 0, line: 240 }, // loại bỏ khoảng trắng thừa
        children: [
          new ImageRun({
            data: buf,
            transformation: { width: targetW, height: targetH }, // đơn vị px
          }),
        ],
      }),
    ],
  });
};

module.exports = { createHeader };


*/
