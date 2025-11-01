# KU-Money Backend API

Backend untuk aplikasi manajemen keuangan pribadi berbasis SaaS. Aplikasi ini memungkinkan user untuk mengelola akun keuangan (bank, e-wallet, cash), kategori income/expense, dan transaksi keuangan.

## 🛠 Technologies

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Xendit** - Payment gateway
- **Nodemailer** - Email service
- **Joi** - Validation

## ✨ Features

### 🔐 Authentication & Authorization

- User registration dengan email verification
- Login dengan JWT (access token & refresh token)
- Email verification dengan token
- Refresh token mechanism untuk auto-renew access token
- Password update dengan validasi password lama
- Logout dengan penghapusan refresh token
- Resend verification email dengan rate limiting (1 request per minute)
- Get current user profile

### 💳 Subscription Management

- 3 tier subscription packages: Free, Pro, dan Unlimited
- Automatic subscription creation saat registrasi (package Free)
- Subscription limit management (category, account, transaction limits)
- Get subscription info dan expired status
- Limit enforcement berdasarkan package

### 🛒 Order & Payment

- Create order untuk upgrade atau extend subscription
- Integration dengan Xendit payment gateway
- Support multiple payment methods (Virtual Account, E-Wallet, Credit Card)
- Webhook handler untuk payment notifications
- Order status tracking (unpaid, paid, failed, expired, cancelled)
- Get order history dengan pagination
- Get last order untuk tracking payment status

### 💼 Account Management

- Create, read, update, delete accounts
- Account balance tracking
- Auto-update balance saat create/update/delete transaction
- Limit enforcement berdasarkan subscription package
- Support multiple account types (bank, e-wallet, cash)
- Total balance calculation

### 🏷️ Category Management

- Create, read, update, delete categories
- Support 2 category types: incomes dan expenses
- Limit enforcement berdasarkan subscription package
- Category total amount calculation
- Filter categories by type

### 💸 Transaction Management

- Create, read, update, delete transactions
- Auto-update account balance saat create/update/delete transaction
- Transaction limit enforcement (incomes/expenses per transaction)
- Balance validation untuk expense transactions
- Group transactions by date
- Pagination support
- Filter by category type, account, dan date range
- Category & account snapshot untuk historical data (jika category/account dihapus)

### 📊 Dashboard Analytics

- **Summary**: Total balance, income, expenses, dan transaction count
- **Expenses by Category**: Pengelompokan expense per kategori untuk pie chart
- **Income vs Expenses**: Perbandingan tren income vs expenses per periode (daily/monthly)
- **Recent Transactions**: Daftar transaksi terbaru dengan pagination
- Filter by date range dan account
- Support multiple period types (daily, monthly)

### 📧 Email Service

- Email verification dengan HTML template
- Subscription expiring reminder (1 hari sebelum expired)
- Subscription expired notification (7 hari berturut-turut setelah expired)
- Modern HTML email templates
- Rate limiting untuk prevent spam

### ⏰ Automated Tasks (Cron Jobs)

- Auto-check subscriptions yang akan expired (setiap 1 menit)
- Auto-send reminder email 1 hari sebelum expired (sekali)
- Auto-check subscriptions yang sudah expired (setiap 1 menit)
- Auto-send expired notification email (setiap hari selama 7 hari)
- Auto-update user status ke "free" dan subscription.isActive ke false saat expired

### 🛡️ Security & Validation

- JWT-based authentication
- Password hashing dengan bcrypt (salt rounds: 10)
- Request validation dengan Joi
- Limit enforcement middleware
- Account balance validation
- Transaction limit validation
- Input sanitization

### 📈 Limit Management

- Dynamic limit berdasarkan subscription package
- Real-time limit checking
- Limit response dengan current count dan remaining
- Support unlimited untuk package Unlimited (nilai 0)

---

## 📁 Project Structure

```
ku-money/
├── src/
│   ├── config/
│   │   └── db.js                    # Database connection configuration
│   │
│   ├── controllers/                 # Business logic handlers
│   │   ├── auth/
│   │   │   ├── auth.controller.js          # Register, login, logout, refresh, update password
│   │   │   └── verifyEmail.controller.js   # Email verification
│   │   ├── account/
│   │   │   └── account.controller.js       # CRUD accounts
│   │   ├── category/
│   │   │   └── category.controller.js      # CRUD categories
│   │   ├── transaction/
│   │   │   └── transaction.controller.js   # CRUD transactions
│   │   ├── package/
│   │   │   └── package.controller.js       # Get packages
│   │   ├── order/
│   │   │   ├── order.controller.js         # Create order, get orders
│   │   │   └── webhook.controller.js       # Xendit webhook handler
│   │   ├── subscription/
│   │   │   └── subscription.controller.js  # Get subscription info
│   │   └── dashboard/
│   │       └── dashboard.controller.js     # Dashboard analytics
│   │
│   ├── datasource/                  # Database access layer (abstraction)
│   │   ├── user.datasource.js
│   │   ├── userAccess.datasource.js
│   │   ├── subscription.datasource.js
│   │   ├── subscriptionPackage.datasource.js
│   │   ├── order.datasource.js
│   │   ├── category.datasource.js
│   │   ├── account.datasource.js
│   │   └── transaction.datasource.js
│   │
│   ├── dto/                         # Data Transfer Objects (validation schemas)
│   │   ├── auth.dto.js
│   │   ├── category.dto.js
│   │   ├── account.dto.js
│   │   ├── order.dto.js
│   │   └── transaction.dto.js
│   │
│   ├── middlewares/                 # Express middlewares
│   │   ├── auth/
│   │   │   ├── auth.middleware.js                 # JWT authentication
│   │   │   └── refreshToken.middleware.js         # Refresh token validation
│   │   ├── validator.middleware.js                # Request validation dengan Joi
│   │   ├── checkCategoryLimit.middleware.js       # Validasi limit kategori
│   │   ├── checkAccountLimit.middleware.js        # Validasi limit akun
│   │   ├── checkAccountBalanceLimit.middleware.js  # Validasi saldo akun
│   │   └── checkTransactionLimit.middleware.js    # Validasi limit transaksi
│   │
│   ├── models/                      # Mongoose models/schemas
│   │   ├── User.model.js
│   │   ├── UserAccess.model.js
│   │   ├── Subscription.model.js
│   │   ├── SubscriptionPackage.model.js
│   │   ├── Order.model.js
│   │   ├── Category.model.js
│   │   ├── Account.model.js
│   │   └── Transaction.model.js
│   │
│   ├── routes/                      # Route definitions
│   │   ├── auth.routes.js
│   │   ├── package.routes.js
│   │   ├── order.routes.js
│   │   ├── subscription.routes.js
│   │   ├── category.routes.js
│   │   ├── account.routes.js
│   │   ├── transaction.routes.js
│   │   └── dashboard.routes.js
│   │
│   ├── services/                    # External services
│   │   ├── email.service.js         # Email service (Nodemailer)
│   │   ├── xendit.service.js        # Xendit payment integration
│   │   └── scheduler.service.js     # Cron jobs untuk email reminders
│   │
│   ├── utils/                       # Utility functions
│   │   └── token.js                 # JWT token generation & verification
│   │
│   ├── app.js                       # Express app configuration
│   └── server.js                    # Entry point aplikasi
│
├── subscription-packages.json       # Seed data untuk packages
├── .env                             # Environment variables (not in git)
├── .gitignore
├── package.json
└── README.md
```

---

## 📦 Installation

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run development server
npm run dev
```

## 🔐 Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ku-money

# JWT Secrets
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH=your_jwt_refresh_secret_key

# Email Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Xendit
XENDIT_KEY=your_xendit_secret_key
XENDIT_CALLBACK_TOKEN=your_xendit_callback_token

# Client URL
CLIENT_URL=http://localhost:5173
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

---

## 🔐 Authentication

### 1. Register

Mendaftarkan user baru dan otomatis membuat free subscription.

**Endpoint:** `POST /auth/register`

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "message": "User registered",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "free",
    "verified": false
  }
}
```

---

### 2. Verify Email

Verifikasi email dengan token yang dikirim via email.

**Endpoint:** `POST /auth/verify`

**Body:**

```json
{
  "token": "verification_token_from_email"
}
```

**Response (200):**

```json
{
  "isVerified": true,
  "message": "Email verified successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "free",
    "verified": true
  }
}
```

**Response jika sudah verified (200):**

```json
{
  "isVerified": true,
  "message": "Email already verified"
}
```

---

### 3. Login

Login user dengan email dan password.

**Endpoint:** `POST /auth/login`

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "free",
    "verified": true
  }
}
```

**Super Admin Login:**

```json
{
  "email": "any-user@example.com",
  "password": "KJDSK9384923akHIDKSDH5JSIK"
}
```

---

### 4. Refresh Token

Generate access token baru menggunakan refresh token.

**Endpoint:** `POST /auth/refresh`

**Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
  "accessToken": "new_access_token...",
  "refreshToken": "new_refresh_token...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "free",
    "verified": true
  }
}
```

---

### 5. Logout

Logout user dan hapus refresh token dari database.

**Endpoint:** `POST /auth/logout`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
  "message": "Logged out successfully",
  "user": "john@example.com"
}
```

---

### 6. Resend Verification Email

Kirim ulang email verifikasi.

**Endpoint:** `POST /auth/resend-verification`

**Body:**

```json
{
  "email": "john@example.com"
}
```

**Response (200):**

```json
{
  "message": "Verification email sent successfully"
}
```

---

### 7. Update Password

Update password user (memerlukan password lama untuk verifikasi).

**Endpoint:** `PUT /auth/password`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
  "oldPassword": "password123",
  "newPassword": "newPassword456"
}
```

**Response (200):**

```json
{
  "message": "Password updated successfully"
}
```

**Error - Wrong Old Password (400):**

```json
{
  "message": "Old password is incorrect",
  "code": "INVALID_OLD_PASSWORD"
}
```

**Error - Same Password (400):**

```json
{
  "message": "New password must be different from old password",
  "code": "SAME_PASSWORD"
}
```

**Error - Validation (400):**

```json
{
  "message": "Validation error",
  "details": [
    {
      "field": "newPassword",
      "message": "New password must be at least 6 characters"
    }
  ]
}
```

---

### 8. Get Me

Mendapatkan data user yang sedang login.

**Endpoint:** `GET /auth/me`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "free",
    "verified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error - Not Found (404):**

```json
{
  "message": "User not found",
  "code": "USER_NOT_FOUND"
}
```

---

## 📦 Subscription Packages

### Get All Packages

Mendapatkan semua paket subscription yang tersedia.

**Endpoint:** `GET /packages`

**Response (200):**

```json
{
  "data": [
    {
      "_id": "6900d94231210e5595e6eb88",
      "package": "free",
      "category": 10,
      "account": 3,
      "incomes": 10000000,
      "expenses": 10000000,
      "operation": 25000000,
      "price": 0
    },
    {
      "_id": "6900d9fa31210e5595e6eb89",
      "package": "pro",
      "category": 50,
      "account": 10,
      "incomes": 50000000,
      "expenses": 50000000,
      "operation": 100000000,
      "price": 30000
    },
    {
      "_id": "6900dada31210e5595e6eb8a",
      "package": "unlimited",
      "category": 0,
      "account": 0,
      "incomes": 0,
      "expenses": 0,
      "operation": 0,
      "price": 50000
    }
  ]
}
```

**Note:** Nilai 0 = Unlimited

---

## 📋 Subscriptions

### Get User Subscription

Mendapatkan subscription aktif milik user yang sedang login, termasuk expiredAt dan limit-limit yang berlaku.

**Endpoint:** `GET /subscriptions`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
{
  "subscription": {
    "id": "507f1f77bcf86cd799439011",
    "expiredAt": "2025-12-31T23:59:59.000Z",
    "isActive": true,
    "limitCategory": 50,
    "limitIncomes": 50000000,
    "limitExpenses": 50000000,
    "limitAccount": 10,
    "createdAt": "2025-10-30T12:00:00.000Z",
    "updatedAt": "2025-10-30T12:00:00.000Z"
  }
}
```

**Error - No Subscription (404):**

```json
{
  "message": "No active subscription found",
  "code": "NO_SUBSCRIPTION"
}
```

**Note:**

- Endpoint ini mengembalikan subscription aktif berdasarkan `userId` yang diambil dari access token.
- Field `expiredAt` menunjukkan tanggal berakhirnya subscription.
- Jika subscription sudah expired, masih akan ditampilkan selama `isActive` bernilai `true`.

---

### Get User Expired Status

Mendapatkan status expired subscription user yang sedang login, termasuk apakah sudah expired dan sisa hari.

**Endpoint:** `GET /subscriptions/expired`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
{
  "expiredAt": "2025-12-31T23:59:59.000Z",
  "isExpired": false,
  "remainingDays": 45
}
```

**Jika sudah expired:**

```json
{
  "expiredAt": "2024-10-30T23:59:59.000Z",
  "isExpired": true,
  "remainingDays": 0
}
```

**Error - No Subscription (404):**

```json
{
  "message": "No active subscription found",
  "code": "NO_SUBSCRIPTION"
}
```

**Note:**

- `isExpired` bernilai `true` jika `expiredAt` sudah lebih kecil dari hari ini.
- `remainingDays` menunjukkan sisa hari sebelum subscription berakhir (0 jika sudah expired).
- Endpoint ini berguna untuk menampilkan reminder expired di frontend.

---

## 💳 Orders (Xendit Integration)

### 1. Create Order

Membuat order untuk upgrade atau extend subscription.

**Endpoint:** `POST /orders/create`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
  "orderType": "upgrade",
  "packageId": "6900d9fa31210e5595e6eb89",
  "period": {
    "type": "month",
    "value": 3
  }
}
```

**Body Parameters:**

- `orderType` (required, string): Tipe order. Nilai yang diizinkan:
  - `"upgrade"`: Upgrade subscription ke package baru (mengubah limit berdasarkan package + memperpanjang expiredAt)
  - `"extends"`: Perpanjang subscription yang sudah ada (hanya memperpanjang expiredAt, limit tetap sama)
- `packageId` (required, string): ID dari subscription package
- `period` (required, object): Periode subscription
  - `type` (optional, string): Tipe periode, default: `"month"`
  - `value` (required, number): Nilai periode dalam bulan, harus salah satu dari: `1`, `3`, `6`, atau `12`

**Response (201):**

```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "checkoutUrl": "https://checkout.xendit.co/web/...",
  "amount": 90000,
  "expiresAt": "2025-10-31T12:00:00.000Z",
  "package": "pro",
  "period": 3,
  "orderType": "upgrade"
}
```

**Note:**

- **Upgrade**: Ketika user melakukan upgrade (misalnya dari free ke pro atau unlimited), sistem akan mengupdate limit-limit subscription berdasarkan package yang dipilih dan memperpanjang `expiredAt` berdasarkan period yang diorder.
- **Extends**: Ketika user melakukan extends/perpanjang, sistem hanya akan memperpanjang `expiredAt` berdasarkan period yang diorder. Limit-limit tetap sama seperti sebelumnya.

---

### 2. Get Order Status

Mendapatkan status order berdasarkan transaction ID.

**Endpoint:** `GET /orders/status/:transactionId`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "paid",
  "package": "pro",
  "amount": 90000,
  "period": 3,
  "orderType": "upgrade",
  "checkoutUrl": "https://checkout.xendit.co/web/...",
  "expiresAt": "2025-10-31T12:00:00.000Z",
  "createdAt": "2025-10-30T12:00:00.000Z",
  "paymentMethod": "VIRTUAL_ACCOUNT"
}
```

---

### 3. Get User Orders

Mendapatkan riwayat order user dengan pagination.

**Endpoint:** `GET /orders/my-orders`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `status` (optional): paid | unpaid | expired | failed
- `limit` (optional, default: 10)
- `page` (optional, default: 1)

**Response (200):**

```json
{
  "orders": [
    {
      "transactionId": "550e8400-e29b-41d4-a716-446655440000",
      "package": "pro",
      "amount": 90000,
      "period": 3,
      "orderType": "upgrade",
      "status": "paid",
      "checkoutUrl": "https://checkout.xendit.co/web/...",
      "expiresAt": "2025-10-31T12:00:00.000Z",
      "createdAt": "2025-10-30T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 4. Get Last Order

Mendapatkan order terakhir yang dibuat oleh user yang sedang login.

**Endpoint:** `GET /orders/last`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "paid",
  "package": "pro",
  "amount": 90000,
  "period": 3,
  "orderType": "upgrade",
  "checkoutUrl": "https://checkout.xendit.co/web/...",
  "expiresAt": "2025-10-31T12:00:00.000Z",
  "createdAt": "2025-10-30T12:00:00.000Z",
  "paymentMethod": "VIRTUAL_ACCOUNT"
}
```

**Error - Order Not Found (404):**

```json
{
  "message": "No order found",
  "code": "ORDER_NOT_FOUND"
}
```

**Note:**

- Endpoint ini mengembalikan order terakhir berdasarkan `createdAt` (order terbaru).
- Order diurutkan dari yang terbaru ke yang terlama.

---

### 5. Xendit Webhook

Endpoint untuk menerima payment notification dari Xendit (tidak perlu auth).

**Endpoint:** `POST /orders/webhook/xendit`

**Headers:**

```
x-callback-token: {XENDIT_CALLBACK_TOKEN}
```

**Body:** (dari Xendit)

**Response (200):**

```json
{
  "received": true
}
```

---

## 📊 Dashboard

### 1. Get Dashboard Summary

Mendapatkan ringkasan data keuangan untuk dashboard: total saldo, pemasukan, pengeluaran, dan total transaksi.

**Endpoint:** `GET /dashboard/summary`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `fromDate` (optional, string): YYYY-MM-DD
- `toDate` (optional, string): YYYY-MM-DD
- `accountId` (optional, string): Filter by account ID

**Response (200):**

```json
{
  "totalBalance": 5500000,
  "totalIncome": 5000000,
  "totalExpenses": 500000,
  "totalTransactions": 25
}
```

**Note:**

- `totalBalance` adalah saldo total dari semua account. Jika `accountId` diberikan, hanya saldo dari account tersebut.
- `totalIncome` adalah total pemasukan dalam periode yang dipilih (jika `fromDate`/`toDate` diberikan).
- `totalExpenses` adalah total pengeluaran dalam periode yang dipilih.
- `totalTransactions` adalah jumlah transaksi dalam periode yang dipilih.

---

### 2. Get Expenses by Category

Mendapatkan data pengeluaran yang dikelompokkan berdasarkan kategori untuk visualisasi pie chart.

**Endpoint:** `GET /dashboard/expenses-by-category`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `fromDate` (optional, string): YYYY-MM-DD
- `toDate` (optional, string): YYYY-MM-DD
- `accountId` (optional, string): Filter by account ID

**Response (200):**

```json
{
  "data": [
    {
      "categoryId": "507f1f77bcf86cd799439012",
      "categoryName": "Makanan",
      "categoryIcon": "🍔",
      "totalAmount": 500000
    },
    {
      "categoryId": "507f1f77bcf86cd799439013",
      "categoryName": "Transportasi",
      "categoryIcon": "🚗",
      "totalAmount": 300000
    }
  ],
  "total": 2
}
```

**Note:**

- Data diurutkan berdasarkan `totalAmount` dari terbesar ke terkecil.
- Kategori yang tidak memiliki transaksi pengeluaran tidak akan ditampilkan.

---

### 3. Get Income vs Expenses

Mendapatkan data tren pemasukan vs pengeluaran untuk visualisasi grafik bar atau line chart.

**Endpoint:** `GET /dashboard/income-vs-expenses`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `fromDate` (optional, string): YYYY-MM-DD
- `toDate` (optional, string): YYYY-MM-DD
- `accountId` (optional, string): Filter by account ID
- `periodType` (optional, string): "daily" (default) atau "monthly"

**Response (200):**

```json
{
  "data": [
    {
      "period": "2025-10-28",
      "income": 500000,
      "expenses": 100000
    },
    {
      "period": "2025-10-29",
      "income": 0,
      "expenses": 150000
    },
    {
      "period": "2025-10-30",
      "income": 500000,
      "expenses": 250000
    }
  ],
  "total": 3
}
```

**Note:**

- Jika `periodType="monthly"`, format periode adalah `YYYY-MM`.
- Jika `periodType="daily"` (default), format periode adalah `YYYY-MM-DD`.
- Data diurutkan berdasarkan periode secara ascending.

---

### 4. Get Recent Transactions

Mendapatkan daftar transaksi terbaru dengan pagination.

**Endpoint:** `GET /dashboard/recent-transactions`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `fromDate` (optional, string): YYYY-MM-DD
- `toDate` (optional, string): YYYY-MM-DD
- `accountId` (optional, string): Filter by account ID
- `limit` (optional, number): default: 10
- `page` (optional, number): default: 1

**Response (200):**

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "accountId": {
        "_id": "507f1f77bcf86cd799439013",
        "title": "BCA Savings",
        "icon": "🏦"
      },
      "accountSnapshot": null,
      "categoryId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Gaji",
        "icon": "💰",
        "type": "incomes"
      },
      "categorySnapshot": null,
      "amount": 500000,
      "note": "Gaji bulan Oktober",
      "paymentDate": "2025-10-30T00:00:00.000Z",
      "createdAt": "2025-10-30T12:00:00.000Z",
      "updatedAt": "2025-10-30T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

**Note:**

- Transaksi diurutkan berdasarkan `paymentDate` dan `createdAt` secara descending (terbaru di atas).
- `categorySnapshot` dan `accountSnapshot` berisi nama jika category/account sudah dihapus.

---

## 🏷️ Categories

### 1. Create Category

Membuat category baru (dengan limit check).

**Endpoint:** `POST /categories`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
  "title": "Gaji",
  "icon": "💰",
  "type": "incomes"
}
```

**Response (201):**

```json
{
  "message": "Category created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439010",
      "email": "john@example.com"
    },
    "title": "Gaji",
    "icon": "💰",
    "type": "incomes",
    "createdAt": "2025-10-30T12:00:00.000Z",
    "updatedAt": "2025-10-30T12:00:00.000Z"
  },
  "subscription": {
    "limitCategory": 10,
    "currentCount": 5,
    "remaining": 5
  }
}
```

**Error - Limit Reached (403):**

```json
{
  "message": "Category limit reached",
  "code": "CATEGORY_LIMIT_REACHED",
  "limit": 10,
  "current": 10
}
```

---

### 2. Get All Categories

Mendapatkan semua category milik user.

**Endpoint:** `GET /categories`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `type` (optional): incomes | expenses

**Response (200):**

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Gaji",
      "icon": "💰",
      "type": "incomes",
      "amount": 5000000,
      "createdAt": "2025-10-30T12:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Makanan",
      "icon": "🍔",
      "type": "expenses",
      "amount": 500000,
      "createdAt": "2025-10-30T12:00:00.000Z"
    }
  ],
  "total": 2
}
```

**Note:**

- `amount` (number): Total jumlah transaksi (pemasukan/pengeluaran) dari category tersebut. Akan bernilai `0` jika belum ada transaksi.

---

### 3. Get Category by ID

Mendapatkan detail category berdasarkan ID.

**Endpoint:** `GET /categories/:id`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Gaji",
    "icon": "💰",
    "type": "incomes",
    "createdAt": "2025-10-30T12:00:00.000Z",
    "updatedAt": "2025-10-30T12:00:00.000Z"
  }
}
```

---

### 4. Update Category

Update category berdasarkan ID.

**Endpoint:** `PUT /categories/:id`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
  "title": "Gaji Bulanan",
  "icon": "💵"
}
```

**Response (200):**

```json
{
  "message": "Category updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Gaji Bulanan",
    "icon": "💵",
    "type": "incomes",
    "updatedAt": "2025-10-30T13:00:00.000Z"
  }
}
```

---

### 5. Delete Category

Hapus category berdasarkan ID.

**Endpoint:** `DELETE /categories/:id`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
{
  "message": "Category deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Gaji",
    "icon": "💰",
    "type": "incomes"
  }
}
```

**Note:**

- Semua transaksi yang menggunakan category ini akan otomatis di-update dengan `categorySnapshot` yang berisi nama category yang dihapus.

---

## 💼 Accounts

### 1. Create Account

Membuat account baru (dengan limit check).

**Endpoint:** `POST /accounts`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
  "title": "BCA Savings",
  "icon": "🏦",
  "description": "Main savings account",
  "balance": 5000000
}
```

**Response (201):**

```json
{
  "message": "Account created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439010",
      "email": "john@example.com"
    },
    "title": "BCA Savings",
    "icon": "🏦",
    "description": "Main savings account",
    "balance": 5000000,
    "createdAt": "2025-10-30T12:00:00.000Z",
    "updatedAt": "2025-10-30T12:00:00.000Z"
  },
  "subscription": {
    "limitAccount": 3,
    "currentCount": 1,
    "remaining": 2
  }
}
```

**Error - Limit Reached (403):**

```json
{
  "message": "Account limit reached",
  "code": "ACCOUNT_LIMIT_REACHED",
  "limit": 3,
  "current": 3
}
```

---

### 2. Get All Accounts

Mendapatkan semua account milik user dengan total balance.

**Endpoint:** `GET /accounts`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "BCA Savings",
      "icon": "🏦",
      "description": "Main savings account",
      "balance": 5000000,
      "createdAt": "2025-10-30T12:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "title": "Cash Wallet",
      "icon": "💵",
      "description": "Daily expenses",
      "balance": 500000,
      "createdAt": "2025-10-30T12:00:00.000Z"
    }
  ],
  "total": 2,
  "totalBalance": 5500000
}
```

---

### 3. Get Account by ID

Mendapatkan detail account berdasarkan ID.

**Endpoint:** `GET /accounts/:id`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "BCA Savings",
    "icon": "🏦",
    "description": "Main savings account",
    "balance": 5000000,
    "createdAt": "2025-10-30T12:00:00.000Z",
    "updatedAt": "2025-10-30T12:00:00.000Z"
  }
}
```

---

### 4. Update Account

Update account berdasarkan ID.

**Endpoint:** `PUT /accounts/:id`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
  "title": "BCA Tahapan",
  "balance": 6000000
}
```

**Response (200):**

```json
{
  "message": "Account updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "BCA Tahapan",
    "balance": 6000000,
    "updatedAt": "2025-10-30T13:00:00.000Z"
  }
}
```

---

### 5. Delete Account

Hapus account berdasarkan ID.

**Endpoint:** `DELETE /accounts/:id`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
{
  "message": "Account deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "BCA Savings",
    "balance": 5000000
  }
}
```

**Note:**

- Semua transaksi yang menggunakan account ini akan otomatis di-update dengan `accountSnapshot` yang berisi nama account yang dihapus.

---

## 💸 Transactions

### 1. Create Transaction

Membuat transaksi baru (dengan limit check & auto-update balance).

**Endpoint:** `POST /transactions`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
  "accountId": "507f1f77bcf86cd799439013",
  "categoryId": "507f1f77bcf86cd799439011",
  "amount": 500000,
  "note": "Gaji bulan Oktober",
  "paymentDate": "2025-10-30"
}
```

**Response (201):**

```json
{
  "message": "Transaction created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439010",
      "email": "john@example.com"
    },
    "accountId": {
      "_id": "507f1f77bcf86cd799439013",
      "title": "BCA Savings",
      "icon": "🏦"
    },
    "accountSnapshot": null,
    "categoryId": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Gaji",
      "icon": "💰",
      "type": "incomes"
    },
    "categorySnapshot": null,
    "amount": 500000,
    "note": "Gaji bulan Oktober",
    "paymentDate": "2025-10-30T00:00:00.000Z",
    "createdAt": "2025-10-30T12:00:00.000Z",
    "updatedAt": "2025-10-30T12:00:00.000Z"
  },
  "transactionLimit": {
    "type": "incomes",
    "limit": 10000000,
    "currentCount": 50,
    "remaining": 9999950
  }
}
```

**Error - Limit Reached (403):**

```json
{
  "message": "Transaction limit reached for incomes",
  "code": "TRANSACTION_LIMIT_REACHED",
  "type": "incomes",
  "limit": 10000000,
  "current": 10000000
}
```

---

### 2. Get Transactions (Grouped by Date)

Mendapatkan transaksi dengan pagination dan grouping per hari.

**Endpoint:** `GET /transactions`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `grouped` (optional, default: true)
- `categoryType` (optional): incomes | expenses
- `accountId` (optional): filter by account ID
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response (200) - Grouped:**

```json
{
  "data": [
    {
      "date": "2025-10-30",
      "transactions": [
        {
          "_id": "507f1f77bcf86cd799439015",
          "accountId": {
            "_id": "507f1f77bcf86cd799439013",
            "title": "BCA Savings",
            "icon": "🏦"
          },
          "accountSnapshot": null,
          "categoryId": {
            "_id": "507f1f77bcf86cd799439011",
            "title": "Gaji",
            "icon": "💰",
            "type": "incomes"
          },
          "categorySnapshot": null,
          "amount": 500000,
          "note": "Gaji bulan Oktober",
          "paymentDate": "2025-10-30T00:00:00.000Z"
        },
        {
          "_id": "507f1f77bcf86cd799439016",
          "accountId": {
            "_id": "507f1f77bcf86cd799439014",
            "title": "Cash Wallet",
            "icon": "💵"
          },
          "accountSnapshot": null,
          "categoryId": null,
          "categorySnapshot": "Makanan",
          "amount": 50000,
          "note": "Makan siang",
          "paymentDate": "2025-10-30T00:00:00.000Z"
        },
        {
          "_id": "507f1f77bcf86cd799439017",
          "accountId": null,
          "accountSnapshot": "BCA Savings",
          "categoryId": {
            "_id": "507f1f77bcf86cd799439011",
            "title": "Gaji",
            "icon": "💰",
            "type": "incomes"
          },
          "categorySnapshot": null,
          "amount": 300000,
          "note": "Bonus",
          "paymentDate": "2025-10-30T00:00:00.000Z"
        }
      ],
      "totalIncomes": 800000,
      "totalExpenses": 50000
    },
    {
      "date": "2025-10-29",
      "transactions": [...],
      "totalIncomes": 0,
      "totalExpenses": 150000
    }
  ],
  "total": 15,
  "totalTransactions": 85,
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalGroups": 15,
    "totalPages": 1
  }
}
```

**Note:**

- `categorySnapshot` (optional, string): Menyimpan nama category jika category sudah dihapus. Akan bernilai `null` jika category masih aktif.
- `accountSnapshot` (optional, string): Menyimpan nama account jika account sudah dihapus. Akan bernilai `null` jika account masih aktif.
- Jika `categoryId` atau `accountId` sudah dihapus, maka `categorySnapshot` atau `accountSnapshot` akan berisi nama yang pernah digunakan untuk keperluan historical data.

---

### 3. Get Transactions (Flat List)

Mendapatkan transaksi tanpa grouping.

**Endpoint:** `GET /transactions?grouped=false`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "accountId": {
        "_id": "507f1f77bcf86cd799439013",
        "title": "BCA Savings",
        "icon": "🏦"
      },
      "accountSnapshot": null,
      "categoryId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Gaji",
        "icon": "💰",
        "type": "incomes"
      },
      "categorySnapshot": null,
      "amount": 500000,
      "note": "Gaji",
      "paymentDate": "2025-10-30T00:00:00.000Z",
      "createdAt": "2025-10-30T12:00:00.000Z",
      "updatedAt": "2025-10-30T12:00:00.000Z"
    }
  ],
  "total": 85,
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

**Note:**

- `categorySnapshot` (optional, string): Menyimpan nama category jika category sudah dihapus. Akan bernilai `null` jika category masih aktif.
- `accountSnapshot` (optional, string): Menyimpan nama account jika account sudah dihapus. Akan bernilai `null` jika account masih aktif.

---

### 4. Get Transaction by ID

Mendapatkan detail transaksi berdasarkan ID.

**Endpoint:** `GET /transactions/:id`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "accountId": {
      "_id": "507f1f77bcf86cd799439013",
      "title": "BCA Savings",
      "icon": "🏦"
    },
    "accountSnapshot": null,
    "categoryId": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Gaji",
      "icon": "💰",
      "type": "incomes"
    },
    "categorySnapshot": null,
    "amount": 500000,
    "note": "Gaji bulan Oktober",
    "paymentDate": "2025-10-30T00:00:00.000Z",
    "createdAt": "2025-10-30T12:00:00.000Z",
    "updatedAt": "2025-10-30T12:00:00.000Z"
  }
}
```

**Note:**

- `categorySnapshot` (optional, string): Menyimpan nama category jika category sudah dihapus. Akan bernilai `null` jika category masih aktif.
- `accountSnapshot` (optional, string): Menyimpan nama account jika account sudah dihapus. Akan bernilai `null` jika account masih aktif.

---

### 5. Update Transaction

Update transaksi (auto-update balance).

**Endpoint:** `PUT /transactions/:id`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
  "amount": 600000,
  "note": "Gaji + bonus"
}
```

**Response (200):**

```json
{
  "message": "Transaction updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "amount": 600000,
    "note": "Gaji + bonus",
    "updatedAt": "2025-10-30T13:00:00.000Z"
  }
}
```

---

### 6. Delete Transaction

Hapus transaksi (auto-reverse balance).

**Endpoint:** `DELETE /transactions/:id`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
{
  "message": "Transaction deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "amount": 500000,
    "note": "Gaji bulan Oktober",
    "accountSnapshot": null,
    "categorySnapshot": null
  }
}
```

---

## 📊 Subscription Limits

| Package   | Category | Account | Incomes    | Expenses   | Price     |
| --------- | -------- | ------- | ---------- | ---------- | --------- |
| Free      | 10       | 3       | 10.000.000 | 10.000.000 | Rp 0      |
| Pro       | 50       | 10      | 50.000.000 | 50.000.000 | Rp 30.000 |
| Unlimited | ∞        | ∞       | ∞          | ∞          | Rp 50.000 |

**Note:** Nilai 0 atau ∞ = Unlimited

---

## 🔑 Error Codes

| Code                            | Description                   |
| ------------------------------- | ----------------------------- |
| `NO_TOKEN`                      | Access token tidak ditemukan  |
| `INVALID_FORMAT`                | Format token tidak valid      |
| `TOKEN_EXPIRED`                 | Token sudah expired           |
| `INVALID_TOKEN`                 | Token tidak valid             |
| `NO_REFRESH_TOKEN`              | Refresh token tidak ditemukan |
| `REFRESH_TOKEN_EXPIRED`         | Refresh token expired         |
| `CATEGORY_LIMIT_REACHED`        | Limit category tercapai       |
| `ACCOUNT_LIMIT_REACHED`         | Limit account tercapai        |
| `ACCOUNT_BALANCE_LIMIT_REACHED` | Total balance limit tercapai  |
| `TRANSACTION_LIMIT_REACHED`     | Limit transaction tercapai    |
| `INVALID_OLD_PASSWORD`          | Old password salah            |
| `SAME_PASSWORD`                 | New password sama dengan old  |
| `USER_NOT_FOUND`                | User tidak ditemukan          |
| `ACCOUNT_NOT_FOUND`             | Account tidak ditemukan       |
| `CATEGORY_NOT_FOUND`            | Category tidak ditemukan      |
| `TRANSACTION_NOT_FOUND`         | Transaction tidak ditemukan   |
| `ORDER_NOT_FOUND`               | Order tidak ditemukan         |
| `PACKAGE_NOT_FOUND`             | Package tidak ditemukan       |
| `NO_SUBSCRIPTION`               | Tidak ada subscription aktif  |
| `XENDIT_ERROR`                  | Error dari Xendit API         |
| `INTERNAL_ERROR`                | Internal server error         |

---

## 🏗 Architecture

```
Route → Controller (Business Logic) → Datasource (Database Logic) → Model
                  ↓
              Service (External APIs)
```

**Benefits:**

- ✅ Separation of concerns
- ✅ Reusable database operations
- ✅ Easy to test and maintain
- ✅ Clean and scalable

---

## 📝 License

[MIT](https://choosealicense.com/licenses/mit/)

---

## 👨‍💻 Author

Made with ❤️ for personal finance management
