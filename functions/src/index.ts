import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";
import * as nodemailer from "nodemailer";

/* ── Secrets (set with: firebase functions:secrets:set SECRET_NAME) ── */
const STRIPE_SECRET = defineSecret("STRIPE_SECRET_KEY");
const EMAIL_HOST    = defineSecret("EMAIL_HOST");
const EMAIL_PORT    = defineSecret("EMAIL_PORT");
const EMAIL_USER    = defineSecret("EMAIL_USER");
const EMAIL_PASS    = defineSecret("EMAIL_PASS");
const EMAIL_FROM    = defineSecret("EMAIL_FROM");
const GOOGLE_MAPS_API_KEY = defineSecret("GOOGLE_MAPS_API_KEY");

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
