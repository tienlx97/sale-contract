const { ToWords } = require('to-words');

const toWords = new ToWords({ localeCode: 'en-US' });

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th", ...
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Parse ISO "yyyy-MM-dd" an toàn theo UTC
function isoToUTCDate(iso) {
  if (!iso) return undefined;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Kiểu 1: "the 27th day of September, 2025" */
function formatTheDayOf(iso) {
  const d = isoToUTCDate(iso);
  if (!d) return '';
  const day = d.getUTCDate();
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `the ${ordinal(day)} day of ${month}, ${year}`;
}

/** Kiểu 2: "27th September 2025" */
function formatDayMonthYear(iso) {
  const d = isoToUTCDate(iso);
  if (!d) return '';
  const day = d.getUTCDate();
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${ordinal(day)} ${month} ${year}`;
}

function isoToDDMMYYYY(iso) {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const [, y, mo, d] = m;
  return `${d}/${mo}/${y}`;
}

function percentToWords(value, opts = {}) {
  if (value === '' || value == null) return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return '';

  // to-words sẽ ra "seven", "seven point five", ...
  const words = toWords.convert(n).toLocaleLowerCase(); // mặc định là chữ thường/đúng chuẩn tiếng Anh

  // muốn "Seven" ở đầu câu?
  // if (opts?.capitalizeFirst && words) words = words[0].toUpperCase() + words.slice(1);

  return `${words} percent`;
}

function numberToWords(value, opts = {}) {
  if (value === '' || value == null) return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return '';

  // to-words sẽ ra "seven", "seven point five", ...
  const words = toWords.convert(n).toLocaleLowerCase(); // mặc định là chữ thường/đúng chuẩn tiếng Anh

  // muốn "Seven" ở đầu câu?
  // if (opts.capitalizeFirst && words) words = words[0].toUpperCase() + words.slice(1);

  return words;
}

const currencyMeta = {
  USD: {
    name: 'United States Dollar',
    plural: 'United States Dollars',
    fractionalUnit: { name: 'Cent', plural: 'Cents' },
  },
};

function amountInWordsCurrencyFirst(amount, unit = 'USD') {
  const meta = currencyMeta[unit] || currencyMeta.USD;

  const n = Number(amount);
  if (!Number.isFinite(n)) return '';
  const intPart = Math.trunc(Math.abs(n));
  const cents = Math.round((Math.abs(n) - intPart) * 100);

  // number in words
  let intWords = intPart === 0 ? 'Zero' : toWords.convert(intPart);
  intWords = intWords.replace(/\b(Twenty|Thirty|Forty|Fifty|Sixty|Seventy|Eighty|Ninety) (\w+)/g, '$1-$2');

  const currencyName = intPart === 1 ? meta.name : meta.plural;

  let phrase = `${currencyName} ${intWords}`;
  if (cents > 0) {
    let centWords = toWords.convert(cents);
    centWords = centWords.replace(/\b(Twenty|Thirty|Forty|Fifty|Sixty|Seventy|Eighty|Ninety) (\w+)/g, '$1-$2');
    const centName = cents === 1 ? meta.fractionalUnit.name : meta.fractionalUnit.plural;
    phrase += ` and ${centWords} ${centName}`;
  }
  return `${phrase} Only`;
}

function toOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

module.exports = {
  formatTheDayOf,
  formatDayMonthYear,
  isoToDDMMYYYY,
  ordinal,
  percentToWords,
  amountInWordsCurrencyFirst,
  numberToWords,
  toOrdinal,
};
