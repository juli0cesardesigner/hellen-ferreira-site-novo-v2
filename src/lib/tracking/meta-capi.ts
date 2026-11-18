import crypto from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface RawUserData {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  externalId?: string | null;
  // Raw / Pre-hashed overrides or direct Meta keys
  em?: string | string[];
  ph?: string | string[];
  fn?: string | string[];
  ln?: string | string[];
  ct?: string | string[];
  st?: string | string[];
  zp?: string | string[];
  external_id?: string | string[];
  [key: string]: any;
}

export interface MetaCapiUserData {
  em?: string[];
  ph?: string[];
  fn?: string[];
  ln?: string[];
  ct?: string[];
  st?: string[];
  zp?: string[];
  country?: string[];
  external_id?: string[];
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
  [key: string]: any;
}

export interface MetaCapiCustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  order_id?: string;
  predicted_ltv?: number;
  num_items?: number;
  search_string?: string;
  status?: string;
  [key: string]: any;
}

export interface MetaCapiEventParams {
  eventName: string;
  eventId?: string;
  eventTime?: number; // Unix timestamp in seconds
  eventSourceUrl?: string;
  actionSource?: 'website' | 'app' | 'physical_store' | 'system_generated' | 'other';
  userData?: RawUserData;
  customData?: MetaCapiCustomData;
  testEventCode?: string | null;
  pixelId?: string;
  accessToken?: string;
}

export interface SendMetaPurchaseParams {
  // Deduplication identifier (bookingId)
  eventId?: string;
  event_id?: string;
  bookingId?: string;

  // Financial values
  value?: number;
  amount?: number;
  paidAmount?: number;
  currency?: string; // defaults to 'BRL'

  // Customer information
  customerEmail?: string | null;
  email?: string | null;
  customerPhone?: string | null;
  phone?: string | null;
  customerName?: string | null;
  name?: string | null;
  customerFirstName?: string | null;
  firstName?: string | null;
  customerLastName?: string | null;
  lastName?: string | null;

  // Contextual items
  contentName?: string;
  sessionName?: string;
  orderId?: string;
  paymentId?: string;

  // Client telemetry
  eventSourceUrl?: string;
  clientIpAddress?: string | null;
  ip?: string | null;
  clientUserAgent?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;

  // Testing & metadata
  testEventCode?: string | null;
  customData?: Record<string, any>;
}

export interface MetaCapiResponse {
  success: boolean;
  eventsReceived?: number;
  fbtraceId?: string;
  statusCode?: number;
  error?: string;
  raw?: any;
}

// ============================================================================
// Constants & Config
// ============================================================================

export const DEFAULT_PIXEL_ID =
  process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ||
  process.env.META_PIXEL_ID ||
  '653557265355207';

export const META_GRAPH_API_VERSION = 'v21.0';

// ============================================================================
// Supabase Admin Client for CAPI Logging
// ============================================================================

let supabaseAdminClient: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient | null {
  if (supabaseAdminClient) return supabaseAdminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  try {
    supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey);
    return supabaseAdminClient;
  } catch (err) {
    console.error('[Meta CAPI] Error initializing Supabase Admin client:', err);
    return null;
  }
}

/**
 * Resiliently persist CAPI event logs to Supabase table tracking_capi_logs.
 * Non-blocking and never throws.
 */
async function logCapiEventToSupabase(logEntry: {
  eventName: string;
  eventId?: string;
  eventTime: number;
  eventSourceUrl?: string;
  userDataKeys: string[];
  customData?: Record<string, any>;
  status: 'success' | 'error' | 'skipped';
  statusCode?: number;
  responseBody?: any;
  errorMessage?: string;
  testEventCode?: string | null;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return;
    }

    const { error } = await supabase.from('tracking_capi_logs').insert([
      {
        event_name: logEntry.eventName,
        event_id: logEntry.eventId || null,
        event_time: new Date(logEntry.eventTime * 1000).toISOString(),
        event_source_url: logEntry.eventSourceUrl || null,
        user_data_keys: logEntry.userDataKeys,
        custom_data: logEntry.customData || null,
        status: logEntry.status,
        status_code: logEntry.statusCode ?? null,
        response_body: logEntry.responseBody || null,
        error_message: logEntry.errorMessage || null,
        test_event_code: logEntry.testEventCode || null,
      },
    ]);

    if (error) {
      console.warn('[Meta CAPI] Failed to save log to Supabase:', error.message);
    }
  } catch (err) {
    console.warn('[Meta CAPI] Unexpected error logging to Supabase:', err);
  }
}

// ============================================================================
// Normalization & SHA-256 Hashing Utilities
// ============================================================================

/**
 * Generates lowercase SHA-256 hex string.
 * If the value is already a 64-char hex string (already hashed), preserves it.
 */
export function hashSha256(value: string): string {
  const trimmed = value.trim();
  if (/^[a-f0-9]{64}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return crypto.createHash('sha256').update(trimmed.toLowerCase()).digest('hex');
}

/**
 * Normalizes email address according to Meta Conversions API specifications:
 * - Trims leading and trailing whitespace
 * - Converts to all lowercase
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalizes phone number according to Meta Conversions API specifications:
 * - Strips all non-digit characters
 * - Strips leading zeros
 * - For Brazilian phone numbers (10 or 11 digits), automatically prepends country code '55'
 */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  digits = digits.replace(/^0+/, '');

  // Brazilian standard: 10 digits (DDD + 8 digits) or 11 digits (DDD + 9 digits)
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }

  return digits;
}

/**
 * Extracts first name and last name from full name or partial name strings.
 */
export function normalizeName(fullName: string): { firstName?: string; lastName?: string } {
  const parts = fullName.trim().replace(/\s+/g, ' ').split(' ');
  if (parts.length === 0 || !parts[0]) return {};
  if (parts.length === 1) {
    return { firstName: parts[0].toLowerCase() };
  }
  return {
    firstName: parts[0].toLowerCase(),
    lastName: parts.slice(1).join(' ').toLowerCase(),
  };
}

/**
 * Builds and normalizes user_data for Meta Conversions API.
 * SHA-256 hashes PII (email, phone, names, address, external_id)
 * Keeps client_ip_address, client_user_agent, fbp, and fbc UNHASHED as required by Meta.
 */
export function buildUserData(raw: RawUserData): MetaCapiUserData {
  const userData: MetaCapiUserData = {};

  // Email (em)
  if (raw.email) {
    const normalized = normalizeEmail(raw.email);
    userData.em = [hashSha256(normalized)];
  } else if (raw.em) {
    userData.em = Array.isArray(raw.em)
      ? raw.em.map((v) => hashSha256(normalizeEmail(v)))
      : [hashSha256(normalizeEmail(raw.em))];
  }

  // Phone (ph)
  if (raw.phone) {
    const normalized = normalizePhone(raw.phone);
    if (normalized) {
      userData.ph = [hashSha256(normalized)];
    }
  } else if (raw.ph) {
    userData.ph = Array.isArray(raw.ph)
      ? raw.ph.map((v) => hashSha256(normalizePhone(v))).filter(Boolean)
      : [hashSha256(normalizePhone(raw.ph))];
  }

  // Names (fn, ln)
  let firstName = raw.firstName;
  let lastName = raw.lastName;

  if (raw.name && (!firstName || !lastName)) {
    const extracted = normalizeName(raw.name);
    if (!firstName && extracted.firstName) firstName = extracted.firstName;
    if (!lastName && extracted.lastName) lastName = extracted.lastName;
  }

  if (firstName) {
    userData.fn = [hashSha256(firstName.trim().toLowerCase())];
  } else if (raw.fn) {
    userData.fn = Array.isArray(raw.fn)
      ? raw.fn.map((v) => hashSha256(v.trim().toLowerCase()))
      : [hashSha256(raw.fn.trim().toLowerCase())];
  }

  if (lastName) {
    userData.ln = [hashSha256(lastName.trim().toLowerCase())];
  } else if (raw.ln) {
    userData.ln = Array.isArray(raw.ln)
      ? raw.ln.map((v) => hashSha256(v.trim().toLowerCase()))
      : [hashSha256(raw.ln.trim().toLowerCase())];
  }

  // Location fields
  if (raw.city) {
    userData.ct = [hashSha256(raw.city.trim().toLowerCase())];
  } else if (raw.ct) {
    userData.ct = Array.isArray(raw.ct) ? raw.ct.map(hashSha256) : [hashSha256(raw.ct)];
  }

  if (raw.state) {
    userData.st = [hashSha256(raw.state.trim().toLowerCase())];
  } else if (raw.st) {
    userData.st = Array.isArray(raw.st) ? raw.st.map(hashSha256) : [hashSha256(raw.st)];
  }

  if (raw.zip) {
    const cleanZip = raw.zip.replace(/\D/g, '');
    if (cleanZip) userData.zp = [hashSha256(cleanZip)];
  } else if (raw.zp) {
    userData.zp = Array.isArray(raw.zp) ? raw.zp.map(hashSha256) : [hashSha256(raw.zp)];
  }

  if (raw.country) {
    userData.country = [hashSha256(raw.country.trim().toLowerCase())];
  }

  // External ID
  if (raw.externalId) {
    userData.external_id = [hashSha256(String(raw.externalId).trim())];
  } else if (raw.external_id) {
    userData.external_id = Array.isArray(raw.external_id)
      ? raw.external_id.map((v) => hashSha256(String(v).trim()))
      : [hashSha256(String(raw.external_id).trim())];
  }

  // Raw fields (MUST NOT BE HASHED)
  if (raw.clientIpAddress) {
    userData.client_ip_address = raw.clientIpAddress.trim();
  }
  if (raw.clientUserAgent) {
    userData.client_user_agent = raw.clientUserAgent.trim();
  }
  if (raw.fbp) {
    userData.fbp = raw.fbp.trim();
  }
  if (raw.fbc) {
    userData.fbc = raw.fbc.trim();
  }

  return userData;
}

// ============================================================================
// Main Meta Conversions API Transmission
// ============================================================================

/**
 * Sends a server-side event to Meta Conversions API (Graph API v21.0).
 * Handles token fallback, network errors, and Supabase audit logging non-blockingly.
 */
export async function sendMetaCapiEvent(params: MetaCapiEventParams): Promise<MetaCapiResponse> {
  const pixelId = params.pixelId || DEFAULT_PIXEL_ID;
  const accessToken =
    params.accessToken ||
    process.env.META_CAPI_ACCESS_TOKEN ||
    process.env.FACEBOOK_CONVERSIONS_API_ACCESS_TOKEN;

  const eventTime = params.eventTime || Math.floor(Date.now() / 1000);
  const testEventCode =
    params.testEventCode ||
    process.env.META_TEST_EVENT_CODE ||
    null;

  const normalizedUserData = params.userData ? buildUserData(params.userData) : {};
  const userDataKeys = Object.keys(normalizedUserData);

  // If access token is not configured, skip transmission cleanly and log
  if (!accessToken) {
    console.warn(
      `[Meta CAPI] META_CAPI_ACCESS_TOKEN not set. Event "${params.eventName}" skipped.`
    );
    await logCapiEventToSupabase({
      eventName: params.eventName,
      eventId: params.eventId,
      eventTime,
      eventSourceUrl: params.eventSourceUrl,
      userDataKeys,
      customData: params.customData,
      status: 'skipped',
      errorMessage: 'META_CAPI_ACCESS_TOKEN environment variable is not configured',
      testEventCode,
    });

    return {
      success: false,
      error: 'META_CAPI_ACCESS_TOKEN is not configured',
    };
  }

  // Construct Meta Graph API payload
  const singleEventPayload: Record<string, any> = {
    event_name: params.eventName,
    event_time: eventTime,
    action_source: params.actionSource || 'website',
    user_data: normalizedUserData,
  };

  if (params.eventId) {
    singleEventPayload.event_id = params.eventId;
  }

  if (params.eventSourceUrl) {
    singleEventPayload.event_source_url = params.eventSourceUrl;
  }

  if (params.customData) {
    singleEventPayload.custom_data = params.customData;
  }

  const requestBody: Record<string, any> = {
    data: [singleEventPayload],
  };

  if (testEventCode) {
    requestBody.test_event_code = testEventCode;
  }

  const endpointUrl = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(
    accessToken
  )}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second resilient timeout

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const rawData = await response.json().catch(() => ({}));
    const statusCode = response.status;

    if (!response.ok) {
      const errorMessage =
        rawData?.error?.message ||
        `Meta CAPI responded with HTTP status ${statusCode}`;

      console.error(`[Meta CAPI] Failed sending event "${params.eventName}":`, errorMessage, rawData);

      await logCapiEventToSupabase({
        eventName: params.eventName,
        eventId: params.eventId,
        eventTime,
        eventSourceUrl: params.eventSourceUrl,
        userDataKeys,
        customData: params.customData,
        status: 'error',
        statusCode,
        responseBody: rawData,
        errorMessage,
        testEventCode,
      });

      return {
        success: false,
        statusCode,
        error: errorMessage,
        raw: rawData,
      };
    }

    console.log(
      `[Meta CAPI] Successfully sent "${params.eventName}" (Event ID: ${params.eventId || 'none'}, Trace: ${
        rawData?.fbtrace_id || 'none'
      })`
    );

    await logCapiEventToSupabase({
      eventName: params.eventName,
      eventId: params.eventId,
      eventTime,
      eventSourceUrl: params.eventSourceUrl,
      userDataKeys,
      customData: params.customData,
      status: 'success',
      statusCode,
      responseBody: rawData,
      testEventCode,
    });

    return {
      success: true,
      statusCode,
      eventsReceived: rawData?.events_received,
      fbtraceId: rawData?.fbtrace_id,
      raw: rawData,
    };
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError';
    const errorMessage = isAbort
      ? 'Meta CAPI request timed out after 8000ms'
      : err?.message || 'Unknown network error';

    console.error(`[Meta CAPI] Network error sending "${params.eventName}":`, errorMessage);

    await logCapiEventToSupabase({
      eventName: params.eventName,
      eventId: params.eventId,
      eventTime,
      eventSourceUrl: params.eventSourceUrl,
      userDataKeys,
      customData: params.customData,
      status: 'error',
      errorMessage,
      testEventCode,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ============================================================================
// Specialized Helper: Purchase Event (Mercado Pago / Checkout)
// ============================================================================

/**
 * Helper to dispatch a Purchase event to Meta Conversions API with deduplication.
 * Designed to be called seamlessly from Mercado Pago webhook or server actions.
 */
export async function sendMetaPurchaseEvent(
  params: SendMetaPurchaseParams
): Promise<MetaCapiResponse> {
  const eventId = params.eventId || params.event_id || params.bookingId;
  const value = Number(params.value ?? params.amount ?? params.paidAmount ?? 0);
  const currency = params.currency || 'BRL';

  const orderId = params.orderId || params.paymentId || eventId;
  const contentName = params.contentName || params.sessionName || 'Ensaio Fotográfico';

  const customerEmail = params.customerEmail || params.email;
  const customerPhone = params.customerPhone || params.phone;
  const customerName = params.customerName || params.name;
  const customerFirstName = params.customerFirstName || params.firstName;
  const customerLastName = params.customerLastName || params.lastName;

  const clientIpAddress = params.clientIpAddress || params.ip;
  const clientUserAgent = params.clientUserAgent || params.userAgent;

  const rawUserData: RawUserData = {
    email: customerEmail,
    phone: customerPhone,
    name: customerName,
    firstName: customerFirstName,
    lastName: customerLastName,
    clientIpAddress,
    clientUserAgent,
    fbp: params.fbp,
    fbc: params.fbc,
    externalId: eventId,
  };

  const customData: MetaCapiCustomData = {
    value,
    currency,
    content_name: contentName,
    content_type: 'product',
    order_id: orderId,
    num_items: 1,
    ...(params.customData || {}),
  };

  return sendMetaCapiEvent({
    eventName: 'Purchase',
    eventId,
    eventSourceUrl: params.eventSourceUrl || 'https://hellenferreira.com/agendamento',
    actionSource: 'website',
    userData: rawUserData,
    customData,
    testEventCode: params.testEventCode,
  });
}
