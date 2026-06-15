# CouponX — Coupon & Ticket Exchange Marketplace

A full-stack mobile marketplace for buying, selling, and claiming coupons and tickets. Users can browse offers, upload their own coupons (Swiggy, Flipkart, Myntra, Movie, Train, Bus, etc.), purchase with Razorpay, chat with sellers in real time, and leave reviews.

## Features

- **User Auth** — Register, login, Google OAuth, JWT sessions, profile management
- **Browse Offers** — Feed with search, category/price filters, infinite scroll
- **Upload Offers** — Post coupons/tickets with images, description, price, expiry
- **Claim / Purchase** — Free one-click claim or paid checkout via Razorpay
- **Real-time Chat** — Buyer-seller messaging via Socket.io
- **Orders** — Track purchases with status lifecycle (pending → confirmed → completed)
- **Reviews & Ratings** — Rate transaction counterparty (1–5 stars)
- **Push Notifications** — Alerts for offers, claims, messages
- **Categories** — Pre-seeded: Swiggy, Flipkart, Myntra, Movie, Train, Bus, Other
- **Swagger API Docs** — Auto-generated at `/api-docs`

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo SDK 54, Expo Router 6, TypeScript) |
| State | Zustand |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Payments | Razorpay |
| Real-time | Socket.io |
| File Storage | Cloudinary |
| API Docs | swagger-jsdoc + swagger-ui-express |

## Project Structure

```
CouponX/
├── mobile/                        # React Native (Expo) app
│   ├── app/                       # Expo Router pages
│   │   ├── (auth)/                # login, register
│   │   ├── (tabs)/                # home, search, upload, orders, profile
│   │   ├── offer/[id].tsx         # offer detail
│   │   ├── order/[id].tsx         # order detail
│   │   └── chat/[id].tsx          # chat screen
│   ├── components/                # reusable UI components
│   ├── store/                     # Zustand stores
│   ├── api/                       # Axios client + Socket.io client
│   ├── constants/                 # colors, categories
│   └── services/                  # payment, notifications
│
├── server/                        # Express API
│   ├── src/
│   │   ├── controllers/           # route handlers
│   │   ├── routes/                # Express routers
│   │   ├── models/                # Mongoose schemas
│   │   ├── middleware/            # auth, error handler, upload
│   │   ├── config/                # env, db, swagger
│   │   ├── socket.ts              # Socket.io setup
│   │   └── index.ts               # entry point
│   └── package.json
│
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)
- Razorpay account (test mode)
- Cloudinary account
- Expo CLI (`npm install -g expo-cli`)

### Server Setup

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp ../.env.example .env
# Edit .env with your MongoDB URI, JWT secret, Razorpay keys, Cloudinary keys

# Start in development mode
npm run dev

# Build and run production
npm run build
npm start
```

### Mobile Setup

```bash
cd mobile

# Install dependencies
npm install

# Create environment file
# Create .env with:
# EXPO_PUBLIC_API_URL=http://<your-ip>:5000/api
# EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Start the app
npx expo start
```

### Environment Variables

**Server (`server/.env`)**

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `APP_URL` | Deep linking URL scheme |

**Mobile (`mobile/.env`)**

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend API URL (e.g., `http://192.168.1.x:5000/api`) |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |

### API Endpoints

Full interactive docs available at `http://localhost:5000/api-docs` when the server is running.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/offers` | List offers (with filters) |
| GET | `/api/offers/:id` | Get offer details |
| POST | `/api/offers` | Create an offer |
| GET | `/api/offers/my` | Get my listings |
| POST | `/api/orders` | Claim/purchase an offer |
| GET | `/api/orders` | Get my orders |
| PUT | `/api/orders/:id/status` | Update order status |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify Razorpay payment |
| POST | `/api/chat/conversations` | Start a conversation |
| GET | `/api/chat/conversations` | List conversations |
| POST | `/api/reviews` | Submit a review |
| GET | `/api/categories` | List categories |

## Testing with Razorpay

In test mode, use the following test card:

- **Card number:** `4111 1111 1111 1111`
- **Expiry:** Any future date
- **CVV:** Any 3 digits
- **OTP:** `1234`

## License

MIT
