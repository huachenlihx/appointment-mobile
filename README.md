# Appointment Mobile — React Native + Expo

A customer-facing Android appointment booking application built with **React Native, Expo Router, and TypeScript**, connected to the existing Django REST Framework backend. This is a native mobile interface, **not a WebView** of the appointment website.

- **Live website:** https://appointment.founderdesign.com/
- **Django API:** https://api-appointment.founderdesign.com/
- **Source repository:** https://github.com/huachenlihx/appointment-mobile

> **Status:** Expo SDK 58 dependency upgrade completed and validated locally. An earlier Android development build successfully demonstrated login and session persistence; the **SDK 58 Android build and full appointment workflows still require device testing**. The app is **not yet published on Google Play**.

## Features

- Customer account registration, email activation flow, sign-in and sign-out
- Session restoration, password-reset request, activation-email resend, and password change
- Browse services, available dates and time slots, with optional staff selection
- Create appointments and view upcoming or past bookings
- Reschedule or cancel eligible appointments
- Integration with the existing Django REST API and its account-scoped protections

Staff/admin management remains on the existing web application.

## Technology stack

The versions below are declared in the project's `package.json` after the Expo SDK 58 upgrade. Ranges such as `~` and `^` may resolve to later compatible patch or minor versions in the lockfile.

| Package / technology | Declared version |
| --- | --- |
| Expo | `^58.0.26` (SDK 58) |
| React Native | `0.88.1` |
| React | `19.3.0` |
| React DOM | `19.3.0` |
| Expo Router | `~58.0.32` |
| Expo Dev Client | `~58.0.21` |
| Expo Constants | `~58.0.16` |
| Expo Linking | `~58.0.17` |
| Expo Status Bar | `~58.0.5` |
| React Native Reanimated | `4.7.1` |
| React Native Worklets | `0.13.0` |
| React Native Screens | `~4.30.1` |
| React Native Safe Area Context | `~5.11.1` |
| Native Cookie Manager | `@preeternal/react-native-cookie-manager@^7.0.0` |
| TypeScript | `~6.0.3` |

## Get started

### Prerequisites

- Node.js and npm
- An Expo account and EAS CLI for Android development builds
- Android phone or tablet for native-device testing (or an appropriately configured Android emulator)

### Install and configure

```bash
# Clone this public project
git clone https://github.com/huachenlihx/appointment-mobile.git
cd appointment-mobile

# Install the exact dependency tree from package-lock.json
npm ci

# Configure the API endpoint
cp .env.example .env
```

Set the API URL in `.env`:

```dotenv
EXPO_PUBLIC_API_URL=https://api-appointment.founderdesign.com
```

`EXPO_PUBLIC_*` values are embedded in the client application: **never put secrets, API keys, passwords, or signing credentials in them**. The `.env` file should remain untracked.

### Validate the installation

```bash
npx expo install --check
npx expo-doctor
npm run check
npm audit
```

Following the SDK 58 upgrade on November 23, 2026, the developer reported successful `npm ci`, `expo install --check`, `expo-doctor` (**20/20**), and TypeScript checks. `npm audit` reported **three moderate-severity findings** at that time; review them before production release rather than using `npm audit fix --force` blindly.

### Build and run on Android

This app uses a native cookie-management module and **requires a custom Expo development build**. It is **not supported in the standard Expo Go app**.

```bash
npm install --global eas-cli
eas login

# Create a custom Android development APK
eas build --platform android --profile development
```

Install the APK from the successful EAS build page on the Android device. You can decline the emulator-install prompt if you are using a physical device. Then run:

```bash
npx expo start --dev-client --tunnel
```

Open the **Appointment Mobile development app**, not Expo Go, and connect it to the Metro server. If changing native dependencies or native configuration (such as supported orientations), rebuild the APK.

## Django authentication and security

The existing backend uses **Django session cookies and CSRF validation**, rather than JWT authentication. The mobile API client:

- Calls `/api/auth/csrf/` to initialize CSRF protection.
- Sends the `X-CSRFToken` header and cookies with state-changing requests.
- Supplies the HTTPS API `Origin` header for those requests; this was required to resolve a Django HTTP 403 issue on Android.
- Uses `@preeternal/react-native-cookie-manager` for native cookie handling.
- Avoids storing the session token in AsyncStorage.

On a physical Android tablet, login and session persistence across app restarts were verified **before the SDK 58 upgrade**. These security-sensitive paths must be retested with a new SDK 58 development APK. Do not log passwords, cookies, session identifiers, or CSRF token values.

Email activation and password-reset links are handled by the existing website; users return to the app to sign in.

## Project structure

```text
app/                           Expo Router screens and layouts
src/                           API client, authentication, theme, types
app.json                       Expo app configuration
eas.json                       EAS build profiles
package.json                   Dependencies and npm scripts
package-lock.json              Locked dependency tree
GOOGLE_PLAY_PUBLISHING_GUIDE.md Android publishing instructions
README.md                      This guide
```

Useful commands:

```bash
npm run check                     # TypeScript type checking
npm run doctor                    # Expo Doctor
npx expo install --check          # Expo SDK compatibility check
npm outdated                      # Inspect available package updates
npx expo install --fix            # Align Expo-managed dependency versions
```

Keep Expo-managed packages aligned with the installed SDK; upgrading every package to its newest major version independently can break compatibility.

## Release readiness

Before publishing to Google Play, verify on a fresh **Expo SDK 58** Android build:

- [ ] Account registration and email activation
- [ ] Login, app restart/session persistence, and logout
- [ ] Service, date, time-slot, and staff selection
- [ ] Booking confirmation and visibility on the website
- [ ] Rescheduling and cancellation
- [ ] Password reset and change-password flows
- [ ] Portrait and landscape UI on the target devices
- [ ] Dependency/security audit and release configuration
- [ ] Privacy policy, account deletion requirements, and store listing

For the Android AAB build, Play Console submission, and testing track, see [`GOOGLE_PLAY_PUBLISHING_GUIDE.md`](GOOGLE_PLAY_PUBLISHING_GUIDE.md).

## Publication status

This public repository demonstrates the React Native/Expo client for a working appointment booking backend. The **Google Play release is pending**. Do not commit `.env`, signing keys, personal data, local Expo state, or authentication/session logs.
