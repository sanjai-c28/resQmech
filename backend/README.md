# resQmech Backend - Roadside Assistance Dispatch Engine

An Uber-like on-demand roadside assistance REST API and dispatch service built using **Node.js**, **Express**, and **TypeScript**.

---

## 🛠️ Features & Architecture

- **Data Models & Strict TypeScript Types**: Comprehensive interfaces for `User`, `MechanicProfile`, `AssistanceRequest`, `VehicleType`, `IssueType`, and `Coordinates`.
- **Haversine Distance & ETA Calculation**: Fast great-circle distance algorithm calculates the real-time distance between customer breakdowns and nearby available technicians, estimating arrival time based on urban transit speeds.
- **Dynamic Fee Calculator**: Computes base fee based on vehicle type (`TWO_WHEELER`, `FOUR_WHEELER`, `COMMERCIAL`) and issue severity (`PUNCTURE`, `BATTERY_JUMP`, `TOWING`, etc.).
- **Concurrency Locking & OTP Verification**: Atomic locking guarantees only one technician can accept an assistance request. A cryptographically generated 4-digit numeric OTP secures the physical handoff when the mechanic arrives on site.
- **Zod Input Validation & Error Handling**: Strict schema validation on request bodies and query parameters with clean HTTP error responses (`400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`).
- **Seeded Mock Repository**: Pre-populated in-memory repository with 5 realistic mechanics located across major hubs in Chennai, India.

---

## 📍 Seeded Chennai Mechanics

Center coordinates: **Chennai Central (lat: 13.0827, lng: 80.2707)**

| Mechanic ID | Name | Location / Area | Coordinates | Rating | Vehicles Served | Specialty |
|-------------|------|-----------------|-------------|--------|-----------------|-----------|
| `mech-005` | Praveen Kumar | Royapettah / Marina Beach | `13.0583, 80.2642` (~2.8 km) | 4.9 ⭐ | Two Wheeler | Quick puncture & battery |
| `mech-001` | Suresh Kumar | T. Nagar Hub | `13.0418, 80.2341` (~6.2 km) | 4.8 ⭐ | Two Wheeler, Four Wheeler | Auto care & mechanical |
| `mech-003` | Karthik Raja | Anna Nagar | `13.0850, 80.2101` (~6.5 km) | 4.7 ⭐ | Two Wheeler, Four Wheeler | Rapid roadside & fuel |
| `mech-004` | Vignesh Selvam | Adyar / Besant Nagar | `13.0012, 80.2565` (~9.2 km) | 4.6 ⭐ | Two Wheeler, Four Wheeler | Bike & car repair clinic |
| `mech-002` | Ramesh Babu | Guindy Industrial Estate | `13.0067, 80.2026` (~11.0 km) | 4.9 ⭐ | Four Wheeler, Commercial | Heavy towing & recovery |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```

### 3. Build & Run Production Bundle
```bash
npm run build
npm start
```

### 4. Run Integration Test Suite
```bash
npm test
```

---

## 📡 API Reference & Sample Curl Commands

### 1. Find Nearby Mechanics (Sorted by Haversine Distance)
**Endpoint:** `GET /api/v1/mechanics/nearby`  
**Query Parameters:**
- `lat` (number, -90..90) - Required
- `lng` (number, -180..180) - Required
- `radiusKm` (number, default: 15) - Optional
- `vehicleType` (e.g. `TWO_WHEELER`, `FOUR_WHEELER`, `COMMERCIAL`) - Optional
- `issueType` (e.g. `PUNCTURE`, `BATTERY_JUMP`, `TOWING`) - Optional

```bash
curl -X GET "http://localhost:3000/api/v1/mechanics/nearby?lat=13.0827&lng=80.2707&radiusKm=10"
```

---

### 2. Create Assistance Request & Trigger Dispatch
**Endpoint:** `POST /api/v1/requests/create`  
**Request Body:**
```json
{
  "customerId": "cust-001",
  "pickupLocation": {
    "lat": 13.0827,
    "lng": 80.2707
  },
  "vehicleType": "TWO_WHEELER",
  "issueType": "PUNCTURE",
  "notes": "Flat rear tyre outside Central Station"
}
```

```bash
curl -X POST "http://localhost:3000/api/v1/requests/create" \
  -H "Content-Type: application/json" \
  -d '{"customerId":"cust-001","pickupLocation":{"lat":13.0827,"lng":80.2707},"vehicleType":"TWO_WHEELER","issueType":"PUNCTURE"}'
```

---

### 3. Mechanic Accepts Request (Concurrency Locked + OTP Generated)
**Endpoint:** `POST /api/v1/requests/:id/accept`  
**Request Body:**
```json
{
  "mechanicId": "mech-001"
}
```

```bash
curl -X POST "http://localhost:3000/api/v1/requests/YOUR_REQUEST_ID/accept" \
  -H "Content-Type: application/json" \
  -d '{"mechanicId":"mech-001"}'
```

---

### 4. Verify 4-Digit OTP on Arrival (Handoff Completion)
**Endpoint:** `POST /api/v1/requests/:id/verify-otp`  
**Request Body:**
```json
{
  "otp": "4829",
  "mechanicId": "mech-001"
}
```

```bash
curl -X POST "http://localhost:3000/api/v1/requests/YOUR_REQUEST_ID/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"otp":"4829","mechanicId":"mech-001"}'
```

---

### 5. Update Mechanic Live GPS Coordinates
**Endpoint:** `PATCH /api/v1/mechanics/location`  
**Request Body:**
```json
{
  "mechanicId": "mech-001",
  "lat": 13.0425,
  "lng": 80.2350
}
```

```bash
curl -X PATCH "http://localhost:3000/api/v1/mechanics/location" \
  -H "Content-Type: application/json" \
  -d '{"mechanicId":"mech-001","lat":13.0425,"lng":80.2350}'
```

---

## 📂 Project Structure

```
backend/
├── dist/                  # Compiled JavaScript artifacts
├── src/
│   ├── @types / types/
│   │   └── index.ts       # User, MechanicProfile, AssistanceRequest, etc.
│   ├── db/
│   │   └── mockStore.ts   # In-memory store seeded with 5 Chennai mechanics
│   ├── utils/
│   │   ├── haversine.ts   # Great-circle distance & ETA calculator
│   │   ├── feeCalculator.ts # Vehicle & issue base fee calculator
│   │   ├── otp.ts         # Secure 4-digit OTP generator
│   │   └── errors.ts      # AppError, NotFoundError, ConflictError, etc.
│   ├── middlewares/
│   │   ├── validate.ts    # Zod body & query validation middleware
│   │   └── errorHandler.ts# Centralized error handler & 404 handler
│   ├── services/
│   │   ├── mechanicService.ts # Proximity query & location updates
│   │   └── dispatchService.ts # Core dispatch, booking lifecycle & OTP
│   ├── controllers/
│   │   ├── mechanicController.ts
│   │   └── requestController.ts
│   ├── routes/
│   │   ├── mechanicRoutes.ts
│   │   ├── requestRoutes.ts
│   │   └── index.ts
│   ├── test/
│   │   └── integrationTest.ts # Automated end-to-end test suite
│   ├── app.ts             # Express app config
│   └── server.ts          # Server entrypoint
├── package.json
└── tsconfig.json
```
