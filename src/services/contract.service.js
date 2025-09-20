const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Footer,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  PageNumber,
  WidthType,
} = require('docx');
const fs = require('fs');
const { FONT, PARAGRAPH_SPACING, PAGE, INDENT, BORDER_NONE } = require('./contract/docx-config');
const { numberingConfig } = require('./contract/numbering');
const { createHeaderImageParagraph } = require('./contract/header');
const { projectWorkDetailTable, projectDetailTable, createPartyTable, bankAccoutTable } = require('./contract/tables');
const { createFooter } = require('./contract/footer');

/**
 * Create a contract
 * @param {Object} contractBody
 */
const createContract = async (contractBody) => {
  // eslint-disable-next-line no-unused-vars
  const {
    contract,
    signDate,
    contractDetails,
    contractNo,
    partyA,
    partyADetail,
    partyB,
    partyBDetail,
    projectWorkDetails,
    quotationDate,
    contractPeriodPhrase,
  } = contractBody;

  const contractPeriodPhraseCount = Object.keys(contractPeriodPhrase).length;

  let transportationLocation;
  let incotermRule;

  switch (contract.incotermName) {
    case 'DDP':
      transportationLocation = 'site';
      incotermRule = new Paragraph({
        indent: { left: INDENT.L1_LEFT },
        children: [
          new TextRun({
            text: 'The Contract Value is a lump sum, covering all costs related to ',
          }),
          new TextRun({
            text: 'fabrication, packing, inland transportation, export customs clearance, ocean freight, marine insurance, import customs clearance, import duties, taxes, delivery to the agreed place of destination, and warranty',
            bold: true,
          }),
          new TextRun({
            text: '. Party B shall be responsible for all such costs until delivery to the agreed place of destination. The Contract Value shall not be subject to remeasurement of quantities.',
          }),
        ],
      });

      break;
    case 'EXW':
      transportationLocation = contract.location;
      incotermRule = new Paragraph({
        indent: { left: INDENT.L1_LEFT },
        children: [
          new TextRun({
            text: 'The Contract Value is a lump sum, covering all costs related to ',
          }),
          new TextRun({
            text: 'fabrication, packing, and warranty',
            bold: true,
          }),
          new TextRun({
            text: '. All other costs, including ',
          }),
          new TextRun({
            text: 'inland transportation, export customs clearance, freight, insurance, import duties, and any taxes or charges at the country of destination',
            bold: true,
          }),
          new TextRun({
            text: ', shall be borne solely by Party A. The Contract Value shall not be subject to remeasurement of quantities.',
          }),
        ],
      });
      break;
    case 'CIF':
      transportationLocation = contract.location;
      incotermRule = new Paragraph({
        indent: { left: INDENT.L1_LEFT },
        children: [
          new TextRun({
            text: 'The Contract Value is a lump sum, covering all costs related to ',
          }),
          new TextRun({
            text: 'fabrication, packing, inland transportation to the port of loading, export customs clearance, ocean freight, marine insurance, and warranty',
            bold: true,
          }),
          new TextRun({
            text: '. Import duties, taxes, and all charges at the country of destination shall be borne solely by Party A. The Contract Value shall not be subject to remeasurement of quantities.',
          }),
        ],
      });
      break;

    case 'FOB':
      transportationLocation = contract.location;
      incotermRule = new Paragraph({
        indent: { left: INDENT.L1_LEFT },
        children: [
          new TextRun({
            text: 'The Contract Value is a lump sum, covering all costs related to ',
          }),
          new TextRun({
            text: 'fabrication, packing, inland transportation to the port of loading, export customs clearance, loading onto the vessel, and warranty',
            bold: true,
          }),
          new TextRun({
            text: '. All costs beyond loading on board the vessel, including ',
          }),
          new TextRun({
            text: 'ocean freight, marine insurance, import duties, and taxes at the country of destination ',
            bold: true,
          }),
          new TextRun({
            text: ', shall be borne solely by Party A (the Buyer). The Contract Price shall not be subject to remeasurement of quantities.',
          }),
        ],
      });
      break;

    default:
      break;
  }

  const formatCurrency = (currency) => {
    const formatted = currency.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatted;
  };

  const createContractPeriod = () => {
    const contractPeriod = [];

    if (contractPeriodPhrase.preparation) {
      contractPeriod.push(
        new Paragraph({
          numbering: { reference: 'article-numbering', level: 2 },
          children: [
            new TextRun({
              text: `${contractPeriodPhrase.preparation.num} ${contractPeriodPhrase.preparation.type} for preparation of approval drawings.`,
            }),
          ],
        })
      );
    }

    if (contractPeriodPhrase.approval) {
      contractPeriod.push(
        new Paragraph({
          numbering: { reference: 'article-numbering', level: 2 },
          children: [
            new TextRun({
              text: `${contractPeriodPhrase.approval.num} ${contractPeriodPhrase.approval.type} allocation for customer's (Party A) approval.`,
            }),
          ],
        })
      );
    }

    if (contractPeriodPhrase.shopDrawing) {
      contractPeriod.push(
        new Paragraph({
          numbering: { reference: 'article-numbering', level: 2 },
          children: [
            new TextRun({
              text: `${contractPeriodPhrase.shopDrawing.num} ${contractPeriodPhrase.shopDrawing.type} for preparation of shop drawings.`,
            }),
          ],
        })
      );
    }

    if (contractPeriodPhrase.fabrication) {
      contractPeriod.push(
        new Paragraph({
          numbering: { reference: 'article-numbering', level: 2 },
          children: [
            new TextRun({
              text: `${contractPeriodPhrase.fabrication.num} ${contractPeriodPhrase.fabrication.type} fabrication period reckoned from the date the approval drawings are approved.`,
            }),
          ],
        })
      );
    }

    if (contractPeriodPhrase.transportation) {
      contractPeriod.push(
        new Paragraph({
          numbering: { reference: 'article-numbering', level: 2 },
          children: [
            new TextRun({
              text: `${contractPeriodPhrase.transportation.num} ${contractPeriodPhrase.transportation.type} for transportation from factory to ${transportationLocation}`,
            }),
          ],
        })
      );
    }

    return contractPeriod;
  };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT.FAMILY,
            size: FONT.SIZE_12,
          },
          paragraph: {
            spacing: PARAGRAPH_SPACING,
          },
        },
      },
    },

    numbering: numberingConfig,

    sections: [
      {
        properties: {
          page: {
            margin: {
              top: PAGE.MARGIN.TOP,
              right: PAGE.MARGIN.RIGHT,
              bottom: PAGE.MARGIN.BOTTOM,
              left: PAGE.MARGIN.LEFT,
            },
          },
        },
        footers: {
          default: createFooter(),
        },
        children: [
          createHeaderImageParagraph('assets/header/1.png'),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: `Ho Chi Minh, ${String(signDate?.text1 ?? '')}`, size: FONT.SIZE_12 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'SALES CONTRACT', bold: true, size: FONT.SIZE_14 })],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `No: ${String(contractNo ?? '')}`, bold: true, size: FONT.SIZE_14, color: 'FF0000' }),
            ],
          }),

          // Project detail table (center)
          projectDetailTable(contractDetails),

          // Intro text
          new Paragraph({
            children: [
              new TextRun(
                `This Contract is entered into on ${String(
                  signDate?.text2 ?? ''
                )} at the office of DAI NGHIA INDUSTRIAL MECHANICS CO., LTD between the two parties:`
              ),
            ],
          }),

          ...createPartyTable(partyA, partyADetail, 'A'),
          new Paragraph({
            children: [new TextRun('___')],
          }),
          ...createPartyTable(partyB, partyBDetail, 'B'),
          new Paragraph({
            children: [new TextRun('___')],
          }),
          new Paragraph({
            children: [
              new TextRun('After negotiation, both parties have mutually agreed to sign this contract (“'),
              new TextRun({
                text: 'Contract',
                bold: true,
              }),
              new TextRun('”) with the following terms and conditions:'),
              new TextRun({ break: 1 }),
            ],
          }),

          // ARTICLE 1
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 0 },
            children: [
              new TextRun({ text: 'THE OBJECT OF THE CONTRACT', bold: true, color: FONT.COLOR_BLACK, size: FONT.SIZE_14 }),
            ],
          }),

          // 1.1 line (bold)
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Party A agrees to engage Party B for the supply and execution of steel structure works as described below:',
                bold: true,
              }),
            ],
          }),

          // 1.1 continuation as a table aligned under L1 text
          ...projectWorkDetailTable(
            {
              projectName: projectWorkDetails.projectName,
              item: projectWorkDetails.item,
              location: projectWorkDetails.location,
              quotationDate: projectWorkDetails.quotationDate,
            },
            INDENT.L1_LEFT
          ),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Detailed scope of works is as follows:',
                bold: true,
                size: 24,
              }),
            ],
            numbering: {
              reference: 'article-numbering',
              level: 1,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Party B carries out the following works:',
                size: 24,
              }),
            ],
            numbering: {
              reference: 'article-numbering',
              level: 2,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Steel structure',
                size: 24,
              }),
            ],
            numbering: {
              reference: 'article-numbering',
              level: 3,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Any work not expressly specified herein or not shown in the approved drawings shall be excluded from the scope of this Contract.',
              }),
              new TextRun({ break: 1 }),
            ],
            numbering: {
              reference: 'article-numbering',
              level: 2,
            },
          }),

          new Paragraph({
            numbering: { reference: 'article-numbering', level: 0 },
            children: [
              new TextRun({
                text: 'DOCUMENTS ATTACHED TO THE CONTRACT',
                bold: true,
                size: FONT.SIZE_14,
              }),
            ],
          }),

          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: `Quotation date: ${quotationDate.text1}`,
                italics: true,
                bold: true,
              }),
            ],
          }),

          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: 'The following documents form an integral part of this contract:',
              }),
            ],
          }),

          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Architectural Floor plans provided by party A.',
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Steel structure design drawings prepared by party B.',
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Scope of quotation, List of materials and standards used for the project attached here with.',
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Contract addendum and variations (positive or negative) (if any).',
              }),
              new TextRun({ break: 1 }),
            ],
          }),

          // ARTICLE 3:
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 0 },
            children: [
              new TextRun({
                text: 'CONTRACT PERIOD',
                bold: true,
                size: FONT.SIZE_14,
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: `Project execution period: is TBE (To be Established) from the latest date of contract signature, party B receives the advance payment from party A as stated at the Article 4 of this Contract and Party A approves the shopdrawings for fabrication prepared by Party B. The Execution Period shall be divided into the following ${contractPeriodPhraseCount} phases:`,
              }),
            ],
          }),
          ...createContractPeriod(),

          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Prior to the fabrication of each item, technical representatives of both Party A and Party B shall jointly clarify all technical matters. Party A shall issue official drawings bearing its representative’s signature and stamp for Party B to proceed with fabrication',
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'The fabrication period shall exclude any delays caused by:',
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 2 },
            children: [
              new TextRun({
                text: 'Faults attributable to Party A, including delays in payments from Party A to Party B, delays in product handover and takeover as specified in this contract, or delays in the approval of ',
              }),
              new TextRun({
                text: 'Approval Drawings.',
                underline: true,
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 2 },
            children: [
              new TextRun({
                text: 'Party B has a legitimate reason and keeps party A informed in writing.',
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 2 },
            children: [
              new TextRun({
                text: 'Force majeure as stated in this contract.',
              }),
            ],
          }),
          // ARTICLE 4
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 0 },
            children: [
              new TextRun({
                text: 'CONTRACT VALUE AND PAYMENT TERMS',
                bold: true,
                size: FONT.SIZE_14,
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Contract Value',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: 'The Contract Value is: ',
              }),

              new TextRun({
                text: `${contract.currencyUnit} ${formatCurrency(contract.currency)}`,
                bold: true,
              }),

              new TextRun({
                text: ` (${contract.moneyText}).`,
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: 'Delivery term: ',
              }),

              new TextRun({
                text: `${contract.incotermName}, ${contract.location}, Incoterms® ${contract.incotermYear}.`,
                bold: true,
              }),
            ],
          }),

          incotermRule,

          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: 'The unit rates for steel structure and materials shall conform to the standards and specifications as listed in the attached material list. Any changes to materials, or clarification following technical discussions with Party A, may result in adjusted pricing by Party B.',
              }),
            ],
          }),

          //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Payment Terms',
                bold: true,
              }),
            ],
          }),

          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: 'Party A shall make payment to Party B in the following:',
              }),
            ],
          }),

          new Paragraph({
            numbering: { reference: 'article-numbering', level: 2 },
            children: [
              new TextRun({
                text: `First Payment: Party A shall pay ${contract.payment[0].percent.text} (${contract.payment[0].percent.num}%) of the Contract Value:`,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
            children: [
              new TextRun({
                text: `${contract.currencyUnit} ${formatCurrency(contract.currency)} x ${
                  contract.payment[0].percent.num
                }% = ${contract.currencyUnit} ${formatCurrency(
                  (contract.currency / 100) * contract.payment[0].percent.num
                )}`,
              }),
            ],
          }),

          new Paragraph({
            indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
            children: [
              new TextRun({
                text: `(In word: ${contract.payment[0].moneyInWord})`,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
            children: [
              new TextRun({
                text: `by ${contract.payment[0].term} within ${contract.payment[0].date.num} (${contract.payment[0].date.text}) calendar days from the date of Contract signing`,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
            children: [
              new TextRun({
                text: `Receipt of this payment shall be a condition precedent for Party B to commence fabrication of the members, subject to Party A’s approval of the drawings.`,
              }),
            ],
          }),

          //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 2 },
            children: [
              new TextRun({
                text: `Second Payment: Party A shall pay ${contract.payment[1].percent.text} (${contract.payment[1].percent.num}%) of the Contract Value:`,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
            children: [
              new TextRun({
                text: `${contract.currencyUnit} ${formatCurrency(contract.currency)} x ${
                  contract.payment[1].percent.num
                }% = ${contract.currencyUnit} ${formatCurrency(
                  (contract.currency / 100) * contract.payment[1].percent.num
                )}`,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
            children: [
              new TextRun({
                text: `(In word: ${contract.payment[1].moneyInWord})`,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
            children: [
              new TextRun({
                text: `by ${contract.payment[1].term} within ${contract.payment[1].date.num} (${contract.payment[1].date.text}) calendar days after completion of inspection at Party B’s factory in Vietnam and prior to shipment release.`,
              }),
            ],
          }),

          //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Bank Information',
                bold: true,
              }),
            ],
          }),
          ...bankAccoutTable({}),

          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Packing',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: 'Steel members shall be packed into containers as per Dai Nghia packing practice.',
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Consignee',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: contract.consignee.company,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: contract.consignee.address,
              }),
            ],
          }),
          //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Notify Party',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: contract.notifyParty.company,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: contract.notifyParty.address,
              }),
            ],
          }),
          //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Port of shipment',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: contract.pol,
              }),
            ],
          }),
          //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Port of destination',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: contract.pod,
              }),
            ],
          }),
          //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Shipment terms',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: contract.shipmentTerms,
              }),
            ],
          }),
          //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Partial Shipments and Transshipment',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: 'Partial shipments: Allowed',
              }),
            ],
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: [
              new TextRun({
                text: 'Transshipment: Allowed',
              }),
            ],
          }),

          // ARTICLE 5
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 0 },
            children: [
              new TextRun({
                text: 'AUTHORITY AND RESPONSIBILITIES OF PARTY A',
                bold: true,
                color: FONT.COLOR_BLACK,
                size: FONT.SIZE_14,
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'To get quality product on schedule as stated in this contract',
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'To get full guarantee for Steel Structure from party B',
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'To make payments to party B as per the contract. After party A completes all payments to party B stated in the contract and the project is taken over and when party B fulfills the responsibility for Steel Structure warranty as stated at article 7, the contract is considered liquidated.',
              }),
            ],
          }),
          //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 0 },
            children: [
              new TextRun({
                text: 'AUTHORITY AND RESPONSIBILITIES OF PARTY B',
                bold: true,
                color: FONT.COLOR_BLACK,
                size: FONT.SIZE_14,
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'To get full payments on schedule as stated in this contract.',
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'To execute the project based on design drawing, type of materials based on the quotation list, except the case in which there are changes of drawing or type of materials requested by party A. Then party B shall reserve the right to adjust the variations (maybe positive or negative). Fabrication follows technical norms, execution bases on current standards of Vietnam, ensure quality and progress.',
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'To ensure supply of good quality materials, under technical requirement and tolerance conforming to Metal Building Manufacturer’s Association (MBMA) standards.',
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'To complete and hand over the Steel Structure on schedule.',
              }),
            ],
          }),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Party B has the right to refuse shipment if Party A does not make payment on time as stated in this contract.',
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync('file.docx', buf);
  // eslint-disable-next-line no-console
  console.log('Document created successfully!');
};

module.exports = { createContract };
