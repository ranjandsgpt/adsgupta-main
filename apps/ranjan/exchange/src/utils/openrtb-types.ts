/**
 * OpenRTB 2.6 core type definitions used by the exchange when
 * communicating with DSPs. These interfaces intentionally focus
 * on the fields we need for a web display (banner + native) MVP.
 */

export interface Banner {
  w?: number;
  h?: number;
  format?: Array<{ w: number; h: number }>;
  pos?: number;
}

export interface Native {
  /**
   * Native request JSON, stringified as required by OpenRTB.
   * See IAB Native Ads Spec 1.2.
   */
  request: string;
  ver?: string; // e.g. "1.2"
}

export interface Impression {
  id: string;
  banner?: Banner;
  native?: Native;
  bidfloor?: number;
  bidfloorcur?: string; // e.g. "USD"
  secure?: 0 | 1;
}

export interface Publisher {
  id?: string;
  name?: string;
  domain?: string;
}

export interface Site {
  id?: string;
  name?: string;
  domain?: string;
  page?: string;
  ref?: string;
  cat?: string[];
  publisher?: Publisher;
}

export interface Geo {
  lat?: number;
  lon?: number;
  country?: string;
  region?: string;
  city?: string;
}

export interface Device {
  ua?: string;
  ip?: string;
  geo?: Geo;
  devicetype?: number;
  os?: string;
  osv?: string;
  browser?: string;
  browserv?: string;
  language?: string;
  dnt?: 0 | 1;
  lmt?: 0 | 1;
  w?: number;
  h?: number;
  ppi?: number;
}

export interface User {
  id?: string;
  buyeruid?: string;
}

export interface Source {
  fd?: 0 | 1;
  tid?: string;
  pchain?: string;
}

export interface RegsExt {
  gdpr?: number;
  us_privacy?: string;
}

export interface Regs {
  coppa?: 0 | 1;
  ext?: RegsExt;
}

export interface BidRequestExt {
  exchange: 'adsgupta';
  version: string;
}

export interface BidRequest {
  id: string;
  imp: Impression[];
  site: Site;
  device: Device;
  user: User;
  at: 1; // auction type: 1 = first price
  tmax: number;
  cur: string[];
  bcat?: string[];
  badv?: string[];
  source?: Source;
  regs?: Regs;
  ext?: BidRequestExt;
}

export interface Bid {
  id: string;
  impid: string;
  price: number;
  adid?: string;
  nurl?: string;
  adm?: string;
  adomain?: string[];
  crid?: string;
  w?: number;
  h?: number;
  cat?: string[];
  attr?: number[];
  dealid?: string;
}

export interface SeatBid {
  bid: Bid[];
  seat?: string;
}

export interface BidResponse {
  id: string;
  seatbid?: SeatBid[];
  cur?: string;
  nbr?: NoBidReason;
}

/**
 * OpenRTB 2.x no-bid reason codes. These are useful both for
 * debugging demand issues and for quality/traffic analysis.
 */
export enum NoBidReason {
  Unknown = 0,
  TechnicalError = 1,
  InvalidRequest = 2,
  KnownWebSpider = 3,
  SuspectedNonHuman = 4,
  DataCenterIP = 5,
  UnsupportedDevice = 6,
  BlockedPublisher = 7,
  UnmatchedUser = 8,
  InsufficientAuctionTime = 10,
}

