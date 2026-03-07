# Lightning POS - Accept Bitcoin Everywhere

A mobile-first Lightning Network payment application designed for businesses in Africa. This Point of Sale (POS) system allows merchants to accept Bitcoin payments and optionally convert them to local currency (Rand) instantly.

## Key Features

### 👤 Multi-User Roles
- **Admin**: Full control over balances, withdrawal settings, and transaction history.
- **Cashier**: Streamlined interface for processing incoming payments with basic session tracking.

### 💰 Modern Tipping
- Integrated tipping options (10%, 15%, 20%) directly in the payment flow.
- Tips are automatically calculated and converted into Satoshi amounts.

### 📝 Order References
- Support for adding references or notes to transactions (e.g., table numbers, bill IDs).
- All notes are searchable and stored in the transaction history.

### 🔄 Integrated Refunds
- (Mock) Refund system for Admins to handle customer returns directly within the POS.
- Simulates the full Lightning invoice scanning flow.

### 📶 Offline QR Fallback
- Dedicated Offline Mode using static LNURL-Pay QR codes.
- Keep accepting payments even during connectivity issues.

### 📱 Progressive Web App (PWA)
- Optimized for mobile home-screen installation.
- Fast, responsive, and app-like experience on any smartphone.

## Tech Stack
- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism), JavaScript (Vanilla).
- **Icons**: [Phosphor Icons](https://phosphoricons.com/).
- **Typography**: Outfit (Google Fonts).

## Getting Started
1. Clone the repository.
2. Open `index.html` in any modern web browser.
3. Select your role and start accepting payments!

---
*Created for the Lightning Network ecosystem in Africa.*
