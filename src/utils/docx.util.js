// header.js
const { Paragraph, ImageRun, Header } = require('docx');
const fs = require('fs');
const { imageSize } = require('image-size');
const { USABLE_WIDTH } = require('../services/contract/docx-config');

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
