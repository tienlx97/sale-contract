const { TableLayoutType, Table } = require('docx');
const { COLS, TABLE_DEFAULTS } = require('../contract/docx-config');
const { rowLabelSepValue } = require('../contract/tables');

const createPartyTable = (company, address) => {
  return new Table({
    ...TABLE_DEFAULTS,
    layout: TableLayoutType.FIXED,
    columnWidths: COLS.LABEL_SEP_VALUE,
    rows: [
      rowLabelSepValue('TO', company, { boldValue: true, boldKey: true, caplockValue: true }),
      rowLabelSepValue('Address', address),
    ],
  });
};

module.exports = {
  createPartyTable,
};
