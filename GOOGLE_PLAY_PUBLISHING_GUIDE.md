# Appointment Mobile — Setup, Android testing & Google Play release

**App:** `Appointment Booking` — React Native / Expo SDK 57. **Existing backend:** https://api-appointment.founderdesign.com. **Web app:** https://appointment.founderdesign.com.

> **Status:** Source implementation, not yet an installed/tested or approved Play Store application. The developer must run dependency checks, test with a real backend account, validate privacy disclosures and create the Play Console release.

## 1. Requirements

- Mac with Node.js 24 LTS or a supported current LTS, npm, Git; Android Studio/emulator or Android phone for testing
- Expo account (https://expo.dev), Google Play Console developer account (https://play.google.com/console)
- Existing Django API operating on HTTPS; a testing account with working activation email
- A unique Android package name. The sample is `com.founderdesign.appointment`. **Choose the final package identifier before your first Play Store upload:** you cannot later change it for the same listing.

## 2. Unzip and install

```bash
unzip appointment-mobile.zip
cd appointment-mobile
cp .env.example .env
npm install
npx expo install --fix
npx expo install expo-linking expo-constants expo-status-bar
npx expo-doctor
npm run check
```

`expo install --fix` reconciles Expo/React Native package versions to your installed SDK; review any changes before committing the lockfile. This project does not bundle `node_modules` or credentials. If dependency resolution fails, check the current [SDK docs](https://docs.expo.dev/versions/latest/) and regenerate the version constraints using the latest SDK's `create-expo-app` template before running `expo install --fix`.

`.env` includes `EXPO_PUBLIC_API_URL=https://api-appointment.founderdesign.com`. EXPO_PUBLIC variables are bundled into client apps: **never put secrets or API keys in them**.

## 3. Check Django backend before mobile testing

The supplied server files define these endpoints; the mobile app reuses them:

| Purpose | Existing endpoint |
| --- | --- |
| CSRF handshake | `GET /api/auth/csrf/` |
| Sign in/out/profile | `POST /api/auth/login/`, `POST /api/auth/logout/`, `GET /api/auth/me/` |
| Register / resend activation | `POST /api/auth/register/`, `POST /api/auth/activate/resend/` |
| Password reset / change | `POST /api/auth/password-reset/request/`, `POST /api/auth/change-password/` |
| Services / month / slots | `GET /api/appointments/services/`, `GET /api/appointments/availability/month/`, `GET /api/appointments/availability/slots/` |
| Book / mine | `POST /api/appointments/book/`, `GET /api/appointments/mine/` |
| Cancel / reschedule | `POST /api/appointments/mine/{public_id}/cancel/`, `POST /api/appointments/mine/{public_id}/reschedule/` |

The API uses Django session cookies, CSRF tokens, and a supplemental `expected_account` query parameter. Do not replace these with client-stored passwords or put session IDs into URLs. Verify that the Django deployment allows native mobile requests; browser CORS is different from native networking. Inspect `Set-Cookie` behavior, cookie expiry, `Secure`, and whether subsequent calls send the session cookie. The app must be tested on Android before publishing.

## 4. Create a development build (Expo Go does not work)

```bash
npm install -g eas-cli
# If the CLI has been rebranded on your account, use the documented current `eas` or `expo` command.
eas login
eas build:configure
eas build --platform android --profile development
```

Install the resulting APK from the Expo dashboard on your Android device. Start the bundler:

```bash
npx expo start --dev-client
```

Open the development build and connect it to Metro over the same network (or use a supported tunnel). Alternatively, with Android Studio set up locally, `npx expo run:android` builds/runs the native development app.

**Test session handling carefully:** Because this backend uses browser-style Django sessions, verify that login, an authenticated `GET /api/auth/me/`, booking, app restart and logout work on the real device. If the native networking stack does not persist `sessionid` and `csrftoken` reliably, stop and implement/test explicit cookie synchronization in the native client or add a separately secured mobile token scheme to Django. Do not publish until this is verified.

## 5. Android acceptance checklist

- Register unique email → activation email arrives → open link in browser → sign in to app.
- Existing account login, incorrect password, disabled account, unactivated account, resend activation, password reset request.
- Strong password validation and change-password-required flow.
- Close/reopen app → profile session restores; sign out → authenticated routes are no longer accessible.
- Change from account A to account B; neither user's bookings appear for the other, and `expected_account` rejects mismatches.
- Services, date availability, slot availability, staff choice, contact fields, booking confirmation, double-book race errors.
- Appointment lists: upcoming/past; cancellation only when allowed; rescheduling only before backend deadline; stale slot failures.
- Test slow/offline internet, Android back button, long text, small screen, large font, orientation/keyboard, accessibility and screen reader.
- Ensure email activation/reset works with the web app's live URLs. Test backend email delivery and privacy notice.

## 6. Update production metadata and graphics

Edit `app.json`: `expo.name`, `expo.slug`, `expo.android.package`, `expo.android.versionCode`, and `expo.version` as needed. Provide professionally designed `icon.png` and adaptive icon artwork *before publishing*. This starter deliberately does not include made-up brand assets; use your own logo and add `icon`, `android.adaptiveIcon`, and splash configuration following the current Expo assets documentation. Make sure the app icon and listing don't imply unverified affiliations.

Create and publish a publicly reachable privacy policy describing collection and retention of account data, contact numbers, appointment details, email notifications, cancellation/deletion and third-party processors. If users can register, review Google Play's **account deletion** requirements: you may need an in-app and web deletion route and possibly backend implementation; the supplied source does **not** implement account deletion. Do not claim compliance before completing this work. Verify the Play data safety form, contact details, age/content rating, permission declarations and target SDK with the latest Play Console prompts.

## 7. Build production Android App Bundle (.aab)

```bash
eas build --platform android --profile production
```

EAS handles signing/keystore provisioning; save your keystore/recovery information securely and do not commit it. Android `.aab` is for Play upload; `preview` produces an installable `.apk` for testing:

```bash
eas build --platform android --profile preview
```

Review build logs, test the production-equivalent preview APK, and confirm no development URLs, debugging interfaces or secrets are shipped.

## 8. Publish to Google Play

1. In [Play Console](https://play.google.com/console), create the application with the **same final package ID** as `app.json`.
2. Complete store listing: title, descriptions, category, screenshots (real screens), icon, feature graphic, support email, and privacy policy URL.
3. Complete App Content questionnaires, Data safety, app-access instructions (provide reviewer credentials if needed), content rating, ads declaration and account deletion information.
4. Use **Testing → Internal testing** first: upload the `.aab` from EAS, add testers, release and install from Play to verify production login/API sessions.
5. Move to closed testing if required. New personal developer accounts may be required to run a closed test with **at least 12 opted-in testers for 14 consecutive days** before applying for production access; follow the requirements shown in *your* Play Console.
6. Fix issues, increment `android.versionCode` for every new uploaded bundle, create a new production build, and submit for review.
7. Optionally configure `eas submit --platform android --profile production`, after setting up Google Play API/service-account credentials. Manual first submission through Console is simpler; never commit a service-account JSON key.

Official reference: https://docs.expo.dev/submit/android/ and https://docs.expo.dev/submit/android-manual/ . Store rules may change; follow the current Console UI.

## 9. Version updates

Increment `android.versionCode` and `expo.version`, then rebuild AAB. Maintain release notes and verify database/API compatibility. Use staged rollouts and check error reports. If your backend changes auth or booking fields, update `src/api.ts` and `src/types.ts`, test again, then publish a new version.

## 10. Boundaries of this delivery

- **Included:** entire customer-oriented Expo source, config, README, release guide.
- **Not included:** native build binaries, Play Console account configuration, branded graphics, live backend test accounts, payment integration, staff management, push notifications, account deletion, CI/CD credentials.
- **Backend unchanged:** because auth/cookie protocol and endpoint handling require live validation, do not modify production Django settings blindly. The website still handles email activation and password reset confirmation.
