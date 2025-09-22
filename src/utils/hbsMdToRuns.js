const Handlebars = require('handlebars');
const { mdToRuns } = require('./mdToRuns'); // your function from above

// Optional: some helpers (examples)
Handlebars.registerHelper('upper', (s) => String(s ?? '').toUpperCase());
Handlebars.registerHelper('date', (iso, locale = 'en-GB') =>
  new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(iso))
);

/**
 * Compile a Handlebars template string, then convert Markdown→TextRuns.
 * @param {string} hbsString - e.g. 'Hello **{{name}}** — quoted {{dateISO | date}}'
 * @param {object} data
 * @returns {import('docx').TextRun[]}
 */
function hbsMdToRuns(hbsString, data, markup) {
  const compiled = Handlebars.compile(hbsString || '');
  const rendered = compiled(data || {}); // → plain string with placeholders filled
  return mdToRuns(rendered, markup); // → array of TextRun / ExternalHyperlink
}

module.exports = {
  hbsMdToRuns,
};
