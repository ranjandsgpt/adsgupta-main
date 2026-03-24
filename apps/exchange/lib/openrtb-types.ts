/**
 * OpenRTB 2.6 — TypeScript shapes for request/response used by the exchange.
 * Field names match the spec; optional reflects common wire usage.
 */

export type OpenRTB26Regs = {
  coppa?: 0 | 1;
  /** GDPR applies */
  gdpr?: 0 | 1;
  us_privacy?: string;
  ext?: Record<string, unknown>;
};

export type OpenRTB26Geo = {
  lat?: number;
  lon?: number;
  country?: string;
  region?: string;
  metro?: string;
  city?: string;
  zip?: string;
  type?: number;
  ipservice?: number;
  ext?: Record<string, unknown>;
};

export type OpenRTB26Device = {
  geo?: OpenRTB26Geo;
  dnt?: 0 | 1;
  lmt?: 0 | 1;
  ua?: string;
  ip?: string;
  devicetype?: number;
  make?: string;
  model?: string;
  os?: string;
  osv?: string;
  hwv?: string;
  h?: number;
  w?: number;
  language?: string;
  carrier?: string;
  mccmnc?: string;
  connectiontype?: number;
  ifa?: string;
  ext?: Record<string, unknown>;
};

export type OpenRTB26User = {
  id?: string;
  buyeruid?: string;
  yob?: number;
  gender?: string;
  keywords?: string;
  consent?: string;
  ext?: Record<string, unknown>;
};

export type OpenRTB26Publisher = {
  id?: string;
  name?: string;
  cat?: string[];
  domain?: string;
  ext?: Record<string, unknown>;
};

export type OpenRTB26Site = {
  id?: string;
  name?: string;
  domain?: string;
  cat?: string[];
  sectioncat?: string[];
  pagecat?: string[];
  page?: string;
  ref?: string;
  search?: string;
  mobile?: 0 | 1;
  publisher?: OpenRTB26Publisher;
  content?: Record<string, unknown>;
  ext?: Record<string, unknown>;
};

export type OpenRTB26App = {
  id?: string;
  name?: string;
  bundle?: string;
  domain?: string;
  storeurl?: string;
  cat?: string[];
  sectioncat?: string[];
  pagecat?: string[];
  ver?: string;
  publisher?: OpenRTB26Publisher;
  content?: Record<string, unknown>;
  ext?: Record<string, unknown>;
};

export type OpenRTB26Banner = {
  w?: number;
  h?: number;
  format?: Array<{ w: number; h: number; wratio?: number; hratio?: number; wmin?: number }>;
  btype?: number[];
  battr?: number[];
  pos?: number;
  mimes?: string[];
  api?: number[];
  topframe?: 0 | 1;
  expdir?: number[];
  ext?: Record<string, unknown>;
};

export type OpenRTB26Video = {
  mimes?: string[];
  minduration?: number;
  maxduration?: number;
  protocols?: number[];
  w?: number;
  h?: number;
  placement?: number;
  linearity?: number;
  skip?: 0 | 1;
  ext?: Record<string, unknown>;
};

export type OpenRTB26Imp = {
  id: string;
  metric?: unknown[];
  banner?: OpenRTB26Banner;
  video?: OpenRTB26Video;
  tagid?: string;
  bidfloor?: number;
  bidfloorcur?: string;
  secure?: 0 | 1;
  exp?: number;
  ext?: Record<string, unknown>;
};

export type OpenRTB26Source = {
  fd?: 0 | 1;
  tid?: string;
  pchain?: string;
  schain?: {
    complete?: number;
    ver?: string;
    nodes?: Array<{ asi?: string; sid?: string; rid?: string; name?: string; domain?: string; hp?: number }>;
  };
  ext?: Record<string, unknown>;
};

export type OpenRTB26BidRequest = {
  id: string;
  imp: OpenRTB26Imp[];
  site?: OpenRTB26Site;
  app?: OpenRTB26App;
  device?: OpenRTB26Device;
  user?: OpenRTB26User;
  test?: 0 | 1;
  at?: 1 | 2;
  tmax?: number;
  wseat?: string[];
  bseat?: string[];
  allimps?: 0 | 1;
  cur?: string[];
  bcat?: string[];
  badv?: string[];
  bapp?: string[];
  source?: OpenRTB26Source;
  regs?: OpenRTB26Regs;
  ext?: Record<string, unknown>;
};

export type OpenRTB26Bid = {
  id: string;
  impid: string;
  price: number;
  nurl?: string;
  burl?: string;
  lurl?: string;
  adm?: string;
  adid?: string;
  adomain?: string[];
  bundle?: string;
  iurl?: string;
  cid?: string;
  crid?: string;
  tactic?: string;
  cat?: string[];
  attr?: number[];
  api?: number[];
  protocol?: number;
  qagmediarating?: number;
  language?: string;
  dealid?: string;
  w?: number;
  h?: number;
  wratio?: number;
  hratio?: number;
  exp?: number;
  ext?: Record<string, unknown>;
  /** IAB content categories taxonomy version (OpenRTB 2.6) */
  cattax?: number;
};

export type OpenRTB26SeatBid = {
  bid: OpenRTB26Bid[];
  seat?: string;
  package?: number;
  ext?: Record<string, unknown>;
};

export type OpenRTB26BidResponse = {
  id: string;
  seatbid?: OpenRTB26SeatBid[];
  bidid?: string;
  cur?: string;
  customdata?: string;
  nbr?: number;
  ext?: Record<string, unknown>;
};
