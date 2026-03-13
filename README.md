# Tip Top Barbershop Web App

Tip Top Barbershop is a React + Vite application with:
- public-facing marketing pages,
- appointment booking,
- a barber dashboard (agenda/session management),
- a TV live feed for in-shop display,
- and a mobile remote page for YouTube music queue control.

## Tech Stack

- React
- TypeScript / JavaScript
- Vite
- Tailwind CSS
- Firebase Phone Auth (free tier)
- LocalStorage + BroadcastChannel (for real-time sync across tabs/screens)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open the local URL shown in the terminal (usually `http://localhost:5173`).

## Firebase Setup (Phone Auth)

1. Go to [Firebase Console](https://console.firebase.google.com) and create a project.
2. Enable **Phone** sign-in under **Authentication → Sign-in method**.
3. Copy your Firebase config from **Project settings → General**.
4. Paste the values into `src/lib/firebase.ts`.
5. (Optional) Add test phone numbers under **Authentication → Phone → Phone numbers for testing** to avoid SMS charges during development.

Firebase Phone Auth is **free** up to 10,000 verifications/month on the Spark plan.

## Core Functionalities

### 1) Booking Flow (Customer)

The booking flow requires **Firebase Phone Authentication** before a customer can book:

1. Customer visits `/book` and enters their phone number.
2. Firebase sends a one-time SMS code (invisible reCAPTCHA — no user interaction).
3. Customer enters the 6-digit code to verify.
4. After verification, the customer sees a **2-week agenda overview** showing every day and time slot.
5. Slots are color-coded: green = available, red = taken, grey = blocked.
6. Tap an available slot → a sticky bottom bar confirms service, date, time → tap "Confirm Booking".

How it works:
- Time slots run from **09:00 to 17:00** (30-minute intervals).
- Slots already booked (or in progress) are hidden from availability.
- Service duration + break time is respected when computing slot availability.
- Phone number is captured automatically from Firebase auth — no manual entry needed.
- Successful bookings are saved to local storage and immediately visible in agenda/live feed pages.

Main file:
- `src/pages/BookingPage.tsx`

### 2) Agenda / Barber Dashboard

The dashboard shows today’s schedule and supports session state changes:
- **Start Session**: moves the next booked client to `in-progress`.
- **End Session**: complete current session via cash or payment-link flow.
- Clear status badges: `booked`, `in-progress`, `completed`.

Main file:
- `src/pages/BarberDashboardPage.tsx`

### 3) Live Feed (TV Display)

The TV display is designed for in-shop screens and updates continuously:
- **Now Serving** section,
- **Up Next** queue,
- **Available Today** (book slots),
- full mini schedule timeline,
- YouTube music player + queue info,
- QR code that opens remote control on a phone.

Main file:
- `src/pages/TVDisplayPage.tsx`

### 4) Book Slots Page Behavior

“Book slots” refers to available appointment times shown in:
- the booking form (`BookingPage`), and
- the TV live feed (`Available Today` section).

Slot rules:
- `completed` appointments do **not** block a slot anymore,
- `booked` and `in-progress` appointments keep the slot occupied,
- sorting is chronological by time.

### 5) Music Remote Control (Phone)

Remote page allows clients/staff to:
- add YouTube links to queue,
- set optional title,
- skip to a queued video,
- remove queued videos.

Main file:
- `src/pages/RemoteControlPage.tsx`

## Data + Live Sync

### Appointment storage

- Key: `tiptop_appointments`
- Stored in browser localStorage
- Managed by:
  - `src/context/BookingContext.tsx`

### YouTube queue storage + sync

- Storage key: `tiptop_youtube`
- Broadcast channel: `tiptop_youtube_channel`
- Managed by:
  - `src/hooks/useYouTubeQueue.ts`

This enables near real-time updates between pages/tabs (e.g., TV screen + mobile remote).

## How to Use (Operational Example)

1. Open booking page and create appointments.
2. Open dashboard and start/end sessions as clients are served.
3. Open TV display on a second screen to show live agenda + open slots.
4. Scan TV QR code with phone to open remote and add songs.

## Available Demo Credentials (Barber Login)

Defined in `src/context/AuthContext.tsx`:
- Username: `barber` / Password: `tiptop123`
- Username: `test` / Password: `test123`

## Route Notes

Operational pages exist in `src/pages`:
- `BookingPage.tsx`
- `BarberLoginPage.tsx`
- `BarberDashboardPage.tsx`
- `TVDisplayPage.tsx`
- `RemoteControlPage.tsx`

If you want direct URL access (for example `/book`, `/tv`, `/remote`, `/barber/login`, `/barber/dashboard`), ensure these routes are registered in your app router.

## Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint
- `npm run lint:fix` — auto-fix lint issues
