const DEFAULT_CONTRACT_VALUE = {
  dump: {
    contractTitle: 'SALE CONTRACT',
    underTitle: `(Under {{incotermQuote}})`,
    1: 'This Contract is entered into on {{signDate}} at the office of {{partyBCompany}} between the two parties:',
    2: 'After negotiation, both parties have mutually agreed to sign this contract (“**Contract**”) with the following terms and conditions:',
  },
  article: {
    articleObjectOfcontract: {
      title_: 'OBJECT OF THE CONTRACT',
      b1: 'Party A agrees to engage Party B for the supply and execution of steel structure works as described below:',
      block: [
        // {
        //   type: 'paragraph',
        //   text: 'Definition of the Works',
        //   level: 1,
        //   items: {
        //     intent: 1,
        //     val: [
        //       'For the purpose of this Contract, the term **“Steel-Structure Works”** (hereinafter referred to as **the Project**) shall include, but shall not be limited to, the following activities to be performed by Party B:',
        //     ],
        //   },
        // },
        {
          type: 'paragraph',
          text: 'Party A engages Party B to supply and execute the steel-structure works (hereinafter called “the **Project**”) as described in the Contract Information Sheet (Project, Item, Location).',
          level: 1,
        },
        {
          type: 'paragraph',
          text: 'The volume of works shall follow Party B’s Quotation dated {{quotationDate}}, together with Party A’s architectural drawings and Party B’s shop drawings as approved by Party A.',
          level: 1,
        },
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
      title_: 'CONTRACT DOCUMENTS',
      block: [
        {
          type: 'paragraph',
          text: '_**Quotation date: {{quotationDate}}**_',
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
          text: 'Project execution period: is TBE (To be Established) from the latest date of contract signature, party B receives the advance payment from party A as stated at the Article 4 of this Contract and Party A approves the shop drawings for fabrication prepared by Party B. The Execution Period shall be divided into the following 5 phases:',
        },
        {
          type: 'paragraph',
          level: 2,
          text: '{{periods.preparation.qty}} {{periods.preparation.unit}} for preparation of approval drawings.',
        },
        {
          type: 'paragraph',
          level: 2,
          text: `{{periods.approval.qty}} {{periods.approval.unit}} allocation for customer's (Party A) approval.`,
        },
        {
          type: 'paragraph',
          level: 2,
          text: `{{periods.shopDrawing.qty}} {{periods.shopDrawing.unit}} for preparation of shop drawings.`,
        },
        {
          type: 'paragraph',
          level: 2,
          text: `{{periods.fabrication.qty}} {{periods.fabrication.unit}} fabrication period reckoned from the date the approval drawings are approved.`,
        },
        {
          type: 'paragraph',
          level: 2,
          text: `{{periods.transportation.qty}} {{periods.transportation.unit}} for transportation from factory to {{transportationLocation}}`,
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
          text: 'The warranty period for the Works shall be twelve (12) months from the date of arrival at Party A’s port of destination. The warranty period of Design is ten (10) years.',
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
              '- Party A or the third party undertakes dismantling or relocation by itself, resulting in damages not covered under this Contract.',
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
              '- Pay a penalty equivalent to fifteen percent (15%) of the total outstanding Contract value; and',
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
          text: 'Neither Party shall be liable for any failure or delay in performing its obligations under this Contract if such failure or delay is caused by **force majeure**, including but not limited to war, severe fire, flood, typhoon, earthquake, riots, civil disturbances, embargo, government regulations or orders, vessel congestion, or any other circumstances beyond the reasonable control of the Parties.',
        },
        {
          type: 'paragraph',
          intent: 1,
          text: 'The Party affected by a force majeure event shall **promptly notify** the other Party in writing upon its occurrence and, within fourteen (14) days thereafter, shall provide a **certificate of the event issued by the competent government authorities** at the place of occurrence as evidence',
        },
        {
          type: 'paragraph',
          intent: 1,
          text: 'If such force majeure event continues for more than **ten (10) weeks**, either Party shall have the right to **terminate this Contract by giving fifteen (15) days’ prior written notice** to the other Party.',
        },
        {
          type: 'paragraph',
          intent: 1,
          text: '__Customs Inspection__: Should the Goods be subject to customs inspection at the port of departure or destination **for reasons not attributable to Party B**, all related costs and expenses shall be **borne by Party A (the Consignee)**',
        },
      ],
    },
    commonArticle: {
      title: 'COMMON ARTICLE',
      block: [
        {
          type: 'paragraph',
          level: 1,
          text: 'This Contract shall be governed by the prevailing laws of the **Socialist Republic of Vietnam**.',
        },
        {
          type: 'paragraph',
          level: 1,
          text: 'All disputes arising out of or in connection with this Contract which cannot be amicably settled within a reasonable period shall be finally settled by arbitration at the **Vietnam International Arbitration Centre (VIAC) at the Vietnam Chamber of Commerce and Industry (VCCI), Ho Chi Minh City**, in accordance with the **Arbitration Rules of VIAC** and under the laws of the Socialist Republic of Vietnam. The arbitral award shall be final and binding upon both Parties. The arbitration fee and all related costs shall be borne by the **losing Party**.',
        },
        {
          type: 'paragraph',
          level: 1,
          text: 'Both parties agree to perform all provisions of this Contract in good faith. Any amendments or supplements shall be made in writing and signed by both parties. Such amendments and supplements shall constitute an integral part of this Contract.',
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

    languageArticle: {
      title: 'LANGUAGE OF THE CONTRACT',
      block: [
        {
          type: 'paragraph',
          intent: 1,
          text: 'This Contract is executed in the English language only. All communications and documents relating to the performance of this Contract shall also be in English.',
        },
      ],
    },
  },

  format: {
    incotermRule: {
      DDP: 'The Contract Value is a lump sum, covering all costs related to **fabrication, packing, inland transportation, export customs clearance, ocean freight, marine insurance, import customs clearance, import duties, taxes, delivery to the agreed place of destination, and warranty** . Party B shall be responsible for all such costs until delivery to the agreed place of destination. The Contract Value shall not be subject to remeasurement of quantities.',
      EXW: 'The Contract Value is a lump sum, covering all costs related to **fabrication, packing, and warranty** . All other costs, including **inland transportation, export customs clearance, freight, insurance, import duties, and any taxes or charges at the country of destination** , shall be borne solely by Party A. The Contract Value shall not be subject to remeasurement of quantities.',
      CIF: 'The Contract Value is a lump sum, covering all costs related to **fabrication, packing, inland transportation to the port of loading, export customs clearance, ocean freight, marine insurance, and warranty** . Import duties, taxes, and all charges at the country of destination shall be borne solely by Party A. The Contract Value shall not be subject to remeasurement of quantities.',
      FOB: 'The Contract Value is a lump sum, covering all costs related to **fabrication, packing, inland transportation to the port of loading, export customs clearance, loading onto the vessel, and warranty**. All costs beyond loading on board the vessel, including **ocean freight, marine insurance, import duties, and taxes at the country of destination**, shall be borne solely by Party A (the Buyer). The Contract Price shall not be subject to remeasurement of quantities.',
    },

    contractValueText:
      'The Contract Value is fixed at **{{commercial.contractValue.currencyCode}} {{formatContractValue}}**',
    contractValueInWord: '*(In words: {{contractValueInWords}})*.',
    contractDeliveryTermText:
      'Delivery term: **{{commercial.incoterm.rule}} {{commercial.incoterm.location}}, Incoterms® {{commercial.incoterm.year}}**.',
  },

  packing: 'Steel members shall be packed into containers as per Dai Nghia packing practice.',
};

const EX_BODY = {
  headerImagePath: 'assets/header/1.png',
  signDate: '2025-09-27',
  quotationDate: '2025-09-22',
  info: {
    no: {
      key: 'No',
      value: '25KCT28',
    },
    project: {
      key: '**Project**',
      value: 'WH 20x25',
      markup: {
        caplockValue: true,
        boldValue: true,
      },
    },
    item: {
      key: '**Item**',
      value: 'STEEL STRUCTURE',
      markup: {
        caplockValue: true,
        boldValue: true,
      },
    },
    location: {
      key: '**Location**',
      value: 'THAILAND',
      markup: {
        caplockValue: true,
        boldValue: true,
      },
    },
  },
  parties: {
    A: {
      title: '(Hereinafter referred to as **Party A**)',
      company: {
        key: '**PARTY A (BUYER)**',
        value: 'BANGSUE ENGINEERING CO., LTD',
        markup: {
          caplockValue: true,
          boldValue: true,
        },
        multiline: false,
        canDelete: false,
        id: 'A-company',
      },
      representedBy: {
        key: '**Represented by**',
        value: 'MR. PIYARAT SUWANNAKHA',
        markup: {
          boldValue: true,
        },
        multiline: false,
        canDelete: false,
        id: 'A-representedBy',
      },
      position: {
        key: 'Position',
        value: 'Manager',
        multiline: false,
        canDelete: false,
        id: 'A-position',
      },
      address: {
        key: 'Address',
        value: '157 Moo 5, Mahasawat, Bangkruai, Nonthaburi, Thailand 11130',
        multiline: false,
        canDelete: false,
        id: 'A-address',
      },
      optional: [],
    },
    B: {
      title: '(Hereinafter referred to as **Party B**)',
      company: {
        key: '**PARTY B (SUPPLIER)**',
        value: 'DAI NGHIA INDUSTRIAL MECHANICS CO., LTD',
        markup: {
          caplockValue: true,
          boldValue: true,
        },
      },
      representedBy: {
        key: '**Represented by**',
        value: 'Mr. Le Xuan Nghia',
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
      optional: [],
    },
  },
  projectWorkScope: {
    item: {
      volOfWork: {
        key: '*. Volume of works',
        value:
          'As specified in Party B’s Quotation dated {{quotationDate}}, including the scope of quotation, the list of materials and applicable standards attached to this Contract, Party A’s architectural design drawings, and Party B’s steel structure design drawings as approved by Party A.',
      },
    },
  },
  periods: {
    preparation: {
      qty: 1,
      unit: 'week',
      format: 'for preparation of approval drawings.',
    },
    approval: {
      qty: 1,
      unit: 'week',
      format: "allocation for customer's (Party A) approval.",
    },
    shopDrawing: {
      qty: 1,
      unit: 'week',
      format: 'for preparation of shop drawings.',
    },
    fabrication: {
      qty: 6,
      unit: 'weeks',
      format: 'fabrication period reckoned from the date the approval drawings are approved.',
    },
    transportation: {
      qty: 2,
      unit: 'weeks',
      format: 'for transportation from factory to {{transportationLocation}}',
    },
  },
  commercial: {
    incoterm: {
      rule: 'CIF',
      year: '2010',
      location: 'Bangkok Port - Thailand',
    },
    contractValue: {
      currencyCode: 'USD',
      value: 22800,
    },
    bank: {
      beneficiary: {
        key: 'Beneficiary',
        value: 'DAI NGHIA INDUSTRIAL MECHANICS CO., LTD',
        markup: { boldValue: true },
      },
      accountNo: {
        key: 'Bank account No.',
        value: '1032407684',
        markup: { boldValue: true },
      },
      bankName: {
        key: 'Bank',
        value: 'Joint Stock Commercial Bank for Foreign Trade of Viet Nam',
        markup: { boldValue: true },
      },
      branch: {
        key: 'Branch',
        value: 'Tan Binh',
        markup: { boldValue: true },
      },
      address: {
        key: 'Address',
        value: '108 Tay Thanh Street, Tay Thanh Ward, Ho Chi Minh City, Vietnam',
        markup: { boldValue: true },
      },
      swift: {
        key: 'SWIFT Code',
        value: 'BFTVVNVX044',
        markup: { boldValue: true },
      },
    },
    documents: [
      {
        key: '- Commercial Invoice',
        value: '01 original(s) electronic',
      },
      {
        key: '- Packing list',
        value: '01 original(s) electronic',
      },
      {
        key: '- Bill of Lading',
        value: '01 surrender Bill',
      },
      {
        key: '- Certificate of Origin (Form D)',
        value: '01 original(s) electronic',
      },
    ],
    consignee: {
      company: 'BANGSUE ENGINEERING CO., LTD',
      address: '157 Moo 5, Mahasawat, Bangkruai, Nonthaburi, Thailand 11130',
    },
    notifyParty: {
      company: 'BANGSUE ENGINEERING CO., LTD',
      address: '157 Moo 5, Mahasawat, Bangkruai, Nonthaburi, Thailand 11130',
    },
    pol: 'Ho Chi Minh City Port, Viet Nam',
    pod: 'Bangkok Port - Thailand',
    shipmentTerms: 'CIF Bangkok Port - Thailand, Incoterms® 2010',
  },
  payments: [
    {
      id: 'p1',
      title: 'FIRST PAYMENT',
      percent: 30,
      days: 7,
      term: 'Telegraphic Transfer (T/T)',
      format: {
        paymentPercentText: 'First Payment: Party A shall pay {{percentInWords}} ({{percent}}%) of the Contract Value.',
        paymentValueText: '{{currency}} {{contractValue}} x {{percent}}% = {{currency}} {{paymentValue}}',
        moneyTextInword: `*(In words: {{paymentInWords}})*`,
        termText: 'by {{term}} within {{daysInWords}} ({{days}}) calendar days from the date of Contract signing',
        endText:
          'Receipt of this payment shall be a condition precedent for Party B to commence fabrication, subject to drawing approval.',
      },
    },
    {
      id: 'p2',
      title: 'SECOND PAYMENT',
      percent: 70,
      days: 7,
      term: 'Telegraphic Transfer (T/T)',
      format: {
        paymentPercentText: 'Second Payment: Party A shall pay {{percentInWords}} ({{percent}}%) of the Contract Value.',
        paymentValueText: '{{currency}} {{contractValue}} x {{percent}}% = {{currency}} {{paymentValue}}',
        moneyTextInword: `*(In words: {{paymentInWords}})*`,
        termText:
          'by {{term}} within {{daysInWords}} ({{days}}) calendar days after completion of inspection at Party B’s factory in Vietnam and prior to shipment release.',
      },
    },
  ],
  appendPayments: [],
};

module.exports = {
  DEFAULT_CONTRACT_VALUE,
  EX_BODY,
};

// paymentAppend: [
//   {
//     title:
//       'The final payment (Upon Delivery in Canada): The remaining {{contract.paymentAppend.[0].percent.text}} ({{contract.paymentAppend.[0].percent.num}}%) balance shall be paid by Party A to Party B upon successful delivery of the goods to the destination in Canada.',
//     paymentValueText:
//       '{{contract.money.unit}} {{contractCurrencyFormat}} x {{contract.paymentAppend.[0].percent.num}}% = {{contract.money.unit}} {{appendPaymentValue}}',
//     termText: 'by {{contract.paymentAppend.[0].term}}',
//     moneyTextInword: '*(In words: {{contract.paymentAppend.[0].money.text}})*',
//     percent: {
//       num: 5,
//       text: 'five percent',
//     },
//     money: {
//       text: 'United States Dollars four thousand eight hundred forty-five dollars and fifty-five cents only',
//     },
//     term: 'By T/T upon delivery in Canada.',
//   },
// ],
