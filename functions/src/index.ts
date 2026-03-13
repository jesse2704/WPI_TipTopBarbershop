import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";
import * as nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import { initializeApp } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

initializeApp();

const db = getFirestore();

/* ── Secrets (set with: firebase functions:secrets:set SECRET_NAME) ── */
const STRIPE_SECRET = defineSecret("STRIPE_SECRET_KEY");
const EMAIL_HOST    = defineSecret("EMAIL_HOST");
const EMAIL_PORT    = defineSecret("EMAIL_PORT");
const EMAIL_USER    = defineSecret("EMAIL_USER");
const EMAIL_PASS    = defineSecret("EMAIL_PASS");
const EMAIL_FROM    = defineSecret("EMAIL_FROM");
const GOOGLE_MAPS_API_KEY = defineSecret("GOOGLE_MAPS_API_KEY");
const INSTAGRAM_ACCESS_TOKEN = defineSecret("INSTAGRAM_ACCESS_TOKEN");
const INSTAGRAM_BUSINESS_ACCOUNT_ID = defineSecret("INSTAGRAM_BUSINESS_ACCOUNT_ID");
const META_APP_ID = defineSecret("META_APP_ID");
const META_APP_SECRET = defineSecret("META_APP_SECRET");

const INSTAGRAM_SETTINGS_DOC = "integrations/instagram";
const INSTAGRAM_OAUTH_STATES = "instagramOAuthStates";

const ALLOWED_ORIGINS = [
  "https://tiptopbarbershop.nl",
  "https://www.tiptopbarbershop.nl",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:5173",
  "http://localhost:5174",
];

/* ── Types ─────────────────────────────────────────────────────────── */
interface BookingPayload {
  customerName: string;
  email: string | null;
  serviceName: string;
  serviceDuration: number;
  date: string;
  time: string;
  formattedDate: string;
  formattedTime: string;
  contactInfo: string;
}

interface PublicGoogleReview {
  authorName: string;
  rating: number;
  text: string;
  publishTime?: string;
  relativeTimeDescription?: string;
  authorUrl?: string;
}

interface PublicInstagramMedia {
  id: string;
  mediaUrl: string;
  caption: string;
  permalink: string;
  timestamp?: string;
  mediaType?: string;
}

function applyCorsHeaders(req: { headers: { origin?: string } }, res: { set: (name: string, value: string) => void }) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }

  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function handleCorsPreflight(
  req: { method: string; headers: { origin?: string } },
  res: { set: (name: string, value: string) => void; status: (code: number) => { send: (body: string) => void } }
): boolean {
  applyCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }

  return false;
}

function buildFunctionUrl(functionName: string): string {
  const projectId = process.env.GCLOUD_PROJECT;
  if (!projectId) {
    throw new Error("GCLOUD_PROJECT is not available.");
  }

  return `https://europe-west1-${projectId}.cloudfunctions.net/${functionName}`;
}

function isAllowedReturnUrl(url: string): boolean {
  return ALLOWED_ORIGINS.some((origin) => url.startsWith(origin));
}

async function verifyRequestUser(req: { headers: { authorization?: string } }) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing authorization token.");
  }

  const idToken = authHeader.slice("Bearer ".length);
  return getAdminAuth().verifyIdToken(idToken);
}

async function getInstagramIntegrationConfig(): Promise<{ accessToken: string; accountId: string; username?: string } | null> {
  const snapshot = await db.doc(INSTAGRAM_SETTINGS_DOC).get();
  const data = snapshot.data() as { accessToken?: string; accountId?: string; username?: string } | undefined;

  if (data?.accessToken && data?.accountId) {
    return {
      accessToken: data.accessToken,
      accountId: data.accountId,
      username: data.username,
    };
  }

  const fallbackToken = INSTAGRAM_ACCESS_TOKEN.value();
  const fallbackAccountId = INSTAGRAM_BUSINESS_ACCOUNT_ID.value();
  if (fallbackToken && fallbackAccountId) {
    return {
      accessToken: fallbackToken,
      accountId: fallbackAccountId,
    };
  }

  return null;
}

async function createStripeSession(booking: BookingPayload, baseUrl: string): Promise<{ sessionUrl: string | null }> {
  const stripe = new Stripe(STRIPE_SECRET.value());

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "ideal"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "Booking Deposit — Tip Top Barbershop",
            description: `${booking.serviceName} · ${booking.formattedDate} at ${booking.formattedTime}`,
          },
          unit_amount: 500, // EUR 5.00
        },
        quantity: 1,
      },
    ],
    metadata: {
      customerName: booking.customerName,
      email: booking.email ?? "",
      serviceName: booking.serviceName,
      serviceDuration: String(booking.serviceDuration),
      date: booking.date,
      time: booking.time,
      formattedDate: booking.formattedDate,
      formattedTime: booking.formattedTime,
      contactInfo: booking.contactInfo,
    },
    customer_email: booking.email ?? undefined,
    success_url: `${baseUrl}/book?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/book?payment=cancelled`,
  });

  return { sessionUrl: session.url };
}

async function verifySessionAndSendEmail(sessionId: string): Promise<{ ok: true; meta: Record<string, string> }> {
  const stripe = new Stripe(STRIPE_SECRET.value());

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    throw new HttpsError("not-found", "Stripe session not found.");
  }

  if (session.payment_status !== "paid") {
    throw new HttpsError("failed-precondition", "Payment not completed.");
  }

  const meta = session.metadata as Record<string, string>;
  const toEmail = meta.email;

  if (toEmail) {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST.value(),
      port: Number(EMAIL_PORT.value()),
      secure: Number(EMAIL_PORT.value()) === 465,
      auth: {
        user: EMAIL_USER.value(),
        pass: EMAIL_PASS.value(),
      },
    });

    await transporter.sendMail({
      from: `"Tip Top Barbershop" <${EMAIL_FROM.value() || EMAIL_USER.value()}>`,
      to: toEmail,
      subject: "✅ Booking Confirmed — Tip Top Barbershop",
      html: buildHtmlEmail(meta),
      text: buildTextEmail(meta),
    });
  }

  return { ok: true, meta };
}

/* ── 1. Create Stripe Checkout Session ─────────────────────────────── */
export const createCheckoutSession = onCall(
  {
    secrets: [STRIPE_SECRET],
    region: "europe-west1",
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req) => {
    const { booking, baseUrl } = req.data as {
      booking: BookingPayload;
      baseUrl: string;
    };

    if (!booking?.date || !booking?.time || !booking?.serviceName || !baseUrl) {
      throw new HttpsError("invalid-argument", "Missing required booking fields.");
    }

    return createStripeSession(booking, baseUrl);
  }
);

export const createCheckoutSessionHttp = onRequest(
  {
    secrets: [STRIPE_SECRET],
    region: "europe-west1",
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "method-not-allowed" });
      return;
    }

    try {
      const { booking, baseUrl } = req.body as {
        booking: BookingPayload;
        baseUrl: string;
      };

      if (!booking?.date || !booking?.time || !booking?.serviceName || !baseUrl) {
        res.status(400).json({ error: "Missing required booking fields." });
        return;
      }

      const result = await createStripeSession(booking, baseUrl);
      res.status(200).json(result);
    } catch (error) {
      console.error("createCheckoutSessionHttp failed", error);
      res.status(500).json({ error: "Unable to create checkout session." });
    }
  }
);

/* ── 2. Verify Payment & Send Confirmation Email ───────────────────── */
export const verifyPaymentAndEmail = onCall(
  {
    secrets: [STRIPE_SECRET, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM],
    region: "europe-west1",
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req) => {
    const { sessionId } = req.data as { sessionId: string };

    if (!sessionId || typeof sessionId !== "string") {
      throw new HttpsError("invalid-argument", "sessionId is required.");
    }

    return verifySessionAndSendEmail(sessionId);
  }
);

export const verifyPaymentAndEmailHttp = onRequest(
  {
    secrets: [STRIPE_SECRET, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM],
    region: "europe-west1",
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "method-not-allowed" });
      return;
    }

    const { sessionId } = req.body as { sessionId: string };
    if (!sessionId || typeof sessionId !== "string") {
      res.status(400).json({ error: "sessionId is required." });
      return;
    }

    try {
      const result = await verifySessionAndSendEmail(sessionId);
      res.status(200).json(result);
    } catch (error) {
      console.error("verifyPaymentAndEmailHttp failed", error);
      res.status(500).json({ error: "Unable to verify payment." });
    }
  }
);

/* ── 3. Public Google Reviews ──────────────────────────────────────── */
export const getGoogleReviewsHttp = onRequest(
  {
    secrets: [GOOGLE_MAPS_API_KEY],
    region: "europe-west1",
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "method-not-allowed" });
      return;
    }

    try {
      const apiKey = GOOGLE_MAPS_API_KEY.value();
      if (!apiKey) {
        res.status(500).json({ error: "Google Maps API key is missing." });
        return;
      }

      const searchResponse = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName",
        },
        body: JSON.stringify({
          textQuery: "TIP TOP BARBERSHOP Netherlands",
          languageCode: "nl",
          regionCode: "nl",
          maxResultCount: 1,
        }),
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error("Google Places search failed", errorText);
        res.status(502).json({ error: "Failed to query Google Places." });
        return;
      }

      const searchData = (await searchResponse.json()) as { places?: Array<{ id?: string }> };
      const placeId = searchData.places?.[0]?.id;

      if (!placeId) {
        res.status(404).json({ error: "Place not found." });
        return;
      }

      const detailsResponse = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews",
        },
      });

      if (!detailsResponse.ok) {
        const errorText = await detailsResponse.text();
        console.error("Google Places details failed", errorText);
        res.status(502).json({ error: "Failed to fetch Google review details." });
        return;
      }

      const detailsData = (await detailsResponse.json()) as {
        rating?: number;
        userRatingCount?: number;
        reviews?: Array<{
          rating?: number;
          publishTime?: string;
          relativePublishTimeDescription?: string;
          text?: { text?: string };
          authorAttribution?: { displayName?: string; uri?: string };
        }>;
      };

      const reviews: PublicGoogleReview[] = (detailsData.reviews ?? [])
        .slice(0, 6)
        .map((review) => ({
          authorName: review.authorAttribution?.displayName ?? "Google User",
          rating: review.rating ?? 5,
          text: review.text?.text ?? "",
          publishTime: review.publishTime,
          relativeTimeDescription: review.relativePublishTimeDescription,
          authorUrl: review.authorAttribution?.uri,
        }))
        .filter((review) => review.text.trim().length > 0);

      res.status(200).json({
        rating: detailsData.rating ?? null,
        userRatingCount: detailsData.userRatingCount ?? 0,
        reviews,
      });
    } catch (error) {
      console.error("getGoogleReviewsHttp failed", error);
      res.status(500).json({ error: "Unable to load Google reviews." });
    }
  }
);

/* ── 4. Public Instagram Feed ─────────────────────────────────────── */
export const getInstagramFeedHttp = onRequest(
  {
    secrets: [INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID],
    region: "europe-west1",
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "method-not-allowed" });
      return;
    }

    try {
      const integration = await getInstagramIntegrationConfig();
      if (!integration) {
        res.status(500).json({ error: "Instagram credentials are missing." });
        return;
      }

      const { accessToken, accountId, username } = integration;

      const fields = [
        "id",
        "caption",
        "media_type",
        "media_url",
        "permalink",
        "thumbnail_url",
        "timestamp",
        "children{media_type,media_url,thumbnail_url}",
      ].join(",");

      const feedUrl = new URL(`https://graph.facebook.com/v22.0/${accountId}/media`);
      feedUrl.searchParams.set("fields", fields);
      feedUrl.searchParams.set("limit", "12");
      feedUrl.searchParams.set("access_token", accessToken);

      const feedResponse = await fetch(feedUrl.toString());
      if (!feedResponse.ok) {
        const errorText = await feedResponse.text();
        console.error("Instagram feed request failed", errorText);
        res.status(502).json({ error: "Failed to fetch Instagram feed." });
        return;
      }

      const feedData = (await feedResponse.json()) as {
        data?: Array<{
          id?: string;
          caption?: string;
          media_type?: string;
          media_url?: string;
          permalink?: string;
          thumbnail_url?: string;
          timestamp?: string;
          children?: {
            data?: Array<{
              media_type?: string;
              media_url?: string;
              thumbnail_url?: string;
            }>;
          };
        }>;
      };

      const media: PublicInstagramMedia[] = (feedData.data ?? [])
        .flatMap((item): PublicInstagramMedia[] => {
          const childImage = item.children?.data?.find((child) => child.media_type === "IMAGE" || child.media_type === "CAROUSEL_ALBUM");
          const mediaUrl = item.media_url || item.thumbnail_url || childImage?.media_url || childImage?.thumbnail_url;

          if (!item.id || !item.permalink || !mediaUrl) {
            return [];
          }

          return [{
            id: item.id,
            mediaUrl,
            caption: item.caption ?? "",
            permalink: item.permalink,
            timestamp: item.timestamp,
            mediaType: item.media_type,
          }];
        });

      res.status(200).json({
        profileUrl: "https://www.instagram.com/tiptopbarbershopnl/",
        username: username || "tiptopbarbershopnl",
        media,
      });
    } catch (error) {
      console.error("getInstagramFeedHttp failed", error);
      res.status(500).json({ error: "Unable to load Instagram feed." });
    }
  }
);

export const getInstagramConnectionStatusHttp = onRequest(
  {
    region: "europe-west1",
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req, res) => {
    if (handleCorsPreflight(req, res)) {
      return;
    }

    if (req.method !== "GET") {
      res.status(405).json({ error: "method-not-allowed" });
      return;
    }

    try {
      applyCorsHeaders(req, res);
      await verifyRequestUser(req);
      const snapshot = await db.doc(INSTAGRAM_SETTINGS_DOC).get();
      const data = snapshot.data() as { username?: string; connectedAt?: unknown } | undefined;

      res.status(200).json({
        connected: snapshot.exists,
        username: data?.username ?? null,
      });
    } catch (error) {
      console.error("getInstagramConnectionStatusHttp failed", error);
      res.status(401).json({ error: "Unauthorized" });
    }
  }
);

export const beginInstagramConnectionHttp = onRequest(
  {
    secrets: [META_APP_ID],
    region: "europe-west1",
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req, res) => {
    if (handleCorsPreflight(req, res)) {
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "method-not-allowed" });
      return;
    }

    try {
      applyCorsHeaders(req, res);
      const decodedToken = await verifyRequestUser(req);
      const { returnUrl } = req.body as { returnUrl?: string };

      if (!returnUrl || !isAllowedReturnUrl(returnUrl)) {
        res.status(400).json({ error: "Invalid returnUrl." });
        return;
      }

      const state = randomUUID();
      await db.collection(INSTAGRAM_OAUTH_STATES).doc(state).set({
        uid: decodedToken.uid,
        returnUrl,
        createdAt: FieldValue.serverTimestamp(),
      });

      const appId = META_APP_ID.value();
      if (!appId) {
        res.status(500).json({ error: "Meta app id is missing." });
        return;
      }

      const redirectUri = buildFunctionUrl("instagramOAuthCallbackHttp");
      const authUrl = new URL("https://www.facebook.com/v22.0/dialog/oauth");
      authUrl.searchParams.set("client_id", appId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("scope", "instagram_basic,pages_show_list,pages_read_engagement");

      res.status(200).json({ authUrl: authUrl.toString() });
    } catch (error) {
      console.error("beginInstagramConnectionHttp failed", error);
      res.status(401).json({ error: "Unauthorized" });
    }
  }
);

export const disconnectInstagramConnectionHttp = onRequest(
  {
    region: "europe-west1",
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req, res) => {
    if (handleCorsPreflight(req, res)) {
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "method-not-allowed" });
      return;
    }

    try {
      applyCorsHeaders(req, res);
      await verifyRequestUser(req);
      await db.doc(INSTAGRAM_SETTINGS_DOC).delete();
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("disconnectInstagramConnectionHttp failed", error);
      res.status(401).json({ error: "Unauthorized" });
    }
  }
);

export const instagramOAuthCallbackHttp = onRequest(
  {
    secrets: [META_APP_ID, META_APP_SECRET],
    region: "europe-west1",
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req, res) => {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const state = typeof req.query.state === "string" ? req.query.state : null;

    if (!code || !state) {
      res.status(400).send("Missing Instagram OAuth callback parameters.");
      return;
    }

    try {
      const stateRef = db.collection(INSTAGRAM_OAUTH_STATES).doc(state);
      const stateSnapshot = await stateRef.get();
      const stateData = stateSnapshot.data() as { uid?: string; returnUrl?: string } | undefined;

      if (!stateSnapshot.exists || !stateData?.uid || !stateData.returnUrl || !isAllowedReturnUrl(stateData.returnUrl)) {
        res.status(400).send("Invalid or expired OAuth state.");
        return;
      }

      const redirectUri = buildFunctionUrl("instagramOAuthCallbackHttp");
      const appId = META_APP_ID.value();
      const appSecret = META_APP_SECRET.value();

      const shortTokenUrl = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
      shortTokenUrl.searchParams.set("client_id", appId);
      shortTokenUrl.searchParams.set("client_secret", appSecret);
      shortTokenUrl.searchParams.set("redirect_uri", redirectUri);
      shortTokenUrl.searchParams.set("code", code);

      const shortTokenResponse = await fetch(shortTokenUrl.toString());
      if (!shortTokenResponse.ok) {
        const errorText = await shortTokenResponse.text();
        console.error("Instagram short token exchange failed", errorText);
        res.redirect(`${stateData.returnUrl}?instagram=error`);
        return;
      }

      const shortTokenData = (await shortTokenResponse.json()) as { access_token?: string };
      if (!shortTokenData.access_token) {
        res.redirect(`${stateData.returnUrl}?instagram=error`);
        return;
      }

      const longTokenUrl = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
      longTokenUrl.searchParams.set("grant_type", "fb_exchange_token");
      longTokenUrl.searchParams.set("client_id", appId);
      longTokenUrl.searchParams.set("client_secret", appSecret);
      longTokenUrl.searchParams.set("fb_exchange_token", shortTokenData.access_token);

      const longTokenResponse = await fetch(longTokenUrl.toString());
      if (!longTokenResponse.ok) {
        const errorText = await longTokenResponse.text();
        console.error("Instagram long token exchange failed", errorText);
        res.redirect(`${stateData.returnUrl}?instagram=error`);
        return;
      }

      const longTokenData = (await longTokenResponse.json()) as { access_token?: string };
      if (!longTokenData.access_token) {
        res.redirect(`${stateData.returnUrl}?instagram=error`);
        return;
      }

      const accountsUrl = new URL("https://graph.facebook.com/v22.0/me/accounts");
      accountsUrl.searchParams.set("fields", "name,instagram_business_account{id,username}");
      accountsUrl.searchParams.set("access_token", longTokenData.access_token);

      const accountsResponse = await fetch(accountsUrl.toString());
      if (!accountsResponse.ok) {
        const errorText = await accountsResponse.text();
        console.error("Instagram account lookup failed", errorText);
        res.redirect(`${stateData.returnUrl}?instagram=error`);
        return;
      }

      const accountsData = (await accountsResponse.json()) as {
        data?: Array<{
          instagram_business_account?: { id?: string; username?: string };
        }>;
      };

      const instagramAccount = accountsData.data?.find((entry) => entry.instagram_business_account?.id)?.instagram_business_account;
      if (!instagramAccount?.id) {
        res.redirect(`${stateData.returnUrl}?instagram=no-account`);
        return;
      }

      await db.doc(INSTAGRAM_SETTINGS_DOC).set({
        accessToken: longTokenData.access_token,
        accountId: instagramAccount.id,
        username: instagramAccount.username ?? "tiptopbarbershopnl",
        connectedByUid: stateData.uid,
        updatedAt: FieldValue.serverTimestamp(),
      });

      await stateRef.delete();
      res.redirect(`${stateData.returnUrl}?instagram=connected`);
    } catch (error) {
      console.error("instagramOAuthCallbackHttp failed", error);
      res.status(500).send("Instagram connection failed.");
    }
  }
);

/* ── Email templates ─────────────────────────────────────────────── */

function buildHtmlEmail(m: Record<string, string>): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:20px;background:#f5f0eb;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);max-width:560px;">
        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
            <div style="color:#c9a84c;font-size:11px;letter-spacing:.25em;text-transform:uppercase;margin-bottom:8px;">
              Tip Top Barbershop
            </div>
            <div style="color:#fff;font-size:22px;font-weight:bold;letter-spacing:.05em;">
              Booking Confirmed ✂️
            </div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="color:#333;font-size:16px;margin:0 0 24px;">
              Hi <strong>${m.customerName}</strong>, your appointment is confirmed!
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;">
              <tr style="border-bottom:1px solid #f0ece7;">
                <td style="padding:10px 0;color:#777;">Service</td>
                <td style="padding:10px 0;color:#1a1a1a;font-weight:bold;text-align:right;">${m.serviceName}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0ece7;">
                <td style="padding:10px 0;color:#777;">Date</td>
                <td style="padding:10px 0;color:#1a1a1a;font-weight:bold;text-align:right;">${m.formattedDate}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0ece7;">
                <td style="padding:10px 0;color:#777;">Time</td>
                <td style="padding:10px 0;color:#1a1a1a;font-weight:bold;text-align:right;">${m.formattedTime}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#777;">Duration</td>
                <td style="padding:10px 0;color:#1a1a1a;font-weight:bold;text-align:right;">${m.serviceDuration} minutes</td>
              </tr>
            </table>
            <div style="margin-top:24px;background:#f9f5ef;border-left:3px solid #c9a84c;
                        padding:12px 16px;border-radius:0 4px 4px 0;font-size:13px;color:#555;">
              ✅ <strong>€5 deposit paid.</strong> This will be deducted from your total on the day.
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f5f0eb;padding:20px 40px;text-align:center;font-size:12px;color:#aaa;">
            Tip Top Barbershop &bull; See you soon!
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildTextEmail(m: Record<string, string>): string {
  return [
    `Hi ${m.customerName},`,
    "",
    "Your appointment at Tip Top Barbershop is confirmed!",
    "",
    `Service:  ${m.serviceName}`,
    `Date:     ${m.formattedDate}`,
    `Time:     ${m.formattedTime}`,
    `Duration: ${m.serviceDuration} min`,
    "",
    "€5 deposit paid — will be deducted from your total on the day.",
    "",
    "See you soon!",
    "Tip Top Barbershop",
  ].join("\n");
}
