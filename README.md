# Tip Top Barbershop Web App

Tip Top Barbershop is a React + Vite application for a modern barbershop operation:
- premium marketing website,
- multilingual booking flow,
- Stripe checkout with iDEAL support,
- barber operations portal (dashboard + client detail hub),
- TV display and remote queue control.

## Tech Stack

- React
- TypeScript + JavaScript
- Vite
- Tailwind CSS
- Firebase (Auth + Functions)
- Stripe Checkout
- LocalStorage + BroadcastChannel

## Design and Branding System

The UI uses a consistent brand system:
- typography: Roboto Condensed (headings), Lora (body)
- palette: charcoal/black base with antique gold accents
- reusable brand utilities in src/index.css
- shared visual language across public and staff pages (cards, headers, buttons, spacing, transitions)

Core branding files:
- src/index.css
- src/components/Layout.jsx
- src/pages/Home.jsx
- src/pages/Services.jsx
- src/pages/About.jsx
- src/pages/Gallery.jsx
- src/pages/Contact.jsx

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Start local development

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

## Firebase Setup

1. Create a Firebase project in Firebase Console.
2. Enable sign-in methods you use (Google, Apple, Phone).
3. Add Firebase web app config to src/lib/firebase.ts.
4. Install Firebase CLI and log in.
5. Configure functions secrets (required for payments and reviews):

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set EMAIL_HOST
firebase functions:secrets:set EMAIL_PORT
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASS
firebase functions:secrets:set EMAIL_FROM
firebase functions:secrets:set GOOGLE_MAPS_API_KEY
```

6. Deploy functions from the functions folder:

```bash
npm run deploy
```

## Main Features

### Customer booking

- route: /book
- multilingual UI (NL default, EN available)
- service selection and slot selection
- checkout via Firebase function + Stripe
- payment methods include card and iDEAL
- confirmation screen with calendar export
- My Bookings view with upcoming/history controls
- free client reschedule when appointment is at least 24h away

Main file:
- src/pages/BookingPage.tsx

### Public website

- route set: /Home, /Services, /Gallery, /About, /Contact
- shared premium brand styling
- testimonials can load live Google reviews through cloud function with fallback

Main files:
- src/components/home/*
- src/pages/Home.jsx
- src/pages/Services.jsx
- src/pages/Gallery.jsx
- src/pages/About.jsx
- src/pages/Contact.jsx

### Barber operations

- route: /barber/login
- route: /barber/dashboard
- route: /barber/clients
- drag-and-drop daily appointment timeline
- start/finish session controls
- break time controls
- client detail hub with search, filters, notes, and CSV export

Main files:
- src/pages/BarberLoginPage.tsx
- src/pages/BarberDashboardPage.tsx
- src/pages/BarberClientsPage.tsx

### TV + Remote

- route: /tv
- route: /remote
- live queue/schedule viewing and remote YouTube queue management

Main files:
- src/pages/TVDisplayPage.tsx
- src/pages/RemoteControlPage.tsx

## Data and Sync

Appointment data:
- localStorage key: tiptop_appointments
- context: src/context/BookingContext.tsx

YouTube queue:
- storage key: tiptop_youtube
- BroadcastChannel: tiptop_youtube_channel
- hook: src/hooks/useYouTubeQueue.ts

Client notes:
- localStorage key: tiptop_client_notes
- page: src/pages/BarberClientsPage.tsx

## Routes

- /Home
- /Services
- /Gallery
- /About
- /Contact
- /book
- /tv
- /remote
- /barber/login
- /barber/dashboard
- /barber/clients

## Scripts

- npm run dev
- npm run build
- npm run preview
- npm run lint
- npm run lint:fix
