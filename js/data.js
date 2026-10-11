/* FS Pulse content file. Edit ONLY this file to publish a new edition.
 *
 * STRUCTURE
 *   countries : KSA, TR, EG with colour, regulators and policy-rate label.
 *   areas     : 7 areas of interest (key, label, description). Each item has one primary and an optional secondary area.
 *   lines     : 5 business lines. An item can touch several.
 *   actions   : act / assess / monitor / note (non-overlapping).
 *   owners    : list used in the owner dropdown.
 *   editions  : number, start, end, published, inBrief, rates{KSA,TR,EG}{value,note}, nil[] (countries with a nil return) and optional nilNote.
 *               The latest edition is the one with the newest end date.
 *   items     : id (unique, e.g. e21-01), edition, date, country, primary, secondary (or null), lines[], title, summary, why,
 *               impact (1-3), urgency (1-3), action (suggested), owner (default), sources[{name,url}].
 *
 * SCORING
 *   Priority score = impact x urgency. High >= 6, Medium 3-5, Low <= 2.
 *   Impact:  1 marginal / indirect; 2 one line or process, or a small margin or loss effect; 3 material (licence, funding cost, a main line, loss rates).
 *   Urgency: 1 over 6 months or no deadline; 2 within 3-6 months; 3 within 3 months or already in force.
 *            For data-only items, urgency is 2 if the signal could change a decision within six months, otherwise 1.
 *
 * TO PUBLISH A NEW EDITION: add an object to editions, add its items (with the new edition number), and list any country with
 * nothing material in nil[] instead of adding filler. Replace every "TODO" source link with a deep link before publishing.
 */
window.FSPULSE = {
 "countries": {
  "KSA": {
   "name": "Saudi Arabia",
   "colour": "#0f7b4a",
   "regulators": [
    "SAMA (Saudi Central Bank): finance company licensing and supervision",
    "SIMAH: credit bureau"
   ],
   "rateLabel": "SAMA repo rate"
  },
  "TR": {
   "name": "Türkiye",
   "colour": "#c8102e",
   "regulators": [
    "BDDK: banking and financing company regulator",
    "TCMB (CBRT): monetary policy and macroprudential tools"
   ],
   "rateLabel": "TCMB one-week repo"
  },
  "EG": {
   "name": "Egypt",
   "colour": "#b8860b",
   "regulators": [
    "FRA: non-bank financial services, consumer finance and MSME finance",
    "CBE: monetary policy and banking",
    "I-Score: Egyptian credit bureau"
   ],
   "rateLabel": "CBE overnight deposit rate"
  }
 },
 "areas": [
  {
   "key": "regulation",
   "label": "Regulation & Compliance",
   "desc": "Rules, licences, supervisory action and enforcement."
  },
  {
   "key": "macro",
   "label": "Monetary & Macro",
   "desc": "Central-bank policy, inflation, FX, growth and geopolitics."
  },
  {
   "key": "funding",
   "label": "Funding & Capital Markets",
   "desc": "Raising and pricing debt or equity, liquidity, securitisation."
  },
  {
   "key": "competition",
   "label": "Competition",
   "desc": "Named competitors, new entrants, licences granted, market share."
  },
  {
   "key": "product",
   "label": "Product Innovation",
   "desc": "New or changed financial products and features."
  },
  {
   "key": "retail",
   "label": "Retail & Customer Innovation",
   "desc": "Customer behaviour, channels, demand and spending."
  },
  {
   "key": "credit",
   "label": "Credit Risk & Asset Quality",
   "desc": "NPLs, bureau data, fraud, affordability, credit-growth caps."
  }
 ],
 "lines": [
  {
   "key": "consumer",
   "label": "Consumer finance / BNPL"
  },
  {
   "key": "sme",
   "label": "SME finance"
  },
  {
   "key": "auto",
   "label": "Auto & leasing"
  },
  {
   "key": "treasury",
   "label": "Treasury & funding"
  },
  {
   "key": "ops",
   "label": "Operations & compliance"
  }
 ],
 "actions": [
  {
   "key": "act",
   "label": "Act now",
   "def": "Change policy, product, pricing or process this fortnight."
  },
  {
   "key": "assess",
   "label": "Assess impact",
   "def": "Size the impact and bring a recommendation to the next review."
  },
  {
   "key": "monitor",
   "label": "Monitor",
   "def": "No change yet; track developments against a named signal."
  },
  {
   "key": "note",
   "label": "Note only",
   "def": "Context for leadership; no follow-up."
  }
 ],
 "owners": [
  "CEO / ExCo",
  "Strategy",
  "Risk",
  "Compliance",
  "Treasury",
  "Product",
  "Commercial",
  "Collections",
  "IT & Data",
  "Operations",
  "Legal"
 ],
 "editions": [
  {
   "number": 17,
   "start": "2026-08-03",
   "end": "2026-08-16",
   "published": "2026-08-16",
   "inBrief": "valU opens a securitisation shelf just as the CBE raises risk weights on bank-held bonds, which could squeeze Egyptian lenders' funding; Saudi Arabia and Türkiye bring only context.",
   "rates": {
    "KSA": {
     "value": "4.25%",
     "note": "Unchanged · tracks the Fed"
    },
    "TR": {
     "value": "37%",
     "note": "Held · next MPC 10 Sep"
    },
    "EG": {
     "value": "19%",
     "note": "Held · next MPC 20 Aug"
    }
   },
   "nil": []
  },
  {
   "number": 18,
   "start": "2026-08-17",
   "end": "2026-08-30",
   "published": "2026-08-30",
   "inBrief": "Egyptian consumer finance grew 88.5% in H1 and Türkiye's repo-auction restart cut funding costs to 37%, while Saudi BNPL overspending evidence points to tighter affordability scrutiny.",
   "rates": {
    "KSA": {
     "value": "4.25%",
     "note": "Unchanged"
    },
    "TR": {
     "value": "37%",
     "note": "Auctions resumed 23 Aug · next MPC 10 Sep"
    },
    "EG": {
     "value": "19%",
     "note": "Held 20 Aug · next MPC 24 Sep"
    }
   },
   "nil": []
  },
  {
   "number": 19,
   "start": "2026-08-31",
   "end": "2026-09-13",
   "published": "2026-09-13",
   "inBrief": "Egypt's FRA issues a first consumer-finance rulebook and mandates real-time I-Score reporting, putting build deadlines on lenders, while Türkiye holds at 37% and signals income-linked card limits.",
   "rates": {
    "KSA": {
     "value": "4.25%",
     "note": "Unchanged · tracks the Fed's mid-Sep decision"
    },
    "TR": {
     "value": "37%",
     "note": "Held 10 Sep · next MPC 22 Oct"
    },
    "EG": {
     "value": "19%",
     "note": "Held 20 Aug · next MPC 24 Sep"
    }
   },
   "nil": [
    "KSA"
   ],
   "nilNote": "Sources checked: [list to be completed before publication]."
  },
  {
   "number": 20,
   "start": "2026-09-14",
   "end": "2026-09-27",
   "published": "2026-09-27",
   "inBrief": "SAMA's 25bp hike lifts Saudi funding costs and Tabby's doubled valuation on a move into regulated lending sharpens competition, while Türkiye's retail credit cools and Egypt holds at 19%.",
   "rates": {
    "KSA": {
     "value": "4.50%",
     "note": "+25bp on 16 Sep"
    },
    "TR": {
     "value": "37%",
     "note": "Unchanged · next MPC 22 Oct"
    },
    "EG": {
     "value": "19%",
     "note": "Held 24 Sep · next MPC date to confirm"
    }
   },
   "nil": []
  },
  {
   "number": 21,
   "start": "2026-09-28",
   "end": "2026-10-11",
   "published": "2026-10-11",
   "inBrief": "Türkiye eases SME credit limits and tightens card repayments, Egypt licenses 12 more non-bank lenders as the IMF programme nears its 15 Dec end, and Saudi consumer spending is strong against rising regional risk.",
   "rates": {
    "KSA": {
     "value": "4.50%",
     "note": "No change since +25bp on 16 Sep"
    },
    "TR": {
     "value": "37%",
     "note": "Unchanged · next MPC 22 Oct"
    },
    "EG": {
     "value": "19%",
     "note": "Unchanged · next MPC date to confirm"
    }
   },
   "nil": []
  }
 ],
 "items": [
  {
   "id": "e17-01",
   "edition": 17,
   "date": "2026-08-04",
   "country": "EG",
   "primary": "funding",
   "secondary": "regulation",
   "lines": [
    "treasury"
   ],
   "title": "valU opens EGP 1bn securitisation shelf as CBE lifts risk weights on bank-held bonds",
   "summary": "valU has set up a new EGP 1bn securitisation programme. Around the same time, the central bank raised the risk weights that banks apply to bonds they hold.",
   "why": "Points to a decision on whether our ABS plans and bank-investor pricing assumptions still hold, since bank appetite for securitised paper may weaken.",
   "impact": 3,
   "urgency": 2,
   "action": "assess",
   "owner": "Treasury",
   "sources": [
    {
     "name": "Launchbase Africa",
     "url": "https://launchbaseafrica.com/2026/08/04/valu-tests-new-20m-debt-deal-amid-central-bank-squeeze/"
    }
   ]
  },
  {
   "id": "e17-02",
   "edition": 17,
   "date": "2026-08-10",
   "country": "EG",
   "primary": "competition",
   "secondary": "credit",
   "lines": [
    "consumer"
   ],
   "title": "valU H1: net income up 43%, 21% market share, NPL 1.16%",
   "summary": "valU reported H1 2026 net income up 43% to EGP 486mn, with a 21% market share and a 1.16% NPL ratio. Quarterly growth slowed in Q2.",
   "why": "Benchmark for our Egypt growth, share and asset-quality targets; informs whether to defend share or tighten underwriting.",
   "impact": 2,
   "urgency": 2,
   "action": "monitor",
   "owner": "Strategy",
   "sources": [
    {
     "name": "Enterprise",
     "url": "https://enterpriseam.com/egypt/2026/08/11/valus-net-income-rose-43-in-1h-2026-but-quarterly-growth-slowed-sharply-in-2q/"
    }
   ]
  },
  {
   "id": "e17-03",
   "edition": 17,
   "date": "2026-08-10",
   "country": "KSA",
   "primary": "retail",
   "secondary": "competition",
   "lines": [
    "consumer"
   ],
   "title": "Saudi BNPL market put at US$5.29bn in 2026",
   "summary": "A market report values Saudi BNPL at US$5.29bn in 2026 and projects US$7.31bn by 2031.",
   "why": "Sizing context for the KSA BNPL plan; no decision this fortnight.",
   "impact": 2,
   "urgency": 1,
   "action": "note",
   "owner": "Strategy",
   "sources": [
    {
     "name": "Yahoo Finance (market report)",
     "url": "https://finance.yahoo.com/small-business/articles/saudi-arabia-buy-now-pay-154300109.html"
    }
   ]
  },
  {
   "id": "e17-04",
   "edition": 17,
   "date": "2026-08-03",
   "country": "TR",
   "primary": "regulation",
   "secondary": "product",
   "lines": [
    "consumer"
   ],
   "title": "Türkiye still has no standalone BNPL licence",
   "summary": "A legal analysis says Türkiye has no standalone BNPL licence, and that whoever bears the credit risk decides which rules apply.",
   "why": "Shapes how any Turkish instalment product would be structured and licensed; Legal should record the current position.",
   "impact": 2,
   "urgency": 1,
   "action": "monitor",
   "owner": "Legal",
   "sources": [
    {
     "name": "Advocate Turkey",
     "url": "https://advocateturkey.com/2026/08/03/buy-now-pay-later-regulation-in-turkey-is-bnpl-a-regulated-financial-service/"
    }
   ]
  },
  {
   "id": "e18-01",
   "edition": 18,
   "date": "2026-08-23",
   "country": "TR",
   "primary": "macro",
   "secondary": "funding",
   "lines": [
    "treasury"
   ],
   "title": "TCMB resumes one-week repo auctions; average funding cost falls from 40% to 37%",
   "summary": "The central bank restarted one-week repo auctions, which brought average funding cost down from 40% to 37%.",
   "why": "Test whether cheaper bank funding should feed through to our Turkish credit-line pricing, and whether to reopen terms with lenders.",
   "impact": 2,
   "urgency": 2,
   "action": "assess",
   "owner": "Treasury",
   "sources": [
    {
     "name": "Akbank IR (MPC decision, PDF)",
     "url": "https://www.akbankinvestorrelations.com/en/images/pdf/2026_09_11_September_MPC_Decision.pdf"
    }
   ]
  },
  {
   "id": "e18-02",
   "edition": 18,
   "date": "2026-08-30",
   "country": "EG",
   "primary": "retail",
   "secondary": "competition",
   "lines": [
    "consumer"
   ],
   "title": "Egypt's non-bank consumer finance up 88.5% in H1",
   "summary": "Non-bank consumer finance in Egypt grew 88.5% year on year in H1 2026, reaching EGP 71.8bn.",
   "why": "Signals strong demand and more rivals; informs Egypt growth targets and capacity planning.",
   "impact": 2,
   "urgency": 2,
   "action": "monitor",
   "owner": "Strategy",
   "sources": [
    {
     "name": "Arab Finance",
     "url": "https://arabfinance.com/en/news/newdetails/egypt-consumer-financing-leaps-in-h1-2026"
    }
   ]
  },
  {
   "id": "e18-03",
   "edition": 18,
   "date": "2026-08-20",
   "country": "EG",
   "primary": "macro",
   "secondary": "funding",
   "lines": [
    "treasury"
   ],
   "title": "CBE keeps policy rates on hold at 19%",
   "summary": "The central bank left its policy rates unchanged at 19%.",
   "why": "Funding costs stay high, which supports keeping current EGP pricing assumptions.",
   "impact": 2,
   "urgency": 2,
   "action": "monitor",
   "owner": "Treasury",
   "sources": [
    {
     "name": "CBE: MPC press release",
     "url": "https://www.cbe.org.eg/en/news-publications/news/2026/08/20/15/17/mpc-press-release-20-august-2026"
    }
   ]
  },
  {
   "id": "e18-04",
   "edition": 18,
   "date": "2026-08-24",
   "country": "KSA",
   "primary": "credit",
   "secondary": "regulation",
   "lines": [
    "consumer"
   ],
   "title": "Study links frequent Saudi BNPL use to overspending and debt",
   "summary": "A study of Saudi BNPL users finds that frequent use is associated with overspending and a build-up of debt.",
   "why": "Affordability evidence that could draw regulatory attention; Risk should consider limits for repeat borrowers.",
   "impact": 2,
   "urgency": 2,
   "action": "monitor",
   "owner": "Risk",
   "sources": [
    {
     "name": "The Financial Analyst",
     "url": "https://thefinancialanalyst.net/2026/08/24/bnpls-double-edged-sword-in-saudi-arabia/"
    }
   ]
  },
  {
   "id": "e18-05",
   "edition": 18,
   "date": "2026-08-24",
   "country": "EG",
   "primary": "regulation",
   "secondary": "credit",
   "lines": [
    "consumer"
   ],
   "title": "FRA acts on EGP 319mn unauthorised-financing case at a Cairo school",
   "summary": "The FRA took action over EGP 319mn of financing provided without authorisation at a school in Cairo.",
   "why": "Shows unlicensed activity is being enforced; check that our school-fee and partner financing stays within licence scope.",
   "impact": 1,
   "urgency": 2,
   "action": "note",
   "owner": "Compliance",
   "sources": [
    {
     "name": "Enterprise (TODO: confirm source; link currently points to the I-Score article)",
     "url": "https://enterpriseam.com/egypt/2026/09/13/fra-mandates-event-by-event-credit-reporting-for-non-bank-lenders/"
    }
   ]
  },
  {
   "id": "e19-01",
   "edition": 19,
   "date": "2026-09-13",
   "country": "EG",
   "primary": "regulation",
   "secondary": "credit",
   "lines": [
    "consumer",
    "sme",
    "ops"
   ],
   "title": "FRA mandates real-time, event-by-event I-Score reporting",
   "summary": "Consumer and MSME lenders must now report each financing event to the I-Score credit bureau as it happens, instead of in periodic batches.",
   "why": "Decide now to start the integration build and confirm the effective date and deadline; this affects IT, Operations and Collections.",
   "impact": 2,
   "urgency": 3,
   "action": "act",
   "owner": "IT & Data",
   "sources": [
    {
     "name": "Enterprise",
     "url": "https://enterpriseam.com/egypt/2026/09/13/fra-mandates-event-by-event-credit-reporting-for-non-bank-lenders/"
    },
    {
     "name": "Ahram Online",
     "url": "https://english.ahram.org.eg/NewsContent/3/12/576524/Business/Economy/Egypt-mandates-realtime-credit-reporting-for-consu.aspx"
    },
    {
     "name": "Daily News Egypt",
     "url": "https://www.dailynewsegypt.com/2026/09/12/fra-requires-msme-consumer-finance-providers-to-establish-real-time-connectivity-with-iscore/"
    }
   ]
  },
  {
   "id": "e19-02",
   "edition": 19,
   "date": "2026-09-05",
   "country": "EG",
   "primary": "regulation",
   "secondary": null,
   "lines": [
    "consumer",
    "ops"
   ],
   "title": "FRA publishes first consolidated consumer-finance rulebook",
   "summary": "The FRA has issued its first single guide covering the rules that apply to consumer finance companies.",
   "why": "Run a gap check of our Egyptian policies and procedures against the guide and decide what to change.",
   "impact": 2,
   "urgency": 2,
   "action": "assess",
   "owner": "Compliance",
   "sources": [
    {
     "name": "SIS Egypt",
     "url": "https://sis.gov.eg/en/media-center/news/egypt-fra-issues-first-comprehensive-consumer-finance-guide/"
    }
   ]
  },
  {
   "id": "e19-03",
   "edition": 19,
   "date": "2026-09-10",
   "country": "TR",
   "primary": "macro",
   "secondary": "funding",
   "lines": [
    "treasury"
   ],
   "title": "TCMB holds policy rate at 37% for a fifth straight meeting",
   "summary": "The central bank kept its policy rate at 37%, the fifth consecutive hold.",
   "why": "No relief on TRY funding costs before the 22 Oct meeting; keep pricing assumptions unchanged.",
   "impact": 2,
   "urgency": 2,
   "action": "monitor",
   "owner": "Treasury",
   "sources": [
    {
     "name": "TCMB: rate decision",
     "url": "https://www.tcmb.gov.tr/wps/wcm/connect/EN/TCMB+EN/Main+Menu/Announcements/Press+Releases/2026/ANO2026-38"
    }
   ]
  },
  {
   "id": "e19-04",
   "edition": 19,
   "date": "2026-09-09",
   "country": "TR",
   "primary": "regulation",
   "secondary": "credit",
   "lines": [
    "consumer"
   ],
   "title": "Medium-term programme: card limits to be checked against income data",
   "summary": "The 2027–29 medium-term programme says credit-card limits will be checked against income data held by the social-security system.",
   "why": "Could tighten consumer credit and push borrowers towards non-bank products; Risk should consider income verification in Turkish underwriting.",
   "impact": 2,
   "urgency": 2,
   "action": "monitor",
   "owner": "Risk",
   "sources": [
    {
     "name": "Adalytica",
     "url": "https://adalytica.com/news/turkey-credit-card-limits-income-a3064834"
    }
   ]
  },
  {
   "id": "e20-01",
   "edition": 20,
   "date": "2026-09-16",
   "country": "KSA",
   "primary": "macro",
   "secondary": "funding",
   "lines": [
    "treasury",
    "consumer",
    "sme",
    "auto"
   ],
   "title": "SAMA raises repo rate 25bp to 4.50%, tracking the Fed",
   "summary": "SAMA raised its repo rate by 25bp to 4.50% and its reverse repo rate by the same amount to 4.00%, in line with the Fed.",
   "why": "Decide whether to reprice new SAR lending and review hedges and floating-rate lines now.",
   "impact": 3,
   "urgency": 3,
   "action": "act",
   "owner": "Treasury",
   "sources": [
    {
     "name": "SPA",
     "url": "https://www.spa.gov.sa/en/N2678377"
    },
    {
     "name": "SAMA",
     "url": "https://www.sama.gov.sa/en-us/MediaCenter/News/Pages/news-1169.aspx"
    }
   ]
  },
  {
   "id": "e20-02",
   "edition": 20,
   "date": "2026-09-16",
   "country": "KSA",
   "primary": "competition",
   "secondary": "product",
   "lines": [
    "consumer",
    "sme"
   ],
   "title": "Tabby's valuation doubles to US$6.5bn as it moves beyond BNPL",
   "summary": "After a US$233mn equity raise, Tabby is valued at US$6.5bn and is expanding from BNPL into regulated lending.",
   "why": "A direct competitor is moving into our core products; Strategy should assess pricing, partner and merchant responses.",
   "impact": 3,
   "urgency": 2,
   "action": "assess",
   "owner": "Strategy",
   "sources": [
    {
     "name": "ME Observer",
     "url": "https://meobserver.news/business-economix/market-updates-finance/2026/09/16/tabby-doubles-valuation-to-6-5bn-as-saudi-fintech-expands-beyond-bnpl/"
    },
    {
     "name": "Ground News (Arab News)",
     "url": "https://ground.news/article/saudi-fintech-firm-tabby-raises-233m-to-expand-financial-services"
    }
   ]
  },
  {
   "id": "e20-03",
   "edition": 20,
   "date": "2026-09-16",
   "country": "KSA",
   "primary": "retail",
   "secondary": "product",
   "lines": [
    "consumer"
   ],
   "title": "SAMA announces Tap to Pay on iPhone for Saudi Arabia",
   "summary": "SAMA said Tap to Pay on iPhone is coming to Saudi Arabia.",
   "why": "Merchant acceptance is getting easier; a minor point for merchant-partner conversations.",
   "impact": 1,
   "urgency": 1,
   "action": "note",
   "owner": "Product",
   "sources": [
    {
     "name": "SAMA (home page; TODO: deep link)",
     "url": "http://sama.gov.sa/en-US/pages/default.aspx"
    }
   ]
  },
  {
   "id": "e20-04",
   "edition": 20,
   "date": "2026-09-27",
   "country": "KSA",
   "primary": "credit",
   "secondary": "competition",
   "lines": [
    "consumer",
    "sme"
   ],
   "title": "A&M Banking Pulse Q2-26: NPLs 0.9%, cost of risk up to 0.32%",
   "summary": "Alvarez & Marsal's Q2 2026 review shows Saudi bank lending up 1.8% on the quarter, NPLs at 0.9% and cost of risk rising to 0.32%.",
   "why": "Bank asset quality is strong but cost of risk is edging up; use it as a benchmark when setting our provisions.",
   "impact": 2,
   "urgency": 2,
   "action": "monitor",
   "owner": "Risk",
   "sources": [
    {
     "name": "Alvarez & Marsal",
     "url": "https://www.alvarezandmarsal.com/thought-leadership/alvarez-marsal-releases-q2-2026-ksa-banking-pulse"
    }
   ]
  },
  {
   "id": "e20-05",
   "edition": 20,
   "date": "2026-09-17",
   "country": "TR",
   "primary": "macro",
   "secondary": "retail",
   "lines": [
    "consumer",
    "sme",
    "auto"
   ],
   "title": "TCMB minutes: retail loan growth slows to 2%; TRY commercial rates ease",
   "summary": "The minutes say retail loan growth slowed to a 2% four-week average and TRY commercial loan rates eased to 49.3%.",
   "why": "Cooler demand and lower bank pricing set the benchmark for our Turkish consumer and SME pricing.",
   "impact": 2,
   "urgency": 2,
   "action": "monitor",
   "owner": "Strategy",
   "sources": [
    {
     "name": "TCMB: MPC summary",
     "url": "https://www.tcmb.gov.tr/wps/wcm/connect/EN/TCMB+EN/Main+Menu/Announcements/Press+Releases/2026/ANO2026-42"
    }
   ]
  },
  {
   "id": "e20-06",
   "edition": 20,
   "date": "2026-09-25",
   "country": "TR",
   "primary": "competition",
   "secondary": null,
   "lines": [
    "consumer"
   ],
   "title": "Türkiye's licensed payment and e-money institutions reach 20 and 55",
   "summary": "Türkiye now has 20 licensed payment institutions and 55 licensed e-money institutions.",
   "why": "Context on fintech competition in payments; no direct lending decision.",
   "impact": 1,
   "urgency": 1,
   "action": "note",
   "owner": "Strategy",
   "sources": [
    {
     "name": "Fintech Türkiye (home page; TODO: deep link)",
     "url": "https://fintech.tr/en"
    }
   ]
  },
  {
   "id": "e20-07",
   "edition": 20,
   "date": "2026-09-24",
   "country": "EG",
   "primary": "macro",
   "secondary": "funding",
   "lines": [
    "treasury"
   ],
   "title": "CBE holds rates at 19% for a sixth consecutive meeting",
   "summary": "The central bank kept rates at 19% for the sixth meeting in a row.",
   "why": "Funding costs stay high; keep current EGP pricing assumptions.",
   "impact": 2,
   "urgency": 2,
   "action": "monitor",
   "owner": "Treasury",
   "sources": [
    {
     "name": "CBE: MPC schedule",
     "url": "https://www.cbe.org.eg/en/monetary-policy/mpc-meetings-schedule"
    }
   ]
  },
  {
   "id": "e20-08",
   "edition": 20,
   "date": "2026-09-20",
   "country": "EG",
   "primary": "macro",
   "secondary": "retail",
   "lines": [
    "consumer"
   ],
   "title": "Remittances reach US$29.7bn in first seven months of 2026",
   "summary": "Remittances from Egyptians abroad totalled US$29.7bn in the first seven months of 2026.",
   "why": "Supports household spending power and FX supply; context for Egyptian demand.",
   "impact": 1,
   "urgency": 1,
   "action": "note",
   "owner": "Strategy",
   "sources": [
    {
     "name": "CBE (home page; TODO: deep link)",
     "url": "https://www.cbe.org.eg/en"
    }
   ]
  },
  {
   "id": "e21-01",
   "edition": 21,
   "date": "2026-10-04",
   "country": "EG",
   "primary": "macro",
   "secondary": "funding",
   "lines": [
    "treasury"
   ],
   "title": "Egypt reserves hit US$57.3bn, pound softens, IMF programme ends 15 Dec",
   "summary": "Egypt's reserves reached a record US$57.3bn, but the pound weakened to about 52.3 per dollar. The IMF programme is due to end on 15 December.",
   "why": "Decide whether to review hard-currency funding and hedging ahead of the programme end.",
   "impact": 2,
   "urgency": 3,
   "action": "assess",
   "owner": "Treasury",
   "sources": [
    {
     "name": "CBE (home page; TODO: deep link)",
     "url": "https://www.cbe.org.eg/en"
    }
   ]
  },
  {
   "id": "e21-02",
   "edition": 21,
   "date": "2026-10-01",
   "country": "TR",
   "primary": "macro",
   "secondary": "funding",
   "lines": [
    "sme",
    "treasury"
   ],
   "title": "TCMB lifts SME loan growth cap to 5% and lowers TRY reserve blocking ratios",
   "summary": "The central bank raised the SME loan growth cap to 5% and lowered the reserve blocking ratios on lira funding.",
   "why": "Banks gain room to lend to SMEs, adding competition for our SME book; Commercial should size the effect.",
   "impact": 2,
   "urgency": 2,
   "action": "assess",
   "owner": "Commercial",
   "sources": [
    {
     "name": "TCMB: press release",
     "url": "https://www.tcmb.gov.tr/wps/wcm/connect/EN/TCMB+EN/Main+Menu/Announcements/Press+Releases/2026/ANO2026-43"
    }
   ]
  },
  {
   "id": "e21-03",
   "edition": 21,
   "date": "2026-10-01",
   "country": "TR",
   "primary": "regulation",
   "secondary": "credit",
   "lines": [
    "consumer"
   ],
   "title": "BDDK sets tiered credit-card minimum payments",
   "summary": "BDDK set minimum card payments at 20% for limits up to TRY 100k and 40% for limits above that.",
   "why": "Higher card repayments may reduce households' capacity to service other debt; Risk should watch our Turkish consumer book.",
   "impact": 2,
   "urgency": 2,
   "action": "monitor",
   "owner": "Risk",
   "sources": [
    {
     "name": "BDDK",
     "url": "https://www.bddk.org.tr/Mevzuat/DokumanGetir/1349"
    }
   ]
  },
  {
   "id": "e21-04",
   "edition": 21,
   "date": "2026-10-05",
   "country": "EG",
   "primary": "competition",
   "secondary": "regulation",
   "lines": [
    "consumer",
    "sme"
   ],
   "title": "FRA licenses 12 more non-bank finance companies; debt collectors reach 11",
   "summary": "The FRA licensed 12 more non-bank finance companies, and the number of licensed debt-collection firms rose to 11.",
   "why": "More licensed rivals in Egypt and more third-party collection options; Strategy and Collections should note.",
   "impact": 2,
   "urgency": 2,
   "action": "monitor",
   "owner": "Strategy",
   "sources": [
    {
     "name": "FRA (home page; TODO: deep link)",
     "url": "https://fra.gov.eg/en/"
    }
   ]
  },
  {
   "id": "e21-05",
   "edition": 21,
   "date": "2026-10-09",
   "country": "KSA",
   "primary": "retail",
   "secondary": null,
   "lines": [
    "consumer"
   ],
   "title": "Saudi weekly consumer spending up 23% on back-to-school outlays",
   "summary": "Weekly consumer spending in Saudi Arabia rose 23% to US$4.4bn, driven by back-to-school purchases.",
   "why": "A seasonal demand signal for instalment financing; Commercial can check merchant promotions.",
   "impact": 1,
   "urgency": 2,
   "action": "note",
   "owner": "Commercial",
   "sources": [
    {
     "name": "Arab News (TODO: deep link)",
     "url": "https://www.arabnews.com/business"
    }
   ]
  },
  {
   "id": "e21-06",
   "edition": 21,
   "date": "2026-10-09",
   "country": "KSA",
   "primary": "macro",
   "secondary": "retail",
   "lines": [
    "consumer"
   ],
   "title": "Houthi strikes on Saudi airports trigger travel advisories",
   "summary": "Houthi strikes on Saudi airports led to Western travel advisories and some flight suspensions.",
   "why": "Watch for effects on consumer confidence and spending; no change yet.",
   "impact": 1,
   "urgency": 2,
   "action": "monitor",
   "owner": "Strategy",
   "sources": [
    {
     "name": "AGBI (TODO: deep link)",
     "url": "https://www.agbi.com/middle-east/saudi-arabia/"
    }
   ]
  },
  {
   "id": "e21-07",
   "edition": 21,
   "date": "2026-10-08",
   "country": "KSA",
   "primary": "macro",
   "secondary": null,
   "lines": [
    "consumer",
    "sme"
   ],
   "title": "Moody's: Saudi Arabia and UAE to drive GCC private credit growth",
   "summary": "Moody's expects Saudi Arabia and the UAE to lead private-credit growth across the GCC.",
   "why": "Suggests more capital chasing Saudi private lending; context for competition and funding.",
   "impact": 2,
   "urgency": 1,
   "action": "note",
   "owner": "Strategy",
   "sources": [
    {
     "name": "Arab News (TODO: deep link)",
     "url": "https://www.arabnews.com/business"
    }
   ]
  },
  {
   "id": "e21-08",
   "edition": 21,
   "date": "2026-10-03",
   "country": "EG",
   "primary": "regulation",
   "secondary": null,
   "lines": [
    "ops"
   ],
   "title": "FRA and AML/CFT Unit convene non-bank sector on early risk detection",
   "summary": "The FRA and Egypt's AML/CFT Unit met non-bank firms to discuss detecting risks early.",
   "why": "Expect closer AML supervision; Compliance should note.",
   "impact": 1,
   "urgency": 2,
   "action": "note",
   "owner": "Compliance",
   "sources": [
    {
     "name": "FRA (home page; TODO: deep link)",
     "url": "https://fra.gov.eg/en/"
    }
   ]
  },
  {
   "id": "e21-09",
   "edition": 21,
   "date": "2026-10-01",
   "country": "EG",
   "primary": "credit",
   "secondary": null,
   "lines": [
    "sme"
   ],
   "title": "CBE and Industry ministry launch EGP 1bn Distressed Factories Restructuring Fund",
   "summary": "The central bank and the Ministry of Industry launched an EGP 1bn fund to restructure distressed factories.",
   "why": "Possible relief for stressed industrial SME borrowers; Risk should note.",
   "impact": 1,
   "urgency": 1,
   "action": "note",
   "owner": "Risk",
   "sources": [
    {
     "name": "CBE (home page; TODO: deep link)",
     "url": "https://www.cbe.org.eg/en"
    }
   ]
  }
 ]
};
