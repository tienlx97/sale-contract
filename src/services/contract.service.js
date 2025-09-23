/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');
const fs = require('fs');
const { FONT, PARAGRAPH_SPACING, PAGE, INDENT } = require('./contract/docx-config');
const { numberingConfig } = require('./contract/numbering');
const { createHeaderImageParagraph } = require('./contract/header');
const {
  projectWorkDetailTable,
  projectDetailTable,
  bankAccoutTable,
  signinTable,
  createPartyATable,
  createPartyBTable,
  requireDocumentTable,
} = require('./contract/tables');
const { createFooter } = require('./contract/footer');
const { hbsMdToRuns } = require('../utils/hbsMdToRuns');

const body = {
  headerImagePath: 'assets/header/1.png',
  signDate: {
    text1: '18th September 2025',
    text2: '18th day of September 2025',
  },

  dump: {
    contractTitle: 'SALE CONTRACT',
    1: 'This Contract is entered into on {{signDate.text2}} at the office of {{partyB.company.value}} between the two parties:',
    2: 'After negotiation, both parties have mutually agreed to sign this contract (“**Contract**”) with the following terms and conditions:',
  },

  contractInformationTable: {
    no: {
      key: 'No',
      value: '25KCT23',
      markup: {
        color: 'FF0000',
      },
    },
    project: {
      key: '**Project**',
      value: '**Q-2025-059 Comstock Pond Cover**',
      markup: {
        caplockValue: true,
      },
    },
    item: {
      key: '**Item**',
      value: '**STEEL STRUCTURE**',
      markup: {
        caplockValue: true,
      },
    },
    location: {
      key: '**Location**',
      value: '**CANADA**',
      markup: {
        caplock: true,
      },
    },
  },
  parties: {
    partyA: {
      title: '(Hereinafter referred to as **Party A**)',
      company: {
        key: '**PARTY A (BUYER)**',
        value: 'ER STEEL INC.',
        markup: {
          caplockValue: true,
          boldValue: true,
        },
      },
      represented: {
        key: '**Represented by**',
        value: 'Mr. Lloyd Kamlade',
        markup: {
          boldValue: true,
        },
      },
      position: {
        key: 'Position',
        value: 'Chief Operating Officer',
      },
      address: {
        key: 'Address',
        value: '206-1511 Derwent Way, Delta, BC, Canada V3M 6N4',
      },
      optional: undefined,
    },
    partyB: {
      title: '(Hereinafter referred to as **Party B**)',
      company: {
        key: '**PARTY B (CONTRACTOR)**',
        value: 'DAI NGHIA INDUSTRIAL MECHANICS CO., LTD',
        markup: {
          caplockValue: true,
          boldValue: true,
        },
      },
      represented: {
        key: '**Represented by**',
        value: '**MR. Le Xuan Nghia**',
        markup: {
          caplockValue: true,
          boldValue: true,
        },
      },
      position: {
        key: 'Position',
        value: 'General Director',
      },
      address: {
        key: 'Address',
        value: 'No 5 Vsip II-A, Street 32, Viet Nam – Singapore II-A IZ, Vinh Tan Ward, Ho Chi Minh City Viet Nam',
      },
      taxCode: {
        key: 'Tax Code',
        value: '3702682454',
      },
      optional: undefined,
    },
  },
  projectWorkDetails: {
    projectName: {
      key: '*. Project',
      value: '**Q-2025-059 Comstock Pond Cover**',
    },
    item: {
      key: '*. Item',
      value: '**STEEL STRUCTURE**',
      markup: {
        caplockValue: true,
      },
    },
    location: {
      key: '*. Location',
      value: '**CANADA**',
      markup: {
        caplockValue: true,
      },
    },
    volOfWork: {
      key: '*. Volume of works',
      value:
        'As specified in Party B’s Quotation dated {{quotationDate}}, including the scope of quotation, the list of materials and applicable standards attached to this Contract, Party A’s architectural design drawings, and Party B’s steel structure design drawings as approved by Party A.',
    },
    theProject: '(Herein after called as “**The Project**”)\n',
  },
  quotationDate: {
    text1: '17/09/2025',
    text2: '18th September 2025',
  },
  contractPeriodPhrase: {
    preparation: {
      num: '1',
      type: 'week',
      text: '{{contractPeriodPhrase.preparation.num}} {{contractPeriodPhrase.preparation.type}} for preparation of approval drawings.',
    },
    approval: {
      num: '1',
      type: 'week',
      text: "{{contractPeriodPhrase.approval.num}} {{contractPeriodPhrase.approval.type}} allocation for customer's (Party A) approval.",
    },
    shopDrawing: {
      num: '1',
      type: 'week',
      text: '{{contractPeriodPhrase.shopDrawing.num}} {{contractPeriodPhrase.shopDrawing.type}} for preparation of shop drawings.',
    },
    fabrication: {
      num: '4',
      type: 'weeks',
      text: '{{contractPeriodPhrase.fabrication.num}} {{contractPeriodPhrase.fabrication.type}} fabrication period reckoned from the date the approval drawings are approved.',
    },
    //
    transportation: {
      num: '4',
      type: 'weeks',
      text: '{{contractPeriodPhrase.transportation.num}} {{contractPeriodPhrase.transportation.type}} for transportation from factory to {{transportationLocation}}',
    },
  },
  contract: {
    incotermRule: {
      DDP: 'The Contract Value is a lump sum, covering all costs related to **fabrication, packing, inland transportation, export customs clearance, ocean freight, marine insurance, import customs clearance, import duties, taxes, delivery to the agreed place of destination, and warranty** . Party B shall be responsible for all such costs until delivery to the agreed place of destination. The Contract Value shall not be subject to remeasurement of quantities.',
      EXW: 'The Contract Value is a lump sum, covering all costs related to **fabrication, packing, and warranty** . All other costs, including **inland transportation, export customs clearance, freight, insurance, import duties, and any taxes or charges at the country of destination** , shall be borne solely by Party A. The Contract Value shall not be subject to remeasurement of quantities.',
      CIF: 'The Contract Value is a lump sum, covering all costs related to **fabrication, packing, inland transportation to the port of loading, export customs clearance, ocean freight, marine insurance, and warranty** . Import duties, taxes, and all charges at the country of destination shall be borne solely by Party A. The Contract Value shall not be subject to remeasurement of quantities.',
      FOB: 'The Contract Value is a lump sum, covering all costs related to **fabrication, packing, inland transportation to the port of loading, export customs clearance, loading onto the vessel, and warranty**. All costs beyond loading on board the vessel, including **ocean freight, marine insurance, import duties, and taxes at the country of destination **, shall be borne solely by Party A (the Buyer). The Contract Price shall not be subject to remeasurement of quantities.',
    },
    incoterm: {
      name: 'EXW',
      year: '2010',
    },
    valueText: 'The Contract Value is: **{{contract.money.unit}} {{contractMoneyCurrency}}** *({{contract.money.text}})*.',
    deliveryTermText:
      'Delivery term: **{{contract.incoterm.name}} {{contract.location}}, Incoterms® {{contract.incoterm.year}}**.',
    money: {
      text: 'United States Dollars Ninety-Six Thousand Nine Hundred Eleven Only',
      unit: 'USD',
      currency: 96911,
    },
    location: 'Dai Nghia Factory - Vietnam',
    payment: [
      {
        paymentPercentText:
          'First Payment: Party A shall pay {{contract.payment.[0].percent.text}} ({{contract.payment.[0].percent.num}}%) of the Contract Value',
        paymentValueText:
          '{{contract.currencyUnit}} {{contractCurrencyFormat}} x {{contract.payment.[0].percent.num}}% = {{contract.money.unit}} {{firstPaymentValue}}',
        termText:
          'by {{contract.payment.[0].term}} within {{contract.payment.[0].date.num}} ({{contract.payment.[0].date.text}}) calendar days from the date of Contract signing',
        endText:
          'Receipt of this payment shall be a condition precedent for Party B to commence fabrication of the members, subject to Party A’s approval of the drawings.',
        moneyTextInword: '*(In words: {{contract.payment.[0].money.text}})*',
        //
        percent: {
          num: 30,
          text: 'thirty percent',
        },
        percentText: 'thirty percent',
        money: {
          text: 'United States Dollar sixty-two thousand nine hundred ninety-two dollars and fifteen cents only',
        },
        term: 'Telegraphic Transfer (T/T)',
        date: {
          num: 7,
          text: 'seven',
        },
      },
      {
        paymentPercentText:
          'Second Payment: Party A shall pay {{contract.payment.[1].percent.text}} ({{contract.payment.[1].percent.num}}%) of the Contract Value:',
        paymentValueText:
          '{{contract.money.unit}} {{contractCurrencyFormat}} x {{contract.payment.[1].percent.num}}% = {{contract.money.unit}} {{secondPaymentValue}}',
        termText:
          'by {{contract.payment.[1].term}} within {{contract.payment.[1].date.num}} ({{contract.payment.[1].date.text}}) calendar days after completion of inspection at Party B’s factory in Vietnam and prior to shipment release.',
        percent: {
          num: 65,
          text: 'sixty-five percent',
        },
        moneyTextInword: '*(In words: {{contract.payment.[1].money.text}})*',
        money: {
          text: 'United States Dollar twenty-nine thousand seventy-three dollars and thirty cents only',
        },
        term: 'Telegraphic Transfer (T/T)',
        date: {
          num: 7,
          text: 'seven',
        },
      },
    ],
    paymentAppend: [
      {
        title:
          'The final payment (Upon Delivery in Canada): The remaining {{contract.paymentAppend.[0].percent.text}} ({{contract.paymentAppend.[0].percent.num}}%) balance shall be paid by Party A to Party B upon successful delivery of the goods to the destination in Canada.',
        paymentValueText:
          '{{contract.money.unit}} {{contractCurrencyFormat}} x {{contract.paymentAppend.[0].percent.num}}% = {{contract.money.unit}} {{appendPaymentValue}}',
        termText: 'by {{contract.paymentAppend.[0].term}}',
        moneyTextInword: '*(In words: {{contract.paymentAppend.[0].money.text}})*',
        percent: {
          num: 5,
          text: 'five percent',
        },
        money: {
          text: 'United States Dollars four thousand eight hundred forty-five dollars and fifty-five cents only',
        },
        term: 'By T/T upon delivery in Canada.',
      },
    ],
    bankInformation: {
      beneficiary: {
        key: 'Beneficiary',
        value: 'DAI NGHIA INDUSTRIAL MECHANICS CO., LTD',
        markup: {
          boldValue: true,
        },
      },
      bankAccountNo: {
        key: 'Bank account No.',
        value: '1032407684',
        markup: {
          boldValue: true,
        },
      },
      bank: {
        key: 'Bank',
        value: 'Joint Stock Commercial Bank Foreign Trade of Viet Nam',
        markup: {
          boldValue: true,
        },
      },
      branch: {
        key: 'Branch',
        value: 'Tan Binh',
        markup: {
          boldValue: true,
        },
      },
      address: {
        key: 'Address',
        value: '108 Tay Thanh Street, Tay Thanh Ward, Ho Chi Minh City, Vietnam',
        markup: {
          boldValue: true,
        },
      },
      swiftCode: {
        key: 'SWIFT Code',
        value: 'BFTVVNVX044',
        markup: {
          boldValue: true,
        },
      },
    },
    requireDocument: {
      commercialInvoice: {
        key: '- Commercial Invoice',
        value: 'Commercial Invoice',
      },
      packingList: {
        key: '- Packing list',
        value: '01 original(s) electronic',
      },
      bol: {
        key: '- Bill of Lading',
        value: '01 surrender Bill',
      },
      co: {
        key: '- Certificate of Origin (Form {{form}})',
        form: 'D',
        value: '01 original(s) electronic',
      },
    },
    packing: 'Steel members shall be packed into containers as per Dai Nghia packing practice.',
    consignee: {
      company: 'ER STEEL INC',
      address: '206-1511 DERWENT WAY, DELTA, BC, CANADA V3M 6N4',
    },
    notifyParty: {
      company: 'ER STEEL INC',
      address: '206-1511 DERWENT WAY, DELTA, BC, CANADA V3M 6N4',
    },
    pol: 'Ho Chi Minh City Port, Viet Nam',
    pod: '',
    shipmentTerms: 'EXW (Ex Works) Dai Nghia Factory',
  },
  articleObjectOfcontract: {
    title_: 'THE OBJECT OF THE CONTRACT',
    b1: 'Party A agrees to engage Party B for the supply and execution of steel structure works as described below:',
    block: [
      {
        type: 'paragraph',
        level: 1,
        text: '**Detailed scope of works is as follows:**',
      },
      {
        type: 'paragraph',
        level: 2,
        text: 'Party B carries out the following works:',
      },
      {
        type: 'paragraph',
        level: 3,
        text: 'Steel structure',
      },
      {
        type: 'paragraph',
        level: 2,
        text: 'Any work not expressly specified herein or not shown in the approved drawings shall be excluded from the scope of this Contract.',
      },
    ],
  },
  articleDocumentAttachToTheContract: {
    title_: 'DOCUMENTS ATTACHED TO THE CONTRACT',
    block: [
      {
        type: 'paragraph',
        text: '_**Quotation date: {{quotationDate.text1}}**_',
        intent: 1,
      },
      {
        type: 'paragraph',
        text: 'The following documents form an integral part of this contract:',
        intent: 1,
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'Architectural Floor plans provided by party A.',
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'Steel structure design drawings prepared by party B.',
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'Scope of quotation, List of materials and standards used for the project attached here with.',
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'Contract addendum and variations (positive or negative) (if any).',
      },
    ],
  },
  articleContractPeriod: {
    title: 'CONTRACT PERIOD',
    block: [
      {
        type: 'paragraph',
        level: 1,
        text: 'Project execution period: is TBE (To be Established) from the latest date of contract signature, party B receives the advance payment from party A as stated at the Article 4 of this Contract and Party A approves the shopdrawings for fabrication prepared by Party B. The Execution Period shall be divided into the following 5 phases:',
      },
      {
        type: 'paragraph',
        level: 2,
        text: '{{contractPeriodPhrase.preparation.num}} {{contractPeriodPhrase.preparation.type}} for preparation of approval drawings.',
      },
      {
        type: 'paragraph',
        level: 2,
        text: `{{contractPeriodPhrase.approval.num}} {{contractPeriodPhrase.approval.type}} allocation for customer's (Party A) approval.`,
      },
      {
        type: 'paragraph',
        level: 2,
        text: `{{contractPeriodPhrase.shopDrawing.num}} {{contractPeriodPhrase.shopDrawing.type}} for preparation of shop drawings.`,
      },
      {
        type: 'paragraph',
        level: 2,
        text: `{{contractPeriodPhrase.fabrication.num}} {{contractPeriodPhrase.fabrication.type}} fabrication period reckoned from the date the approval drawings are approved.`,
      },
      {
        type: 'paragraph',
        level: 2,
        text: `{{contractPeriodPhrase.transportation.num}} {{contractPeriodPhrase.transportation.type}} for transportation from factory to {{transportationLocation}}`,
      },
      //
      {
        type: 'paragraph',
        level: 1,
        text: 'Prior to the fabrication of each item, technical representatives of both Party A and Party B shall jointly clarify all technical matters. Party A shall issue official drawings bearing its representative’s signature and stamp for Party B to proceed with fabrication.',
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'The fabrication period shall exclude any delays caused by:',
      },
      {
        type: 'paragraph',
        level: 2,
        text: 'Faults attributable to Party A, including delays in payments from Party A to Party B, delays in product handover and takeover as specified in this contract, or delays in the approval of ++Approval Drawings.++',
      },
      {
        type: 'paragraph',
        level: 2,
        text: 'Party B has a legitimate reason and keeps party A informed in writing; or',
      },
      {
        type: 'paragraph',
        level: 2,
        text: 'Force majeure as stated in this contract',
      },
    ],
  },

  articleauthorityAndResponsibilitiesOfPartyA: {
    title: 'AUTHORITY AND RESPONSIBILITIES OF PARTY A',
    block: [
      {
        type: 'paragraph',
        level: 1,
        text: 'To get quality product on schedule as stated in this contract',
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'To get full guarantee for Steel Structure from party B',
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'To make payments to party B as per the contract.',
      },
    ],
  },
  articleauthorityAndResponsibilitiesOfPartyB: {
    title: 'AUTHORITY AND RESPONSIBILITIES OF PARTY B',
    block: [
      {
        type: 'paragraph',
        level: 1,
        text: 'To get full payments on schedule as stated in this contract.',
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'To execute the project based on design drawing, type of materials based on the quotation list, except the case in which there are changes of drawing or type of materials requested by party A. Then party B shall reserve the right to adjust the variations (maybe positive or negative). Fabrication follows technical norms, execution bases on current standards of Vietnam, ensure quality and progress.',
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'To ensure supply of good quality materials, under technical requirement and tolerance conforming to Metal Building Manufacturer’s Association (MBMA) standards.',
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'To complete and hand over the Steel Structure on schedule.',
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'Party B has the right to refuse shipment if Party A does not make payment on time as stated in this contract.',
      },
    ],
  },
  articleWarranty: {
    title: 'WARRANTY',
    block: [
      {
        type: 'paragraph',
        level: 1,
        text: 'The warranty period for the Works shall be twelve (12) months from the date of arrival at Party A’s port of destination.The warranty period of Design is ten (10) years.',
      },
      {
        type: 'list',
        level: 1,
        text: 'During the warranty period, Party B shall not be responsible for following cases:',
        items: {
          intent: 1,
          val: [
            '- Due to fault of party A.',
            '- Due to the Force majeure.',
            '- There is a destructive action for any reason.',
            '- Party A or the third Party be undertakes dismantling or relocation by itself, resulting in damages not covered under this Contract.',
            '- Party A does not pay under the Contract.',
          ],
        },
      },
    ],
  },
  articleTermination: {
    title: 'CONTRACT TERMINATION',
    block: [
      {
        type: 'paragraph',
        level: 1,
        text: 'The contract shall be terminated before the expiry in the following cases:',

        items: {
          level: 2,
          val: [
            'Party A is declared bankrupt or becomes insolvent',
            'Party B is declared bankrupt or becomes insolvent.',
            'If more than (60) days have passed since the payment due date specified in Article 4.2 of this Contract, and Party B has issued a formal written notice to Party A regarding such delay, but Party A still fails to make payment, then Party B reserves the right to unilaterally terminate this Contract.',
          ],
        },
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'In the event that the Contract is terminated in accordance with Article 8.1(iii), Party A shall be liable to:',
        items: {
          intent: 1,
          val: [
            '- Pay a penalty equivalent to five percent (5%) of the total outstanding Contract value; and',
            '- Indemnify Party B for any and all damages incurred as a result of such breach.',
          ],
        },
      },
    ],
  },
  articleLiquidation: {
    title: 'CONTRACT LIQUIDATION',
    block: [
      {
        type: 'paragraph',
        intent: 1,
        text: 'After party A completes all payments to party B stated in the contract and the project is taken over and when party B fulfills the responsibility for Steel Structure warranty as stated at article 7, the contract is considered liquidated.',
      },
    ],
  },
  forceMajeure: {
    title: 'FORCE MAJEURE',
    block: [
      {
        type: 'paragraph',
        intent: 1,
        text: 'Neither party shall be liable to fulfill any obligation under this Contract if such obligation becomes impossible or unreasonably difficult to perform due to force majeure, including but not limited to war, severe fire, flood, typhoon, earthquake, riots, civil disturbances, embargo, government regulations or orders, vessel congestion, or any circumstances beyond the control of the parties.',
      },
      {
        type: 'paragraph',
        intent: 1,
        text: 'In case the goods are subject to customs inspection, all related costs shall be borne by the Consignee (Party A).',
      },
      {
        type: 'paragraph',
        intent: 1,
        text: 'Either party being affected by such an event of force majeure shall give written notice to the other party immediately of the occurrence mentioned above and within fourteen days thereafter, the Seller shall send by airmail to the Buyer for their acceptance of a certificate of the event issued by the Competent Government Authorities where the event occurs as evidence thereof.',
      },
      {
        type: 'paragraph',
        intent: 1,
        text: 'Should such event of force majeure continue for more than 10 weeks, either party hereto shall have the right to cancel this contract by giving 15 days prior notice.',
      },
      {
        type: 'paragraph',
        intent: 1,
        text: 'In case of customs inspection required by authorities at the port of departure, and such inspection is not due to Party B’s fault, all related costs incurred shall be borne by the Consignee (Party A)',
      },
    ],
  },
  commonArticle: {
    title: 'COMMON ARTICLE',
    block: [
      {
        type: 'paragraph',
        level: 1,
        text: 'This Contract shall be governed by the prevailing laws of the Socialist Republic of Vietnam.',
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'All disputes between the parties that are not amicably settled within a reasonable time will be settled by Arbitration by the Vietnam International Arbitration center in Ho Chi Minh City, under the Vietnamese law, whose decision will be final and binding on both parties. Arbitration’s fee and other relative cost will be on account of losing party.',
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'Both parties undertake to correctly execute the articles in the contract in good faith. All amendments, supplements shall be agreed in writing by both parties. The amendment and supplementary part is an integral part of the contract.',
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'The contract is signed in English language.',
      },
      {
        type: 'paragraph',
        level: 1,
        text: 'This contract is made into 02 sets (original) in English, 02 sets of the same value for each party in witness hereof. This Contract shall become effective as of the date of signature by both parties.',
      },
    ],
  },
};

/**
 * Convert intent number to left indent in DXA.
 * - intent = 1  -> thụt 1 bậc
 * - intent = 2  -> thụt 2 bậc, v.v.
 * Ưu tiên dùng INDENT.STEP nếu bạn định nghĩa; mặc định 720 twips (~0.5")
 */
function indentFromIntent(intent = 1) {
  // L1_LEFT: 1 * DXA.INCH, // 1.0"
  // L1_GAP: 0.5 * DXA.INCH, // 0.5"
  // L2_LEFT_FROM_L1_TEXT: 1 * DXA.INCH + 0.5 * DXA.INCH, // align with L1 text col
  // L2_GAP: 0.5 * DXA.INCH,
  // BULLET_LEFT: 1 * DXA.INCH + 0.5 * DXA.INCH + 0.25 * DXA.INCH,
  // BULLET_GAP: 0.25 * DXA.INCH,

  switch (intent) {
    case 1:
      return INDENT.L1_LEFT;
    default:
      break;
  }
}

/**
 * Convert a block structure into docx Paragraphs
 * @param {object} article
 * @returns {Paragraph[]}
 */
function renderArticle(article, data = {}) {
  const out = [];

  if (article.title) {
    out.push(
      new Paragraph({
        numbering: { reference: 'article-numbering', level: 0 },
        children: [
          new TextRun({
            text: article.title,
            allCaps: true,
            bold: true,
            color: FONT.COLOR_BLACK,
            size: FONT.SIZE_14,
          }),
        ],
      })
    );
  }

  for (const b of article.block || []) {
    out.push(
      new Paragraph({
        ...(b.level !== undefined && { numbering: { reference: 'article-numbering', level: b.level } }),
        ...(b.intent !== undefined && { indent: { left: indentFromIntent(b.intent) } }),
        children: hbsMdToRuns(String(b.text || ''), data),
      })
    );

    // eslint-disable-next-line no-loop-func
    (b.items?.val || []).forEach((raw) => {
      out.push(
        new Paragraph({
          ...(b.items.level !== undefined && { numbering: { reference: 'article-numbering', level: b.items.level } }),
          ...(b.items.intent !== undefined && { indent: { left: indentFromIntent(b.items.intent) } }),
          children: hbsMdToRuns(raw, data),
        })
      );
    });
  }

  return out;
}

const formatCurrency = (currency) => {
  const formatted = currency.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatted;
};

function createPaymentArticle(contract, { moneyFormat, moneyPayment1Format, moneyPayment2Format }) {
  const appendPaymentArr = [];

  if (contract.paymentAppend) {
    contract.paymentAppend.forEach((append) => {
      const appendPaymentValue = formatCurrency((contract.money.currency / 100) * append.percent.num);
      appendPaymentArr.push(
        new Paragraph({
          numbering: { reference: 'article-numbering', level: 2 },
          children: hbsMdToRuns(append.title, { contract }),
        }),
        new Paragraph({
          indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
          children: hbsMdToRuns(append.paymentValueText, {
            contract,
            contractCurrencyFormat: moneyFormat,
            appendPaymentValue,
          }),
        }),
        new Paragraph({
          indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
          children: hbsMdToRuns(append.moneyTextInword, { contract }),
        }),
        new Paragraph({
          indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
          children: hbsMdToRuns(append.termText, { contract }),
        })
      );
    });
  }

  return [
    // ARTICLE 4: CONTRACT VALUE AND PAYMENT TERMS
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
      children: hbsMdToRuns(contract.valueText, {
        contract,
        contractMoneyCurrency: moneyFormat,
      }),
    }),
    new Paragraph({
      indent: { left: INDENT.L1_LEFT },
      children: hbsMdToRuns(contract.deliveryTermText, {
        contract,
      }),
    }),
    new Paragraph({
      indent: { left: INDENT.L1_LEFT },
      children: hbsMdToRuns(contract.incotermRule[contract.incoterm.name]),
    }),
    new Paragraph({
      indent: { left: INDENT.L1_LEFT },
      children: [
        new TextRun({
          text: 'The unit rates for steel structure and materials shall conform to the standards and specifications as listed in the attached material list. Any changes to materials, or clarification following technical discussions with Party A, may result in adjusted pricing by Party B.',
        }),
      ],
    }),
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
      children: hbsMdToRuns(contract.payment[0].paymentPercentText, { contract }),
    }),
    new Paragraph({
      indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
      children: hbsMdToRuns(contract.payment[0].paymentValueText, {
        contract,
        contractCurrencyFormat: moneyFormat,
        firstPaymentValue: moneyPayment1Format,
      }),
    }),
    new Paragraph({
      indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
      children: hbsMdToRuns(contract.payment[0].moneyTextInword, { contract }),
    }),
    new Paragraph({
      indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
      children: hbsMdToRuns(contract.payment[0].termText, { contract }),
    }),
    new Paragraph({
      indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
      children: hbsMdToRuns(contract.payment[0].endText, { contract }),
    }),
    // =======================
    new Paragraph({
      numbering: { reference: 'article-numbering', level: 2 },
      children: hbsMdToRuns(contract.payment[1].paymentPercentText, { contract }),
    }),
    new Paragraph({
      indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
      children: hbsMdToRuns(contract.payment[1].paymentValueText, {
        contract,
        contractCurrencyFormat: moneyFormat,
        secondPaymentValue: moneyPayment2Format,
      }),
    }),
    new Paragraph({
      indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
      children: hbsMdToRuns(contract.payment[1].moneyTextInword, { contract }),
    }),
    new Paragraph({
      indent: { left: INDENT.L2_LEFT_FROM_L1_TEXT },
      children: hbsMdToRuns(contract.payment[1].termText, {
        contract,
      }),
    }),
    //
    ...appendPaymentArr,
  ];
}

/**
 * Create a contract
 * @param {Object} contractBody
 */
const createContract = async (contractBody) => {
  // eslint-disable-next-line no-param-reassign

  // eslint-disable-next-line no-unused-vars
  const {
    headerImagePath,
    contract,
    signDate,
    contractInformationTable,
    parties,
    dump,
    articleObjectOfcontract,
    articleDocumentAttachToTheContract,
    articleContractPeriod,
    projectWorkDetails,
    quotationDate,
    articleauthorityAndResponsibilitiesOfPartyA,
    articleauthorityAndResponsibilitiesOfPartyB,
    articleWarranty,
    articleTermination,
    articleLiquidation,
    forceMajeure,
    commonArticle,
    contractPeriodPhrase,
  } = body;

  // const contractPeriodPhraseCount = Object.keys(contractPeriodPhrase).length;

  let transportationLocation;
  // let incotermRule;

  switch (contract.incoterm.name) {
    case 'DDP':
      transportationLocation = 'site';
      // incotermRule = new Paragraph({
      //   indent: { left: INDENT.L1_LEFT },
      //   children: [
      //     new TextRun({
      //       text: 'The Contract Value is a lump sum, covering all costs related to ',
      //     }),
      //     new TextRun({
      //       text: 'fabrication, packing, inland transportation, export customs clearance, ocean freight, marine insurance, import customs clearance, import duties, taxes, delivery to the agreed place of destination, and warranty',
      //       bold: true,
      //     }),
      //     new TextRun({
      //       text: '. Party B shall be responsible for all such costs until delivery to the agreed place of destination. The Contract Value shall not be subject to remeasurement of quantities.',
      //     }),
      //   ],
      // });

      break;
    case 'EXW':
      transportationLocation = contract.location;
      // incotermRule = new Paragraph({
      //   indent: { left: INDENT.L1_LEFT },
      //   children: [
      //     new TextRun({
      //       text: 'The Contract Value is a lump sum, covering all costs related to ',
      //     }),
      //     new TextRun({
      //       text: 'fabrication, packing, and warranty',
      //       bold: true,
      //     }),
      //     new TextRun({
      //       text: '. All other costs, including ',
      //     }),
      //     new TextRun({
      //       text: 'inland transportation, export customs clearance, freight, insurance, import duties, and any taxes or charges at the country of destination',
      //       bold: true,
      //     }),
      //     new TextRun({
      //       text: ', shall be borne solely by Party A. The Contract Value shall not be subject to remeasurement of quantities.',
      //     }),
      //   ],
      // });
      break;
    case 'CIF':
      transportationLocation = contract.location;
      // incotermRule = new Paragraph({
      //   indent: { left: INDENT.L1_LEFT },
      //   children: [
      //     new TextRun({
      //       text: 'The Contract Value is a lump sum, covering all costs related to ',
      //     }),
      //     new TextRun({
      //       text: 'fabrication, packing, inland transportation to the port of loading, export customs clearance, ocean freight, marine insurance, and warranty',
      //       bold: true,
      //     }),
      //     new TextRun({
      //       text: '. Import duties, taxes, and all charges at the country of destination shall be borne solely by Party A. The Contract Value shall not be subject to remeasurement of quantities.',
      //     }),
      //   ],
      // });
      break;

    case 'FOB':
      transportationLocation = contract.location;
      // incotermRule = new Paragraph({
      //   indent: { left: INDENT.L1_LEFT },
      //   children: [
      //     new TextRun({
      //       text: 'The Contract Value is a lump sum, covering all costs related to ',
      //     }),
      //     new TextRun({
      //       text: 'fabrication, packing, inland transportation to the port of loading, export customs clearance, loading onto the vessel, and warranty',
      //       bold: true,
      //     }),
      //     new TextRun({
      //       text: '. All costs beyond loading on board the vessel, including ',
      //     }),
      //     new TextRun({
      //       text: 'ocean freight, marine insurance, import duties, and taxes at the country of destination ',
      //       bold: true,
      //     }),
      //     new TextRun({
      //       text: ', shall be borne solely by Party A (the Buyer). The Contract Price shall not be subject to remeasurement of quantities.',
      //     }),
      //   ],
      // });
      break;

    default:
      break;
  }

  // DONE

  // DONE
  // const createContractPeriod = () => {
  //   const contractPeriod = [];

  //   if (contractPeriodPhrase.preparation) {
  //     contractPeriod.push(
  //       new Paragraph({
  //         numbering: { reference: 'article-numbering', level: 2 },
  //         children: [
  //           new TextRun({
  //             text: Handlebars.compile(contractPeriodPhrase.preparation.text)({ contractPeriodPhrase }),
  //           }),
  //         ],
  //       })
  //     );
  //   }

  //   if (contractPeriodPhrase.approval) {
  //     contractPeriod.push(
  //       new Paragraph({
  //         numbering: { reference: 'article-numbering', level: 2 },
  //         children: [
  //           new TextRun({
  //             text: Handlebars.compile(contractPeriodPhrase.approval.text)({ contractPeriodPhrase }),
  //           }),
  //         ],
  //       })
  //     );
  //   }

  //   if (contractPeriodPhrase.shopDrawing) {
  //     contractPeriod.push(
  //       new Paragraph({
  //         numbering: { reference: 'article-numbering', level: 2 },
  //         children: [
  //           new TextRun({
  //             text: Handlebars.compile(contractPeriodPhrase.shopDrawing.text)({ contractPeriodPhrase }),
  //           }),
  //         ],
  //       })
  //     );
  //   }

  //   if (contractPeriodPhrase.fabrication) {
  //     contractPeriod.push(
  //       new Paragraph({
  //         numbering: { reference: 'article-numbering', level: 2 },
  //         children: [
  //           new TextRun({
  //             text: Handlebars.compile(contractPeriodPhrase.fabrication.text)({
  //               contractPeriodPhrase,
  //             }),
  //           }),
  //         ],
  //       })
  //     );
  //   }

  //   if (contractPeriodPhrase.transportation) {
  //     contractPeriod.push(
  //       new Paragraph({
  //         numbering: { reference: 'article-numbering', level: 2 },
  //         children: [
  //           new TextRun({
  //             text: Handlebars.compile(contractPeriodPhrase.transportation.text)({
  //               contractPeriodPhrase,
  //               transportationLocation,
  //             }),
  //           }),
  //         ],
  //       })
  //     );
  //   }

  //   return contractPeriod;
  // };

  const moneyFormat = formatCurrency(contract.money.currency);
  const moneyPayment1Format = formatCurrency((contract.money.currency / 100) * contract.payment[0].percent.num);
  const moneyPayment2Format = formatCurrency((contract.money.currency / 100) * contract.payment[1].percent.num);

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
          createHeaderImageParagraph(headerImagePath),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: `Ho Chi Minh, ${String(signDate?.text1 ?? '')}`, size: FONT.SIZE_12 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: dump.contractTitle, allCaps: true, bold: true, size: FONT.SIZE_14 })],
          }),
          ...projectDetailTable(contractInformationTable),
          new Paragraph({
            children: hbsMdToRuns(dump[1], { signDate, partyB: parties.partyB }),
          }),
          ...createPartyATable(parties.partyA),
          ...createPartyBTable(parties.partyB),
          new Paragraph({
            children: hbsMdToRuns(dump[2]),
          }),

          new Paragraph({
            numbering: { reference: 'article-numbering', level: 0 },
            children: [
              new TextRun({
                text: articleObjectOfcontract.title_,
                allCaps: true,
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
                text: articleObjectOfcontract.b1,
                bold: true,
              }),
            ],
          }),
          ...projectWorkDetailTable({ projectWorkDetails, quotationDate: quotationDate.text2 }, INDENT.L1_LEFT),
          new Paragraph({}),
          ...renderArticle(articleObjectOfcontract),
          new Paragraph({}),
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 0 },
            children: [
              new TextRun({
                text: articleDocumentAttachToTheContract.title_,
                bold: true,
                size: FONT.SIZE_14,
              }),
            ],
          }),
          ...renderArticle(articleDocumentAttachToTheContract, { quotationDate }),
          ...renderArticle(articleContractPeriod, { contractPeriodPhrase, transportationLocation }),
          ...createPaymentArticle(contract, { moneyFormat, moneyPayment1Format, moneyPayment2Format }),

          // //
          new Paragraph({
            numbering: { reference: 'article-numbering', level: 1 },
            children: [
              new TextRun({
                text: 'Bank Information',
                bold: true,
              }),
            ],
          }),
          ...bankAccoutTable(contract.bankInformation),

          ...requireDocumentTable(contract.requireDocument),

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
            children: hbsMdToRuns(contract.packing),
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
            children: hbsMdToRuns(contract.consignee.company),
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: hbsMdToRuns(contract.consignee.address),
          }),
          // //
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
            children: hbsMdToRuns(contract.notifyParty.company),
          }),
          new Paragraph({
            indent: { left: INDENT.L1_LEFT },
            children: hbsMdToRuns(contract.notifyParty.address),
          }),
          // //
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
            children: hbsMdToRuns(contract.pol),
          }),
          // //
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
            children: hbsMdToRuns(contract.pod),
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
            children: hbsMdToRuns(contract.shipmentTerms),
          }),
          // //
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

          ...renderArticle(articleauthorityAndResponsibilitiesOfPartyA),
          ...renderArticle(articleauthorityAndResponsibilitiesOfPartyB),
          ...renderArticle(articleWarranty),
          ...renderArticle(articleTermination),
          ...renderArticle(articleLiquidation),
          ...renderArticle(forceMajeure),
          ...renderArticle(commonArticle),
          new Paragraph({}),
          //
          ...signinTable({
            partyA: {
              company: parties.partyA.company.value,
              representedBy: parties.partyA.represented.value,
              position: parties.partyA.position.value,
            },
            partyB: {
              company: parties.partyB.company.value,
              representedBy: parties.partyB.represented.value,
              position: parties.partyB.position.value,
            },
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
