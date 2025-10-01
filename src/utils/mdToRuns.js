const MarkdownIt = require('markdown-it');
const mdIns = require('markdown-it-ins'); // ++underline++
const mdStrike = require('markdown-it-strikethrough-alt'); // ~~strike~~
const { TextRun } = require('docx');

// allow HTML <u> if you want (set html:true)
const md = new MarkdownIt({ breaks: true, html: false }).use(mdIns).use(mdStrike);

function mdToRuns(str, markup) {
  const tokens = md.parseInline(str || '', {});

  const runs = [];
  tokens.forEach((t) => {
    if (!t.children) return;

    let bold = markup?.bold ?? false;
    let italics = false;
    let underline = false;
    let strike = false;

    t.children.forEach((ch) => {
      switch (ch.type) {
        case 'strong_open':
          bold = true;
          break;
        case 'strong_close':
          bold = false;
          break;

        case 'em_open':
          italics = true;
          break;
        case 'em_close':
          italics = false;
          break;

        // underline via ++text++
        case 'ins_open':
          underline = true;
          break;
        case 'ins_close':
          underline = false;
          break;

        // strikethrough via ~~text~~
        case 's_open':
          strike = true;
          break;
        case 's_close':
          strike = false;
          break;

        case 'text':
          runs.push(
            new TextRun({
              text: ch.content,
              bold: bold || undefined,
              italics: italics || undefined,
              strike: strike || undefined,
              underline: underline ? {} : undefined,
              allCaps: markup?.caplock,
              size: markup?.size,
            })
          );
          break;

        case 'softbreak':
        case 'hardbreak':
          runs.push(new TextRun({ break: 1 }));
          break;

        // OPTIONAL: if you set html:true above, you can support <u>…</u>
        // case 'html_inline':
        //   if (ch.content.toLowerCase() === '<u>') underline = true;
        //   else if (ch.content.toLowerCase() === '</u>') underline = false;
        //   break;

        default:
          break;
      }
    });
  });

  return runs;
}

module.exports = { mdToRuns };
