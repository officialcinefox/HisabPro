# HisabPro 📱 — Mobile Application

> **Your Money, In Control.**  
> Production-ready mobile application for managing customer credit/debit records (udhar), payments, customer reminders, and personal expenses. Built with **React Native** and **Expo**.

---

## 🌟 Key Features

1. **Authentication & Session Management**
   - Full Sign Up, Sign In, and secure session persistence.
   - 6-digit OTP verification code email flow for password resets.
   - Profile management with customizable name and phone number.

2. **Home Dashboard**
   - **Net Balance Banner**: Instant display of net receivable/payable status.
   - **Financial Overview**: Lifetime Total Given (Maine Diye), Lifetime Total Received (Mujhe Mile), Lena Hai (receivable), Dena Hai (payable).
   - **Activity**: Today's transaction count & amount, current month's personal expenses, and today's transaction ledger.

3. **Customer Ledger & Udhar Tracking**
   - Search by name or phone number.
   - Sort by highest outstanding balance or most recently added.
   - Filter chips: `All`, `Lena Hai`, `Dena Hai`, `Settled`.
   - Add Customer with name, phone, and notes.
   - Ledger entries: **Maine Diye** (+ You Gave) and **Mujhe Mile** (- You Got).
   - Centralized calculation rules with Indian Rupee (`₹`) formatting (`₹1,25,000`).
   - Cascading deletion for customers and individual transaction management.

4. **In-App Customer Reminders**
   - Save reminder amounts and target dates for collection.
   - Visual badges for upcoming, completed, and past-due reminders.

5. **Personal Expense Tracking**
   - Track daily expenses by category: `Food`, `Travel`, `Shopping`, `Bills`, `Other`.
   - Monthly expense budget progress bars with percentage breakdowns.

6. **Customer Reports & Sharing**
   - Period filters: Last 7 Days, Last 30 Days, Custom date range.
   - Account statement PDF generation with HisabPro branding.
   - Native device PDF sharing and plain-text WhatsApp summary share.

7. **Appearance & Theming**
   - ☀️ Light Mode & 🌙 Dark Mode selectable from Profile.
   - Instant theme update across all screens and components.
   - Preference persisted locally across app restarts.

---

## 🎨 Brand Design Tokens

| Token | Hex Code | Purpose |
|---|---|---|
| Primary Orange | `#FF7A00` | Primary actions, FAB, active tabs |
| Secondary Orange | `#FF9F3D` | Highlights & accents |
| Dark Background | `#0B0F11` | Default app background |
| Dark Card | `#1A1D24` | Surface cards |
| Dark Elevated Surface | `#252A33` | Badges, inputs, chips |
| Light Background | `#F6F8FB` | Light theme background |
| Light Card | `#FFFFFF` | Light theme cards |
| Positive (Lena Hai) | `#22C55E` | Receivable balance / Mujhe Mile |
| Negative (Dena Hai) | `#EF4444` | Payable balance / Maine Diye |
| Settled | `#64748B` | Zero balance |

---

## 🚀 Running the App Locally

### 1. Prerequisites
- Node.js (v18+)
- Android device with Expo Go, or Android Emulator

### 2. Setup Environment
Copy `.env.example` to `.env` and fill in your configuration:
```bash
cp .env.example .env
```

### 3. Start Expo Development Server
```bash
npm start
```
- Press `a` in the terminal to launch on an Android emulator.
- Or scan the QR code using the **Expo Go** app on your physical Android phone.

### 4. Run Tests
```bash
npm test
```

### 5. Typecheck
```bash
npm run typecheck
```

---

## 📦 Building Standalone Android APK / AAB

### Build installable Android APK (for direct device installation):
```bash
npx eas-cli build --platform android --profile preview
```

### Build Android App Bundle (AAB for Google Play Store):
```bash
npx eas-cli build --platform android --profile production
```
