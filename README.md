# Appointment Mobile — Expo + React Native

Android-first customer app for the existing appointment backend (`https://api-appointment.founderdesign.com`). No replacement Django service or database required.

## Features

- Email registration with backend password checks and activation email
- Login, logout, session restoration, forgotten-password email, activation resend, password change
- Services, available calendar dates and slots, optional staff selection, bookings
- Customer upcoming/past appointments, cancel, reschedule; uses opaque `public_id` and account guard
- Native UI, not a WebView wrapping the website

## Development and verification

```bash
npm ci
cp .env.example .env
npm run check
npx expo-doctor
npx expo start --dev-client --tunnel
```

Install a compatible custom EAS Android development APK before connecting; Expo Go is not supported for the native cookie dependency.

## Important integration details

The Django API is **cookie/session + CSRF** authenticated. This app requires a **custom native build** for `@preeternal/react-native-cookie-manager` and **will not work in Expo Go**. Android login and session persistence have been verified on a physical Samsung tablet. Booking, cancellation, rescheduling, logout, and registration flows still need complete release testing. The current project uses the platform cookie jar; no session token is stored in AsyncStorage. Only use HTTPS. Avoid recording network logs containing cookies or CSRF tokens.

Activation and password reset use the existing email links, which lead to the existing website; the user returns to the app to log in. Staff/admin management remains on the website, not in this customer-focused mobile version.

See `GOOGLE_PLAY_PUBLISHING_GUIDE.md` for step-by-step instructions and pre-release checks.

## Publication status

The Android development build and login/session-persistence tests succeeded. This repository is a work-in-progress portfolio demonstration; the app is **not yet published on Google Play**. Do not commit `.env`, local Expo state, credentials, signing keys, or session logs.
