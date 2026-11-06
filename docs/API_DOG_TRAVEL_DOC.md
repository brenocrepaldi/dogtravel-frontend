# DogTravel — API Documentation

> **Base URL:** `http://localhost:3001/api` (configurable via `NEXT_PUBLIC_API_URL`)
> **Authentication:** Bearer JWT (`Authorization: Bearer <accessToken>`)
> **Content-Type:** `application/json`
> **Session strategy:** JWT — 30-day maxAge via NextAuth.js

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Dashboard](#2-dashboard)
3. [Walk Request Flow (Client)](#3-walk-request-flow-client)
4. [Walk Acceptance & Execution (Walker)](#4-walk-acceptance--execution-walker)
5. [Location & Live Tracking](#5-location--live-tracking)
6. [Chat](#6-chat)
7. [Payments](#7-payments)
8. [Reviews](#8-reviews)
9. [My Walks](#9-my-walks)
10. [My Dogs (Client)](#10-my-dogs-client)
11. [Client Profile](#11-client-profile)
12. [Walker Profile, Documents & Payments](#12-walker-profile-documents--payments)
13. [Walkers Explorer (Client)](#13-walkers-explorer-client)
14. [Inferred Routes](#14-inferred-routes)
15. [Route Summary](#15-route-summary)
16. [External API Dependencies](#16-external-api-dependencies)

---

## 1. Authentication

> **Profiles:** Client | Walker

---

### POST /auth/register

**Description:** Creates a new user account (client or walker). On success, the frontend immediately performs an auto-login via NextAuth credentials.

**Authentication:** Not required

**Profile:** Client | Walker

#### Request Body

| Field    | Type                    | Required | Description                        |
|----------|-------------------------|----------|------------------------------------|
| name     | string                  | ✅        | Full name (min 2 characters)        |
| email    | string                  | ✅        | Valid e-mail address                |
| cpf      | string                  | ✅        | Brazilian CPF, format `000.000.000-00` |
| phone    | string                  | ✅        | Phone in E.164 format (min 10 chars) |
| password | string                  | ✅        | Password (min 6 characters)         |
| role     | `"client"` \| `"walker"` | ✅        | Account type                        |

**Example Request:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "cpf": "123.456.789-00",
  "phone": "+5511999999999",
  "password": "minhasenha123",
  "role": "client"
}
```

#### Response — 201 Created
```json
{}
```
> Returns empty body on success. Frontend auto-logins via NextAuth credentials callback after registration.

#### Response — 400 Bad Request
```json
{
  "error": "VALIDATION_ERROR",
  "message": "CPF inválido ou e-mail já cadastrado."
}
```

#### Response — 409 Conflict
```json
{
  "error": "EMAIL_ALREADY_EXISTS",
  "message": "Este e-mail já está em uso."
}
```

---

### POST /auth/login

**Description:** Authenticates a user (client or walker) with email and password. Called server-side by NextAuth's `authorize` callback via raw `fetch`. Returns tokens and user data.

**Authentication:** Not required

**Profile:** Client | Walker

#### Request Body

| Field    | Type   | Required | Description           |
|----------|--------|----------|-----------------------|
| email    | string | ✅        | Registered e-mail     |
| password | string | ✅        | Account password (min 6 characters) |

**Example Request:**
```json
{
  "email": "joao@email.com",
  "password": "minhasenha123"
}
```

#### Response — 200 OK
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "user": {
    "id": "uuid-1234",
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "+5511999999999",
    "avatarUrl": "https://cdn.example.com/avatars/uuid-1234.jpg",
    "role": "client",
    "rating": 4.8,
    "totalReviews": 12,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Response — 401 Unauthorized
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "E-mail ou senha inválidos."
}
```

> **Note:** The frontend uses NextAuth.js `signIn("credentials", ...)` which calls this endpoint internally. The `accessToken` is stored in the JWT session and injected as `Authorization: Bearer <token>` header by the Axios interceptor in all subsequent requests. On any `401` response from the API, the Axios interceptor automatically redirects to `/login`.

---

### POST /auth/refresh

**Description:** Issues a new `accessToken` (and optionally a new `refreshToken`) using a valid refresh token.

**Authentication:** Not required (uses refresh token in body)

**Profile:** Client | Walker

#### Request Body

| Field        | Type   | Required | Description                   |
|--------------|--------|----------|-------------------------------|
| refreshToken | string | ✅        | Valid refresh token from login |

**Example Request:**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

#### Response — 200 OK
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "bmV3UmVmcmVzaFRva2Vu...",
  "user": {
    "id": "uuid-1234",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "client",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Response — 401 Unauthorized
```json
{
  "error": "INVALID_REFRESH_TOKEN",
  "message": "Token de atualização inválido ou expirado."
}
```

---

### POST /auth/forgot-password

**Description:** Triggers the password recovery flow. If the provided e-mail is registered, the backend sends a reset link. Always returns 200 to avoid user enumeration.

**Authentication:** Not required

**Profile:** Client | Walker

#### Request Body

| Field | Type   | Required | Description              |
|-------|--------|----------|--------------------------|
| email | string | ✅        | E-mail address to recover |

**Example Request:**
```json
{
  "email": "joao@email.com"
}
```

#### Response — 200 OK
```json
{}
```
> Always returns 200 regardless of whether the e-mail is registered (prevents user enumeration).

---

### POST /auth/reset-password

**Description:** Resets the user's password using a time-limited token delivered by e-mail. The token is expected as a query parameter in the reset link (`/reset-password?token=<token>`).

**Authentication:** Not required (uses one-time reset token in body)

**Profile:** Client | Walker

#### Request Body

| Field    | Type   | Required | Description                              |
|----------|--------|----------|------------------------------------------|
| token    | string | ✅        | One-time reset token from the e-mail link |
| password | string | ✅        | New password (min 6 characters)           |

**Example Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "password": "novaSenha123"
}
```

#### Response — 200 OK
```json
{}
```

#### Response — 400 Bad Request
```json
{
  "error": "INVALID_OR_EXPIRED_TOKEN",
  "message": "Link de recuperação inválido ou expirado."
}
```

> **Frontend flow:** `/forgot-password` → user submits e-mail → backend sends link → user clicks link → `/reset-password?token=<token>` → user enters new password → redirect to `/login`.

---

### NextAuth Internal Routes (managed by NextAuth.js)

These routes are automatically handled by the `/app/api/auth/[...nextauth]/route.ts` handler and are part of the NextAuth.js session management layer — not direct backend API calls.

| Method | Path                               | Description                                      |
|--------|------------------------------------|--------------------------------------------------|
| GET    | `/api/auth/session`                | Returns current session (user, role, token)     |
| POST   | `/api/auth/session`                | Internal session update                          |
| GET    | `/api/auth/csrf`                   | Returns CSRF token for form submissions          |
| GET    | `/api/auth/providers`              | Lists available auth providers                   |
| POST   | `/api/auth/callback/credentials`   | Processes credentials login (calls backend login)|
| POST   | `/api/auth/signout`                | Signs out user, clears JWT session               |
| GET    | `/api/auth/signout`                | Sign-out confirmation page                       |

> **Session Structure returned by GET /api/auth/session:**
> ```json
> {
>   "user": {
>     "id": "uuid-1234",
>     "name": "João Silva",
>     "email": "joao@email.com",
>     "role": "client",
>     "image": null
>   },
>   "expires": "2026-06-24T10:00:00Z",
>   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
> }
> ```

---

### Route Protection Rules (Middleware)

The app enforces authentication and role-based access control via `middleware.ts`:

| Route Prefix                  | Rule                                                        |
|-------------------------------|-------------------------------------------------------------|
| `/`, `/login`, `/register`    | Public — no auth required                                   |
| `/api/auth/*`                 | Public — NextAuth internal                                  |
| `/dashboard`                  | Requires authenticated session                              |
| `/walks/*`                    | Requires authenticated session                              |
| `/dogs/*`                     | Requires `role === "client"`                                |
| `/walkers/*`                  | Requires `role === "client"`                                |
| `/walks/new`                  | Requires `role === "client"`                                |
| `/payments/*`                 | Requires authenticated session                              |
| `/profile/*`                  | Requires authenticated session                              |

> Unauthenticated users are redirected to `/login?callbackUrl=<originalPath>`. Walker users attempting client-only routes are redirected to `/dashboard`. Already logged-in users accessing `/login` or `/register` are redirected to `/dashboard`.

---

## 2. Dashboard

> **Profiles:** Client | Walker

The dashboard aggregates data from several domains (stats, walks, dogs, documents). Each endpoint is fully documented in its own section; here each is listed with a cross-reference.

---

### GET /me/stats

**Description:** Returns cumulative statistics for the authenticated client.

**Authentication:** Required — Bearer token

**Profile:** Client

#### Response — 200 OK
```json
{
  "totalWalks": 24,
  "rating": 4.8,
  "totalReviews": 12
}
```

| Field        | Type   | Description                        |
|--------------|--------|------------------------------------|
| totalWalks   | number | Total walks requested by the client |
| rating       | number | Client average rating (1.0–5.0)    |
| totalReviews | number | Total reviews received             |

---

### GET /walkers/me/stats

**Description:** Returns performance and earnings statistics for the authenticated walker.

**Authentication:** Required — Bearer token

**Profile:** Walker

#### Response — 200 OK
```json
{
  "totalWalks": 87,
  "walksThisMonth": 14,
  "rating": 4.9,
  "totalReviews": 61,
  "earningsToday": 120.00,
  "earningsMonth": 1540.00
}
```

| Field          | Type   | Description                              |
|----------------|--------|------------------------------------------|
| totalWalks     | number | Total walks completed                    |
| walksThisMonth | number | Walks completed in the current month     |
| rating         | number | Walker average rating (1.0–5.0)          |
| totalReviews   | number | Total reviews received                   |
| earningsToday  | number | Earnings today (BRL)                     |
| earningsMonth  | number | Earnings in the current month (BRL)      |

---

### GET /walks

**Description:** Lists walks for the authenticated user, filtered by role. Used on dashboards to show recent and active walks.

**Authentication:** Required — Bearer token

**Profile:** Client | Walker

#### Query Parameters

| Param    | Type                    | Required | Description                                 |
|----------|-------------------------|----------|---------------------------------------------|
| role     | `"client"` \| `"walker"` | ✅        | Filters walks for the requesting role       |
| walkerId | string (UUID)           | ❌        | Required when `role = "walker"` to scope results |

**Example Request:**
```
GET /walks?role=client
GET /walks?role=walker&walkerId=uuid-walker-1
```

#### Response — 200 OK
```json
[
  {
    "id": "walk-001",
    "walkerId": "uuid-walker-1",
    "clientName": "João Silva",
    "petNames": ["Rex", "Luna"],
    "status": "completed",
    "dateLabel": "Hoje, 14:00",
    "scheduledAt": "2026-05-25T14:00:00Z",
    "durationMinutes": 30,
    "price": 45.00,
    "distanceKm": 2.4,
    "startAddress": "Rua das Flores, 123",
    "endAddress": "Av. Paulista, 456",
    "notes": "Rex é agitado com outros cães",
    "paymentMethodId": "pm-001",
    "startCode": "4821",
    "startLat": -23.561,
    "startLng": -46.655,
    "participants": [
      { "id": "client_1", "name": "João Silva", "role": "client", "phone": "+5511999999999" },
      { "id": "uuid-walker-1", "name": "Carlos Silva", "role": "walker", "phone": "+5511888888888" }
    ],
    "timeline": [
      { "id": "t1", "label": "Pedido aceito", "at": "13:45", "state": "done" },
      { "id": "t2", "label": "Passeio iniciado", "at": "14:02", "state": "done" },
      { "id": "t3", "label": "Passeio concluído", "at": "14:33", "state": "done", "note": "Ótimo comportamento" }
    ]
  }
]
```

**WalkRecord Object:**

| Field           | Type                                                         | Description                              |
|-----------------|--------------------------------------------------------------|------------------------------------------|
| id              | string                                                       | Unique walk ID                           |
| walkerId        | string                                                       | Walker's user ID                         |
| clientName      | string                                                       | Client's display name                    |
| petNames        | string[]                                                     | Names of pets on this walk               |
| status          | `"pending"` \| `"accepted"` \| `"in_progress"` \| `"completed"` \| `"cancelled"` | Walk status |
| dateLabel       | string                                                       | Human-readable date string               |
| scheduledAt     | string (ISO 8601)                                            | Scheduled start time                     |
| durationMinutes | number                                                       | Planned duration in minutes              |
| price           | number                                                       | Walk price in BRL                        |
| distanceKm      | number                                                       | Distance covered (km)                    |
| startAddress    | string                                                       | Starting address                         |
| endAddress      | string \| undefined                                          | End address (optional)                   |
| notes           | string \| undefined                                          | Notes about the walk                     |
| paymentMethodId | string \| undefined                                          | Payment method used                      |
| startCode       | string \| undefined                                          | 4-digit code to confirm walk start       |
| startLat        | number \| undefined                                          | Start latitude                           |
| startLng        | number \| undefined                                          | Start longitude                          |
| participants    | WalkParticipant[]                                            | Client and walker participant info       |
| timeline        | WalkTimelineEvent[]                                          | Walk timeline events                     |

---

### GET /walk-requests

**Description:** Lists pending walk requests waiting for a walker to accept. Used on the walker dashboard's "Pedidos recebidos" section.

**Authentication:** Required — Bearer token

**Profile:** Walker

#### Response — 200 OK
```json
[
  {
    "id": "req-001",
    "clientId": "client_1",
    "clientName": "João Silva",
    "petNames": ["Rex"],
    "petIds": ["pet-001"],
    "durationMinutes": 30,
    "price": 45.00,
    "scheduledAt": "2026-05-25T16:00:00Z",
    "scheduledLabel": "Hoje, 16:00",
    "startAddress": "Rua das Flores, 123",
    "receivedMinutes": 3
  }
]
```

| Field          | Type      | Description                                         |
|----------------|-----------|-----------------------------------------------------|
| id             | string    | Request ID                                          |
| clientId       | string    | Client's user ID                                    |
| clientName     | string    | Client's display name                               |
| petNames       | string[]  | Names of pets to be walked                          |
| petIds         | string[]  | IDs of pets to be walked                            |
| durationMinutes| number    | Requested duration in minutes                       |
| price          | number    | Offered price in BRL                                |
| scheduledAt    | string    | ISO 8601 date/time                                  |
| scheduledLabel | string    | Human-readable date/time label                      |
| startAddress   | string    | Pick-up address                                     |
| receivedMinutes| number    | Minutes since request was received                  |

---

### GET /walkers/{walkerId}/availability

**Description:** Returns whether a walker is currently marked as available to receive walk requests.

**Authentication:** Required — Bearer token

**Profile:** Walker

#### Path Parameters

| Param    | Type   | Required | Description       |
|----------|--------|----------|-------------------|
| walkerId | string | ✅        | Walker's user ID  |

#### Response — 200 OK
```json
{
  "available": true
}
```

---

### PATCH /walkers/{walkerId}/availability

**Description:** Toggles the walker's availability to receive new walk requests. Requires the walker to have a profile photo, verified identity document, and verified background check — these gates are enforced on the frontend before calling this endpoint.

**Authentication:** Required — Bearer token

**Profile:** Walker

#### Path Parameters

| Param    | Type   | Required | Description       |
|----------|--------|----------|-------------------|
| walkerId | string | ✅        | Walker's user ID  |

#### Request Body

| Field     | Type    | Required | Description                                |
|-----------|---------|----------|--------------------------------------------|
| available | boolean | ✅        | New availability state (`true` or `false`) |

**Example Request:**
```json
{
  "available": true
}
```

#### Response — 200 OK
```json
{}
```

#### Response — 403 Forbidden
```json
{
  "error": "ONBOARDING_INCOMPLETE",
  "message": "O passeador precisa ter foto de perfil, identidade verificada e antecedentes criminais aprovados."
}
```

---

> **Dashboard also uses:**
> - `GET /dogs` → see [Section 10 — My Dogs](#10-my-dogs-client)
> - `GET /profile` → see [Section 11 — Client Profile](#11-client-profile)
> - `GET /profile/documents` → see [Section 12 — Walker Documents](#12-walker-profile-documents--payments)

---

## 3. Walk Request Flow (Client)

> **Profile:** Client only (walker attempts are redirected to `/dashboard` by middleware)

The walk request is a 6-step wizard. Steps 1–5 collect data and step 6 submits the walk to the backend.

| Step | Label               | API Calls                                                                        |
|------|---------------------|----------------------------------------------------------------------------------|
| 1    | Seus cães           | `GET /dogs` (lists client's pets for selection)                                  |
| 2    | Data e horário      | None (local form)                                                                |
| 3    | Local de partida    | Nominatim reverse geocode + forward geocode (external — see Section 16)          |
| 4    | Estimativa de preço | `POST /walks/estimate` (server-side pricing breakdown)                           |
| 5    | Forma de pagamento  | `GET /payment-methods` (saved methods) + `POST /payment-methods` ("Add card" dialog) |
| 6    | Confirmar pedido    | `POST /walks`                                                                    |

> **Note:** The `repeat` query param (`/walks/new?repeat=<walkId>`) prefills the form with data from a previous walk via `GET /walks/{id}` (`useWalkById`). The confirmation step (step 6) resolves the selected payment method label via `GET /payment-methods`.

---

### POST /walks/estimate

**Description:** Returns a server-computed price breakdown for a walk given its duration, number of pets, and whether it is the client's first ride. Called in Step 4 of the walk request wizard. The total from this response is synced to form state and submitted as `price` in `POST /walks`.

**Authentication:** Required (Bearer JWT)

**Profile:** Client

#### Request Body

| Field           | Type    | Required | Description                                              |
|-----------------|---------|----------|----------------------------------------------------------|
| durationMinutes | number  | ✅        | Walk duration in minutes (15, 30, 45, or 60)             |
| petCount        | number  | ✅        | Number of pets to be walked (≥ 1)                        |
| isFirstRide     | boolean | ✅        | Whether this is the client's first walk on DogTravel     |

**Example Request:**
```json
{
  "durationMinutes": 30,
  "petCount": 2,
  "isFirstRide": false
}
```

#### Response — 200 OK

```json
{
  "durationBase": 18.00,
  "extraPetFee": 4.00,
  "platformAndSafetyFee": 1.76,
  "firstRideDiscount": 0.00,
  "total": 23.76
}
```

| Field                | Type   | Description                                                        |
|----------------------|--------|--------------------------------------------------------------------|
| durationBase         | number | Base price for the selected duration in BRL                        |
| extraPetFee          | number | Additional fee for each extra pet beyond the first (in BRL)        |
| platformAndSafetyFee | number | Platform + safety fee (8% of subtotal) in BRL                      |
| firstRideDiscount    | number | First-ride discount (15% of subtotal), positive value if applied   |
| total                | number | Final amount to be charged, in BRL                                 |

#### Response — 400 Bad Request

```json
{ "message": "durationMinutes must be one of: 15, 30, 45, 60" }
```

**Source:** `src/features/walks/api/walks.api.ts` — `WalksApi.estimate()` · `src/features/walks/hooks/use-walks.ts` — `useWalkEstimate()` · `src/app/walks/new/_components/steps/step-price.tsx`

---

### GET /payment-methods

**Description:** Returns all saved payment methods for the authenticated user (credit card, debit card, PIX). Used in Step 5 of the walk request wizard and on the payments management screen.

**Authentication:** Required — Bearer token

**Profile:** Client | Walker

#### Response — 200 OK
```json
[
  {
    "id": "pm_001",
    "type": "credit_card",
    "brand": "Visa",
    "label": "**** 4242",
    "holderName": "João Silva",
    "expiresAt": "12/29",
    "isDefault": true,
    "status": "active"
  },
  {
    "id": "pix_instant",
    "type": "pix",
    "brand": "PIX",
    "label": "pagamentos@dogtravel.com.br",
    "holderName": "João Silva",
    "expiresAt": "--",
    "isDefault": false,
    "status": "active"
  }
]
```

**ManagedPaymentMethod Object:**

| Field      | Type                                      | Description                                      |
|------------|-------------------------------------------|--------------------------------------------------|
| id         | string                                    | Unique payment method ID                         |
| type       | `"credit_card"` \| `"debit_card"` \| `"pix"` | Payment type                                 |
| brand      | string                                    | Card brand (e.g., `"Visa"`) or `"PIX"`          |
| label      | string                                    | Display label (`"**** 4242"` or PIX key)         |
| holderName | string                                    | Account holder name                              |
| expiresAt  | string                                    | Card expiry (`"MM/YY"`) or `"--"` for PIX        |
| isDefault  | boolean                                   | Whether this is the default payment method       |
| status     | `"active"` \| `"expired"`                 | Method status                                    |

---

### POST /walks

**Description:** Creates a new walk request. The request enters `"pending"` status until a walker accepts it.

**Authentication:** Required — Bearer token

**Profile:** Client

#### Request Body

> The client sends only the fields it knows. The backend derives `id`, `status`, `clientName`, `dateLabel`, `distanceKm`, `participants`, and `timeline` from the JWT session and its own state.

| Field           | Type              | Required | Description                                                     |
|-----------------|-------------------|----------|-----------------------------------------------------------------|
| petIds          | string[]          | ✅        | IDs of the pets to be walked                                    |
| petNames        | string[]          | ✅        | Display names of the pets (derived by backend from `petIds`)    |
| scheduledAt     | string (ISO 8601) | ✅        | Scheduled start datetime                                        |
| durationMinutes | number            | ✅        | Walk duration in minutes (15, 30, 45, or 60)                    |
| price           | number            | ✅        | Price shown to the client at checkout (BRL); backend validates  |
| startAddress    | string            | ✅        | Starting address text                                           |
| paymentMethodId | string            | ✅        | ID of the selected payment method                               |
| walkerId        | string            | ❌        | Pre-selected walker ID (omit if not pre-assigned)               |
| lat             | number            | ❌        | Start latitude from geocoding                                   |
| lng             | number            | ❌        | Start longitude from geocoding                                  |
| notes           | string            | ❌        | Optional notes for the walker                                   |

**Example Request:**
```json
{
  "petIds": ["pet-001", "pet-002"],
  "petNames": ["Rex", "Mel"],
  "scheduledAt": "2026-05-25T14:00:00.000Z",
  "durationMinutes": 30,
  "price": 44.50,
  "startAddress": "Rua das Flores, 123 - São Paulo",
  "paymentMethodId": "pm_001",
  "lat": -23.561,
  "lng": -46.655,
  "notes": "Rex puxa muito a coleira"
}
```

#### Response — 201 Created

Returns the full `WalkRecord` as created by the backend, with all server-generated fields populated.

```json
{
  "id": "walk-uuid-001",
  "walkerId": null,
  "clientName": "João Silva",
  "petIds": ["pet-001", "pet-002"],
  "petNames": ["Rex", "Mel"],
  "status": "pending",
  "dateLabel": "25 mai., 14:00",
  "scheduledAt": "2026-05-25T14:00:00.000Z",
  "durationMinutes": 30,
  "price": 44.50,
  "distanceKm": 0,
  "startAddress": "Rua das Flores, 123 - São Paulo",
  "startLat": -23.561,
  "startLng": -46.655,
  "paymentMethodId": "pm_001",
  "participants": [],
  "timeline": [
    { "id": "ev-1", "label": "Pedido criado", "at": "10:00", "state": "done" },
    { "id": "ev-2", "label": "Aguardando passeador", "at": "14:00", "state": "pending" }
  ]
}
```

#### Response — 400 Bad Request
```json
{
  "error": "INVALID_PAYMENT_METHOD",
  "message": "Método de pagamento inválido ou inativo."
}
```

---

### Pricing Rules (Client-Side Calculation)

> **Note:** Price estimation is currently calculated entirely on the frontend. The comment in the source code indicates this will be served by a backend configuration/pricing API endpoint in the future.

**Formula:**

```
durationBase     = DURATION_BASE_PRICE[durationMinutes]
extraPetFee      = max(0, petCount - 1) × 4.00
subtotal         = durationBase + extraPetFee
platformFee      = subtotal × 0.08 (8% platform & safety fee)
totalBeforeDisc  = subtotal + platformFee
firstRideDisc    = isFirstRide ? totalBeforeDisc × 0.15 : 0
total            = totalBeforeDisc - firstRideDisc
```

**Duration Base Prices (BRL):**

| Duration  | Base Price |
|-----------|-----------|
| 15 min    | R$ 12,00  |
| 30 min    | R$ 18,00  |
| 45 min    | R$ 24,00  |
| 60 min    | R$ 27,00  |

**Fees:**
- Extra pet fee: R$ 4,00 per additional dog (beyond the first)
- Platform & safety fee: 8% over subtotal
- First ride discount: 15% off the total (applied once per client)

**Example — 30 min, 2 dogs, first ride:**
```
durationBase = 18.00
extraPetFee  =  4.00
subtotal     = 22.00
platformFee  =  1.76  (22.00 × 0.08)
total before = 23.76
firstRideDisc=  3.56  (23.76 × 0.15)
total        = 20.20
```

---

### PIX Payment Flow

When the client selects PIX as payment method, after `POST /walks` succeeds, the frontend displays a QR Code screen (mocked SVG) with the PIX key `pagamentos@dogtravel.com.br`. The walk is created immediately — payment processing happens asynchronously.

> **Inferred endpoint:** `POST /payments/pix/confirm` — the backend likely needs a confirmation webhook or polling endpoint to detect PIX payment completion. See [Section 14 — Inferred Routes](#14-inferred-routes).

---

### PATCH /walks/{id}/cancel

**Description:** Cancels a walk. Status transitions from `"pending"` or `"accepted"` to `"cancelled"`.

**Authentication:** Required — Bearer token

**Profile:** Client

#### Path Parameters

| Param | Type   | Required | Description |
|-------|--------|----------|-------------|
| id    | string | ✅        | Walk ID     |

#### Response — 200 OK
```json
{}
```

#### Response — 404 Not Found
```json
{
  "error": "WALK_NOT_FOUND",
  "message": "Passeio não encontrado."
}
```

---

### POST /walks/{id}/report

**Description:** Submits a problem report for a specific walk (e.g., walker behaviour, safety concern). Available to both client and walker after a walk has been accepted or completed.

**Authentication:** Required — Bearer token

**Profile:** Client | Walker

#### Path Parameters

| Param | Type   | Required | Description |
|-------|--------|----------|-------------|
| id    | string | ✅        | Walk ID     |

#### Request Body

| Field       | Type   | Required | Description                                                                 |
|-------------|--------|----------|-----------------------------------------------------------------------------|
| reason      | string | ✅        | Report category (e.g. `"walker_no_show"`, `"safety_concern"`, `"other"`)   |
| description | string | ❌        | Free-text description of the problem (max 1000 characters)                  |

**Example Request:**
```json
{
  "reason": "safety_concern",
  "description": "O passeador não apareceu no horário combinado e não respondeu mensagens."
}
```

#### Response — 201 Created
```json
{}
```

#### Response — 404 Not Found
```json
{
  "error": "WALK_NOT_FOUND",
  "message": "Passeio não encontrado."
}
```

**Source:** `src/features/walks/api/walks.api.ts` — `WalksApi.report()` · `src/features/walks/hooks/use-walk-actions.ts` — `useReportWalk()`

---

## 4. Walk Acceptance & Execution (Walker)

> **Profile:** Walker

---

### GET /walks/{id}

**Description:** Returns full details of a specific walk. Used on the walk detail page by both client and walker.

**Authentication:** Required — Bearer token

**Profile:** Client | Walker

#### Path Parameters

| Param | Type   | Required | Description |
|-------|--------|----------|-------------|
| id    | string | ✅        | Walk ID     |

#### Response — 200 OK

Returns a `WalkRecord` object (full schema documented in [Section 2 — GET /walks](#get-walks)).

#### Response — 404 Not Found
```json
{
  "error": "WALK_NOT_FOUND",
  "message": "Passeio não encontrado."
}
```

---

### POST /walk-requests/{id}/accept

**Description:** Walker accepts a pending walk request. The request is removed from the queue, a new `WalkRecord` is created with status `"accepted"`, and a 4-digit `startCode` is generated and attached to the walk (displayed to the client for verification at walk start).

**Authentication:** Required — Bearer token

**Profile:** Walker

#### Path Parameters

| Param | Type   | Required | Description        |
|-------|--------|----------|--------------------|
| id    | string | ✅        | Walk request ID    |

#### Request Body

None — the request body is empty. Walker identity is inferred from the Bearer token.

#### Response — 201 Created

Returns the newly created `WalkRecord`:

```json
{
  "id": "accepted-req-001",
  "walkerId": "uuid-walker-1",
  "clientName": "Ana Silva",
  "petNames": ["Rex"],
  "status": "accepted",
  "dateLabel": "Hoje às 15:00",
  "scheduledAt": "2026-05-25T15:00:00-03:00",
  "durationMinutes": 30,
  "price": 44.00,
  "distanceKm": 0,
  "startAddress": "Rua das Flores, 120 - São Paulo",
  "startCode": "4821",
  "participants": [
    { "id": "client_2", "name": "Ana Silva", "role": "client" },
    { "id": "uuid-walker-1", "name": "Carlos Silva", "role": "walker" }
  ],
  "timeline": [
    { "id": "t1", "label": "Pedido aceito", "at": "13:45", "state": "done" },
    { "id": "t2", "label": "Aguardando passeio", "at": "Hoje às 15:00", "state": "current" },
    { "id": "t3", "label": "Passeio em andamento", "at": "--", "state": "pending" },
    { "id": "t4", "label": "Passeio concluído", "at": "--", "state": "pending" }
  ]
}
```

> **Note:** The `startCode` field contains a 4-digit numeric string shown exclusively to the client. The walker must enter this code when initiating the walk via `PATCH /walks/{id}/start`.

#### Response — 404 Not Found
```json
{
  "error": "REQUEST_NOT_FOUND",
  "message": "Pedido de passeio não encontrado."
}
```

#### Response — 409 Conflict
```json
{
  "error": "REQUEST_ALREADY_CLAIMED",
  "message": "Este pedido já foi aceito por outro passeador."
}
```

---

### POST /walk-requests/{id}/decline

**Description:** Walker declines a pending walk request, returning it to the queue for other walkers.

**Authentication:** Required — Bearer token

**Profile:** Walker

#### Path Parameters

| Param | Type   | Required | Description      |
|-------|--------|----------|------------------|
| id    | string | ✅        | Walk request ID  |

#### Request Body

None.

#### Response — 200 OK
```json
{}
```

---

### PATCH /walks/{id}/start

**Description:** Walker initiates the walk by submitting the 4-digit verification code obtained from the client. Validates the code, transitions the walk status from `"accepted"` to `"in_progress"`, and advances the timeline. After success, the walker is redirected to the live tracking screen.

**Authentication:** Required — Bearer token

**Profile:** Walker

#### Path Parameters

| Param | Type   | Required | Description |
|-------|--------|----------|-------------|
| id    | string | ✅        | Walk ID     |

#### Request Body

| Field | Type   | Required | Description                                  |
|-------|--------|----------|----------------------------------------------|
| code  | string | ✅        | 4-digit verification code provided by client |

**Example Request:**
```json
{
  "code": "4821"
}
```

#### Response — 200 OK

Returns the updated `WalkRecord` with `status: "in_progress"` and advanced timeline:

```json
{
  "id": "accepted-req-001",
  "status": "in_progress",
  "timeline": [
    { "id": "t1", "label": "Pedido aceito", "at": "13:45", "state": "done" },
    { "id": "t2", "label": "Aguardando passeio", "at": "Hoje às 15:00", "state": "done" },
    { "id": "t3", "label": "Passeio em andamento", "at": "15:03", "state": "current" },
    { "id": "t4", "label": "Passeio concluído", "at": "--", "state": "pending" }
  ]
}
```

#### Response — 400 Bad Request
```json
{
  "error": "INVALID_CODE",
  "message": "Código de verificação inválido."
}
```

#### Response — 403 Forbidden (too early)
```json
{
  "error": "START_WINDOW_NOT_OPEN",
  "message": "O passeio só pode ser iniciado até 15 minutos antes do horário agendado."
}
```

#### Response — 404 Not Found
```json
{
  "error": "WALK_NOT_FOUND",
  "message": "Passeio não encontrado."
}
```

> **Business Rules for Walk Start:**
> - The Start button is only enabled **15 minutes before** the scheduled time
> - The walker must be within **300 meters** of the start location (geofence validated client-side via browser Geolocation API; in development mode this check is skipped)
> - Maximum **3 code attempts**; after exceeding, a **2-minute lockout** is applied (enforced client-side — the backend should also track this per walk/session)
> - After a successful start, the walker is redirected to `/walks/{id}/tracking`
> - The client is notified of the start

---

## 5. Location & Live Tracking

> **Profile:** Client | Walker
>
> **Map:** Mapbox GL JS (`react-map-gl/mapbox`), requires `NEXT_PUBLIC_MAPBOX_TOKEN`.
>
> **Current implementation:** HTTP polling every 5 seconds. The source code includes the comment "replace with WebSocket subscription when available" — the API should be designed with WebSocket support in mind.

---

### GET /walks/{id}/location

**Description:** Returns the current GPS position of the walker for an active walk. Polled every 5 seconds by the client's live tracking map.

**Authentication:** Required — Bearer token

**Profile:** Client | Walker

#### Path Parameters

| Param | Type   | Required | Description |
|-------|--------|----------|-------------|
| id    | string | ✅        | Walk ID     |

#### Response — 200 OK
```json
{
  "walkId": "walk-001",
  "lat": -23.5505,
  "lng": -46.6333,
  "updatedAt": "2026-05-25T15:03:47Z"
}
```

| Field     | Type   | Description                                  |
|-----------|--------|----------------------------------------------|
| walkId    | string | Walk ID                                      |
| lat       | number | Walker's current latitude                    |
| lng       | number | Walker's current longitude                   |
| updatedAt | string | ISO 8601 timestamp of the last GPS update    |

#### Response — 404 Not Found
```json
null
```
> Returns `null` (or empty body) when no location data exists yet.

---

### PATCH /walks/{id}/location

**Description:** Walker updates their current GPS position. Called periodically by the walker's device during an active walk to broadcast their location to the client.

**Authentication:** Required — Bearer token

**Profile:** Walker

#### Path Parameters

| Param | Type   | Required | Description |
|-------|--------|----------|-------------|
| id    | string | ✅        | Walk ID     |

#### Request Body

| Field | Type   | Required | Description              |
|-------|--------|----------|--------------------------|
| lat   | number | ✅        | Walker's current latitude |
| lng   | number | ✅        | Walker's current longitude|

**Example Request:**
```json
{
  "lat": -23.5512,
  "lng": -46.6340
}
```

#### Response — 200 OK
```json
{}
```

#### Response — 403 Forbidden
```json
{
  "error": "NOT_AUTHORIZED",
  "message": "Apenas o passeador atribuído pode atualizar a localização."
}
```

---

### GET /walks/{id}/route

**Description:** Returns the full recorded GPS trail for a walk (typically a completed one). Used to render the route polyline on the walk detail map.

**Authentication:** Required — Bearer token

**Profile:** Client | Walker

#### Path Parameters

| Param | Type   | Required | Description |
|-------|--------|----------|-------------|
| id    | string | ✅        | Walk ID     |

#### Response — 200 OK

Array of `[longitude, latitude]` coordinate pairs in chronological order:

```json
[
  [-46.6333, -23.5505],
  [-46.6340, -23.5512],
  [-46.6348, -23.5518],
  [-46.6356, -23.5526],
  [-46.6365, -23.5535]
]
```

> The coordinates are in `[longitude, latitude]` order (GeoJSON convention) as required by Mapbox GL JS `LineString`.

#### Response — 404 Not Found
```json
[]
```
> Returns empty array when no route data exists yet (walk not started or in progress).

---

## 6. Chat

> **Profile:** Client | Walker
>
> Chat is scoped to a walk (`/walks/{id}/chat`) and is accessible when the walk is in `"accepted"` or `"in_progress"` status.
>
> **Current implementation:** HTTP polling every 5 seconds. The source code includes the comment "replace with WebSocket subscription when available."

---

### GET /walks/{id}/messages

**Description:** Returns all chat messages for a specific walk, ordered chronologically. Polled every 5 seconds on the chat screen to simulate real-time delivery.

**Authentication:** Required — Bearer token

**Profile:** Client | Walker

#### Path Parameters

| Param | Type   | Required | Description |
|-------|--------|----------|-------------|
| id    | string | ✅        | Walk ID     |

#### Response — 200 OK
```json
[
  {
    "id": "msg-001",
    "senderId": "client_1",
    "text": "Oi, pode chegar um pouco mais cedo?",
    "sentAt": "2026-05-25T14:55:00Z",
    "read": true
  },
  {
    "id": "msg-002",
    "senderId": "uuid-walker-1",
    "text": "Claro! Estarei aí em 10 minutos.",
    "sentAt": "2026-05-25T14:56:12Z",
    "read": false
  }
]
```

**ChatMsg Object:**

| Field    | Type    | Description                                       |
|----------|---------|---------------------------------------------------|
| id       | string  | Unique message ID (UUID)                          |
| senderId | string  | User ID of the message sender                    |
| text     | string  | Message text content                              |
| sentAt   | string  | ISO 8601 timestamp                               |
| read     | boolean | Whether the recipient has read the message        |

---

### POST /walks/{id}/messages

**Description:** Sends a new text message in the walk chat. The frontend attaches the current user's ID as `senderId`.

**Authentication:** Required — Bearer token

**Profile:** Client | Walker

#### Path Parameters

| Param | Type   | Required | Description |
|-------|--------|----------|-------------|
| id    | string | ✅        | Walk ID     |

#### Request Body

| Field    | Type   | Required | Description                        |
|----------|--------|----------|------------------------------------|
| senderId | string | ✅        | Sender's user ID                   |
| text     | string | ✅        | Message text (non-empty)           |

**Example Request:**
```json
{
  "senderId": "client_1",
  "text": "O Rex está com a coleira azul hoje."
}
```

#### Response — 201 Created
```json
{
  "id": "msg-003",
  "senderId": "client_1",
  "text": "O Rex está com a coleira azul hoje.",
  "sentAt": "2026-05-25T14:57:30Z",
  "read": false
}
```

#### Response — 400 Bad Request
```json
{
  "error": "EMPTY_MESSAGE",
  "message": "A mensagem não pode estar vazia."
}
```

> **Note:** The UI includes an image upload button (📷) but it is not yet wired to an API call. See [Section 14 — Inferred Routes](#14-inferred-routes) for the media upload endpoint.

---

## 7. Payments

> **Profile:** Client | Walker

---

### GET /payment-history

**Description:** Returns the transaction/earnings history for the authenticated user. Clients see charges; walkers see earnings credited per completed walk. Supports optional date range and pagination filtering.

**Authentication:** Required — Bearer token

**Profile:** Client | Walker

**Query Parameters:**

| Parameter | Type   | Required | Description                       |
|-----------|--------|----------|-----------------------------------|
| from      | string | No       | Start date filter (`YYYY-MM-DD`)  |
| to        | string | No       | End date filter (`YYYY-MM-DD`)    |
| page      | number | No       | Page number (1-based)             |
| pageSize  | number | No       | Items per page                    |

**Source:** `src/features/payments/api/payments.api.ts` — `getHistory(params?)` accepts `EarningsParams` (`from?`, `to?`, `page?`, `pageSize?`)

#### Response — 200 OK
```json
[
  {
    "id": "ph-001",
    "walkId": "walk-001",
    "date": "2026-05-20",
    "amount": 44.50,
    "status": "paid",
    "methodId": "pm_001",
    "description": "Passeio com Rex — 30 min"
  },
  {
    "id": "ph-002",
    "walkId": "walk-002",
    "date": "2026-05-15",
    "amount": 60.00,
    "status": "pending",
    "methodId": "pm_001",
    "description": "Passeio com Mel & Bob — 45 min"
  }
]
```

**PaymentHistoryItem Object:**

| Field       | Type                                  | Description                              |
|-------------|---------------------------------------|------------------------------------------|
| id          | string                                | Unique record ID                         |
| walkId      | string                                | Associated walk ID                       |
| date        | string (`YYYY-MM-DD`)                 | Transaction date                         |
| amount      | number                                | Amount in BRL                            |
| status      | `"paid"` \| `"pending"` \| `"failed"` | Transaction status                       |
| methodId    | string                                | Payment method used                      |
| description | string                                | Human-readable description               |

---

### POST /payment-methods

**Description:** Adds a new payment method (credit card, debit card, or PIX key) to the user's account.

**Authentication:** Required — Bearer token

**Profile:** Client | Walker

#### Request Body

| Field      | Type                                          | Required | Description                                    |
|------------|-----------------------------------------------|----------|------------------------------------------------|
| type       | `"credit_card"` \| `"debit_card"` \| `"pix"` | ✅        | Payment type                                   |
| brand      | string                                        | ✅        | Card brand (e.g., `"Visa"`) or `"PIX"`        |
| label      | string                                        | ✅        | Display label (`"**** 4242"` or PIX key text) |
| holderName | string                                        | ✅        | Account holder name                            |
| expiresAt  | string                                        | ✅        | Expiry `"MM/YY"` or `"--"` for PIX            |
| isDefault  | boolean                                       | ✅        | Set as default method                          |
| status     | `"active"` \| `"expired"`                     | ✅        | Method status (always `"active"` on creation) |

**Example Request (credit card):**
```json
{
  "type": "credit_card",
  "brand": "Mastercard",
  "label": "**** 5555",
  "holderName": "João Silva",
  "expiresAt": "08/28",
  "isDefault": false,
  "status": "active"
}
```

**Example Request (PIX):**
```json
{
  "type": "pix",
  "brand": "PIX",
  "label": "joao@email.com",
  "holderName": "João Silva",
  "expiresAt": "--",
  "isDefault": false,
  "status": "active"
}
```

#### Response — 201 Created
```json
{
  "id": "pm_1748123456789",
  "type": "credit_card",
  "brand": "Mastercard",
  "label": "**** 5555",
  "holderName": "João Silva",
  "expiresAt": "08/28",
  "isDefault": false,
  "status": "active"
}
```

---

### DELETE /payment-methods/{id}

**Description:** Removes a payment method from the user's account.

**Authentication:** Required — Bearer token

**Profile:** Client | Walker

#### Path Parameters

| Param | Type   | Required | Description            |
|-------|--------|----------|------------------------|
| id    | string | ✅        | Payment method ID      |

#### Response — 200 OK
```json
{}
```

#### Response — 404 Not Found
```json
{
  "error": "METHOD_NOT_FOUND",
  "message": "Método de pagamento não encontrado."
}
```

---

### PATCH /payment-methods/{id}/default

**Description:** Sets a payment method as the user's default, removing the default flag from all others.

**Authentication:** Required — Bearer token

**Profile:** Client | Walker

#### Path Parameters

| Param | Type   | Required | Description            |
|-------|--------|----------|------------------------|
| id    | string | ✅        | Payment method ID      |

#### Request Body

None — the path parameter identifies the method to promote.

#### Response — 200 OK
```json
{}
```

> **Note:** The walker payment screen includes a "Solicitar saque" (Request Payout) button that is not yet wired to an API call. See [Section 14 — Inferred Routes](#14-inferred-routes).

---

## 8. Reviews

> **Profile:** Client (creates review) | Walker (views review received)
>
> Reviews are scoped to a walk. A review can only be submitted after the walk status is `"completed"`. The client can also edit a submitted review.

---

### GET /walks/{id}/review

**Description:** Returns the review submitted by the client for a specific walk. Returns `null` if no review has been submitted yet. Used on the walk detail page to show existing review or the "Avaliar passeio" CTA.

**Authentication:** Required — Bearer token

**Profile:** Client | Walker

#### Path Parameters

| Param | Type   | Required | Description |
|-------|--------|----------|-------------|
| id    | string | ✅        | Walk ID     |

#### Response — 200 OK (review exists)
```json
{
  "walkId": "walk-001",
  "walkerId": "uuid-walker-1",
  "rating": 5,
  "comment": "Carlos foi incrível! Rex adorou e voltou completamente feliz. Muito pontual e comunicativo.",
  "createdAt": "2026-05-25T16:45:00Z"
}
```

**WalkReview Object:**

| Field     | Type   | Description                         |
|-----------|--------|-------------------------------------|
| walkId    | string | Associated walk ID                  |
| walkerId  | string | Walker who received the review      |
| rating    | number | Rating from 1 to 5 stars            |
| comment   | string | Optional text comment               |
| createdAt | string | ISO 8601 timestamp                  |

#### Response — 200 OK (no review)
```json
null
```

---

### POST /walks/{id}/review

**Description:** Submits a new review for a completed walk. Only one review is allowed per walk.

**Authentication:** Required — Bearer token

**Profile:** Client

#### Path Parameters

| Param | Type   | Required | Description |
|-------|--------|----------|-------------|
| id    | string | ✅        | Walk ID     |

#### Request Body

| Field   | Type   | Required | Description                         |
|---------|--------|----------|-------------------------------------|
| rating  | number | ✅        | Star rating from 1 to 5             |
| comment | string | ❌        | Optional review text                |

**Example Request:**
```json
{
  "rating": 5,
  "comment": "Excelente passeador! Muito cuidadoso com o Rex e muito pontual."
}
```

#### Response — 201 Created
```json
{
  "walkId": "walk-001",
  "walkerId": "uuid-walker-1",
  "rating": 5,
  "comment": "Excelente passeador! Muito cuidadoso com o Rex e muito pontual.",
  "createdAt": "2026-05-25T16:45:00Z"
}
```

#### Response — 400 Bad Request
```json
{
  "error": "WALK_NOT_COMPLETED",
  "message": "Só é possível avaliar passeios concluídos."
}
```

#### Response — 409 Conflict
```json
{
  "error": "REVIEW_ALREADY_EXISTS",
  "message": "Este passeio já foi avaliado. Use PATCH para editar."
}
```

---

### PATCH /walks/{id}/review

**Description:** Updates an existing review (rating and/or comment). The client can edit their review after submitting.

**Authentication:** Required — Bearer token

**Profile:** Client

#### Path Parameters

| Param | Type   | Required | Description |
|-------|--------|----------|-------------|
| id    | string | ✅        | Walk ID     |

#### Request Body

| Field   | Type   | Required | Description                         |
|---------|--------|----------|-------------------------------------|
| rating  | number | ✅        | New star rating from 1 to 5         |
| comment | string | ❌        | Updated review text                 |

**Example Request:**
```json
{
  "rating": 4,
  "comment": "Passeio muito bom, só chegou 5 minutos atrasado."
}
```

#### Response — 200 OK
```json
{
  "walkId": "walk-001",
  "walkerId": "uuid-walker-1",
  "rating": 4,
  "comment": "Passeio muito bom, só chegou 5 minutos atrasado.",
  "createdAt": "2026-05-25T16:45:00Z"
}
```

---

## 9. My Walks

> **Profile:** Client | Walker

The "Meus Passeios" screen uses the same endpoints already documented in earlier sections. No new API routes were found in Phase 9. All filtering and search are performed **client-side** after fetching the full walk list.

**Endpoints used:**

| Method | Route                         | Description                          | Section      |
|--------|-------------------------------|--------------------------------------|--------------|
| GET    | `/walks?role=client`          | List all client's walks              | Section 2    |
| GET    | `/walks?role=walker&walkerId` | List all walker's walks              | Section 2    |
| GET    | `/walks/{id}`                 | Walk detail page                     | Section 4    |
| PATCH  | `/walks/{id}/cancel`          | Cancel a pending/accepted walk       | Section 3    |
| PATCH  | `/walks/{id}/start`           | Start an accepted walk (walker)      | Section 4    |
| GET    | `/walks/{id}/review`          | Check if review exists (completed)   | Section 8    |

**Client-side features:**
- **Status filters:** Todos / Agendados / Em andamento / Concluídos / Cancelados (applied in-memory)
- **Search:** By pet name, walker/client name, or address (applied in-memory)
- **Repeat walk:** Client can repeat a cancelled walk via `/walks/new?repeat={walkId}` — the form prefills with the previous walk's data (pets, duration, date, address) by calling `GET /walks/{id}` (`useWalkById(repeatWalkId)`).

---

## 10. My Dogs (Client)

> **Profile:** Client only

---

### GET /dogs

**Description:** Lists all pets belonging to the authenticated client. The server scopes the result by the session's `userId` — no explicit filter parameter is needed.

**Authentication:** Required (Bearer JWT)

**Profile:** Client

#### Query Parameters

None.

#### Response — 200 OK

```json
[
  {
    "id": "1",
    "ownerId": "client_1",
    "name": "Thor",
    "breed": "Golden Retriever",
    "age": 4,
    "size": "large",
    "photoUrl": "data:image/jpeg;base64,...",
    "notes": "Muito brincalhão, mas tem medo de motos."
  },
  {
    "id": "2",
    "ownerId": "client_1",
    "name": "Nina",
    "breed": "Poodle",
    "age": 2,
    "size": "small",
    "photoUrl": null,
    "notes": null
  }
]
```

| Field    | Type                                       | Description                                      |
|----------|--------------------------------------------|--------------------------------------------------|
| id       | string                                     | Unique pet identifier                            |
| ownerId  | string                                     | ID of the client who owns this pet               |
| name     | string                                     | Pet's name                                       |
| breed    | string                                     | Breed                                            |
| age      | number                                     | Age in years                                     |
| size     | `"small" \| "medium" \| "large" \| "giant"` | Size category                                    |
| photoUrl | string \| null                              | Base64 data URL (client converts via FileReader) |
| notes    | string \| null                              | Behavioral notes / special care instructions     |

#### Response — 401 Unauthorized

```json
{ "message": "Unauthorized" }
```

---

### POST /dogs

**Description:** Creates a new pet record for the authenticated client. The photo is sent inline as a Base64 data URL in the `photoUrl` field — there is **no separate file upload endpoint** for pet photos. The `FileReader.readAsDataURL()` conversion happens entirely on the client before the request is made.

**Authentication:** Required (Bearer JWT)

**Profile:** Client

#### Request Body

| Field    | Type                                       | Required | Description                                          |
|----------|--------------------------------------------|----------|------------------------------------------------------|
| ownerId  | string                                     | ✅        | Authenticated user's ID (sent by the client)         |
| name     | string                                     | ✅        | Pet's name                                           |
| breed    | string                                     | ✅        | Breed                                                |
| age      | number                                     | ✅        | Age in years (integer, 0–30)                         |
| size     | `"small" \| "medium" \| "large" \| "giant"` | ✅        | Size category                                        |
| photoUrl | string \| undefined                         | ❌        | Base64 data URL, e.g. `data:image/jpeg;base64,/9j…` |
| notes    | string \| undefined                         | ❌        | Behavioral notes / special care instructions         |

```json
{
  "ownerId": "client_1",
  "name": "Rex",
  "breed": "Labrador",
  "age": 3,
  "size": "large",
  "photoUrl": "data:image/jpeg;base64,...",
  "notes": "Puxa muito a guia no início do passeio."
}
```

#### Response — 201 Created

```json
{
  "id": "3",
  "ownerId": "client_1",
  "name": "Rex",
  "breed": "Labrador",
  "age": 3,
  "size": "large",
  "photoUrl": "data:image/jpeg;base64,...",
  "notes": "Puxa muito a guia no início do passeio."
}
```

#### Response — 400 Bad Request

```json
{ "message": "name, breed, age and size are required" }
```

---

### PATCH /dogs/{id}

**Description:** Partially updates an existing pet record. Accepts any subset of mutable fields. Ownership is validated server-side (the pet must belong to the authenticated user).

**Authentication:** Required (Bearer JWT)

**Profile:** Client

#### Path Parameters

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| id        | string | ✅        | Pet identifier |

#### Request Body

All fields optional — send only the ones that changed.

| Field    | Type                                       | Description                              |
|----------|--------------------------------------------|------------------------------------------|
| name     | string                                     | Updated name                             |
| breed    | string                                     | Updated breed                            |
| age      | number                                     | Updated age in years                     |
| size     | `"small" \| "medium" \| "large" \| "giant"` | Updated size category                    |
| photoUrl | string \| null                              | New Base64 data URL, or `null` to remove |
| notes    | string \| null                              | Updated behavioral notes                 |

```json
{
  "name": "Rex",
  "age": 4,
  "notes": "Melhorou muito com guia. Adora outros cães."
}
```

#### Response — 200 OK

Returns the full updated `Pet` object (same shape as `POST /dogs` response).

#### Response — 404 Not Found

```json
{ "message": "Pet não encontrado" }
```

---

### DELETE /dogs/{id}

**Description:** Permanently deletes a pet record. Ownership is validated server-side.

**Authentication:** Required (Bearer JWT)

**Profile:** Client

#### Path Parameters

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| id        | string | ✅        | Pet identifier |

#### Response — 204 No Content

Empty body on success.

#### Response — 404 Not Found

```json
{ "message": "Pet não encontrado" }
```

> **Note on photo storage:** The frontend uses `FileReader.readAsDataURL()` to convert pet images and avatar photos to Base64 strings before embedding them in JSON payloads. There is no dedicated `/upload` or `/media` endpoint in the codebase. The API is expected to store and return these data URL strings directly. Maximum allowed size per the UI validation is **5 MB** (JPEG/PNG only).

---

✅ **Fase 10 concluída.** 4 rotas encontradas e documentadas (`GET`, `POST`, `PATCH`, `DELETE /dogs/{id}`). Avançando para a Fase 11.

---

## 11. Client Profile

> **Profile:** Client | Walker

---

### GET /profile

**Description:** Returns the full profile of the authenticated user (name, email, phone, avatarUrl, role, etc.). Both clients and walkers use this same endpoint to populate the profile page.

**Authentication:** Required (Bearer JWT)

**Profile:** Client | Walker

#### Response — 200 OK

```json
{
  "id": "1",
  "name": "Breno Crepaldi",
  "email": "client@example.com",
  "phone": "+5511999999999",
  "avatarUrl": "data:image/jpeg;base64,...",
  "role": "client",
  "rating": 4.8,
  "totalReviews": 12,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

| Field        | Type                    | Description                                              |
|--------------|-------------------------|----------------------------------------------------------|
| id           | string                  | User identifier                                          |
| name         | string                  | Full name                                                |
| email        | string                  | E-mail address                                           |
| phone        | string \| undefined      | Phone in E.164 format                                    |
| avatarUrl    | string \| undefined      | Base64 data URL of profile photo                         |
| role         | `"client" \| "walker"`  | User role                                                |
| rating       | number \| undefined      | Average rating (1–5)                                     |
| totalReviews | number \| undefined      | Total number of reviews received                         |
| createdAt    | string                  | ISO 8601 timestamp — account creation date               |

#### Response — 401 Unauthorized

```json
{ "message": "Unauthorized" }
```

---

### PATCH /profile

**Description:** Updates the authenticated user's mutable profile fields. The `id`, `role`, and `createdAt` fields are immutable and are excluded from the request body. Avatar changes are handled by a separate `POST /profile/avatar` endpoint.

**Authentication:** Required (Bearer JWT)

**Profile:** Client | Walker

#### Request Body

All fields optional — send only those that changed.

| Field  | Type   | Description                                  |
|--------|--------|----------------------------------------------|
| name   | string | Updated full name                            |
| email  | string | Updated e-mail address                       |
| phone  | string | Updated phone (E.164 format recommended)     |

```json
{
  "name": "Breno Crepaldi",
  "email": "breno@example.com",
  "phone": "+5511988887777"
}
```

#### Response — 200 OK

Empty body or the updated `User` object (frontend ignores the body and refetches via `GET /profile`).

#### Response — 400 Bad Request

```json
{ "message": "Invalid email format" }
```

---

### POST /profile/avatar

**Description:** Uploads a new profile avatar for the authenticated user. Accepts `multipart/form-data` with the image file. Returns the server-hosted URL for the uploaded avatar. Called before `PATCH /profile` when the user changes their photo in the profile edit flow.

**Authentication:** Required (Bearer JWT)

**Profile:** Client | Walker

#### Request Body

`Content-Type: multipart/form-data`

| Field  | Type | Required | Description        |
|--------|------|----------|--------------------|
| avatar | File | ✅        | Image file (JPEG, PNG, WEBP — max 5 MB) |

#### Response — 200 OK

```json
{ "avatarUrl": "https://cdn.dogtravel.app/avatars/user-1-abc123.jpg" }
```

| Field     | Type   | Description                          |
|-----------|--------|--------------------------------------|
| avatarUrl | string | Public CDN URL for the uploaded photo |

#### Response — 400 Bad Request

```json
{ "message": "File too large or unsupported format" }
```

**Source:** `src/features/profile/api/profile.api.ts` — `ProfileApi.uploadAvatar()` · `src/features/profile/hooks/use-profile.ts` — `useUploadAvatar()` · `src/app/profile/_components/profile-info.tsx`

---

### DELETE /profile/avatar

**Description:** Removes the authenticated user's profile photo. After deletion the `avatarUrl` field is `null` and the UI falls back to the initials avatar. Can be called from the profile edit screen.

**Authentication:** Required (Bearer JWT)

**Profile:** Client | Walker

#### Response — 204 No Content

Empty body.

#### Response — 404 Not Found

```json
{ "error": "AVATAR_NOT_FOUND", "message": "Nenhuma foto de perfil encontrada." }
```

**Source:** `src/features/profile/api/profile.api.ts` — `ProfileApi.deleteAvatar()` · `src/features/profile/hooks/use-profile.ts` — `useDeleteAvatar()`

---

✅ **Fase 11 concluída.** 2 rotas encontradas e documentadas (`GET /profile`, `PATCH /profile`). Avançando para a Fase 12.

---

## 12. Walker Profile, Documents & Payments

> **Profile:** Walker only

---

### GET /profile/documents

**Description:** Returns the current document verification status for the authenticated walker. Includes identity verification status, criminal background check status, and the list of optional professional certifications.

**Authentication:** Required (Bearer JWT)

**Profile:** Walker

#### Response — 200 OK

```json
{
  "identity": "verified",
  "background": "pending",
  "certificates": [
    {
      "id": "cert_1",
      "title": "Adestramento Positivo",
      "fileName": "certificado_adestramento.pdf",
      "status": "verified"
    },
    {
      "id": "cert_2",
      "title": "Primeiros Socorros",
      "fileName": "primeiros_socorros.pdf",
      "status": "pending"
    }
  ]
}
```

| Field                       | Type       | Description                                                        |
|-----------------------------|------------|--------------------------------------------------------------------|
| identity                    | `DocStatus` | Status of the identity document verification                      |
| background                  | `DocStatus` | Status of the criminal background check                           |
| certificates                | array      | List of optional professional certifications                       |
| certificates[].id           | string     | Certificate identifier                                             |
| certificates[].title        | string     | Human-readable certificate name                                    |
| certificates[].fileName     | string     | Original filename of the uploaded document                         |
| certificates[].status       | `DocStatus` | Verification status                                               |

**`DocStatus` values:**

| Value      | Meaning                                          |
|------------|--------------------------------------------------|
| `"idle"`   | Not yet submitted                                |
| `"pending"` | Submitted and awaiting review (1–5 business days)|
| `"verified"` | Approved by DogTravel                          |
| `"rejected"` | Refused — must be resubmitted                  |

> **Onboarding gate:** A walker can only toggle availability if both `identity === "verified"` AND `background === "verified"`. This check is enforced client-side before calling `PATCH /walkers/{walkerId}/availability`.

---

### POST /profile/documents/identity

**Description:** Uploads the walker's identity verification documents. Requires two files: the official ID document (RG, CNH, or passport) and a selfie holding the document open. After upload the status transitions to `"pending"` while DogTravel's team reviews (up to 3 business days).

**Authentication:** Required (Bearer JWT)

**Profile:** Walker

**Content-Type:** `multipart/form-data`

#### Request Body (multipart fields)

| Field    | Type | Required | Description                                             |
|----------|------|----------|---------------------------------------------------------|
| document | File | ✅        | Official ID — PDF, JPG, or PNG, max 5 MB               |
| selfie   | File | ✅        | Photo holding the open document — JPG or PNG, max 5 MB |

#### Response — 200 OK / 204 No Content

Empty body on success. The frontend then invalidates the `GET /profile/documents` cache to reflect the new `"pending"` status.

#### Response — 400 Bad Request

```json
{ "message": "Both document and selfie files are required" }
```

#### Response — 422 Unprocessable Entity

```json
{ "message": "File exceeds maximum allowed size of 5MB" }
```

---

### POST /profile/documents/background

**Description:** Uploads the criminal background check certificate. Must be issued within the last 90 days. After upload the status transitions to `"pending"` while DogTravel's team reviews (up to 5 business days).

**Authentication:** Required (Bearer JWT)

**Profile:** Walker

**Content-Type:** `multipart/form-data`

#### Request Body (multipart fields)

| Field    | Type | Required | Description                                                         |
|----------|------|----------|---------------------------------------------------------------------|
| document | File | ✅        | Criminal record certificate — PDF, JPG, or PNG, max 5 MB, ≤ 90 days |

#### Response — 200 OK / 204 No Content

Empty body on success.

#### Response — 400 Bad Request

```json
{ "message": "document file is required" }
```

---

### POST /profile/documents/certificates

**Description:** Adds an optional professional certification to the walker's profile (e.g. dog training, first aid, veterinary). Each certificate is independently reviewed by DogTravel before receiving `"verified"` status. Returns the created `WalkerCertDocument` record.

**Authentication:** Required (Bearer JWT)

**Profile:** Walker

**Content-Type:** `multipart/form-data`

#### Request Body (multipart fields)

| Field | Type   | Required | Description                                  |
|-------|--------|----------|----------------------------------------------|
| title | string | ✅        | Human-readable certificate name              |
| file  | File   | ✅        | Certificate document — PDF or image, max 5 MB |

```
--boundary
Content-Disposition: form-data; name="title"

Adestramento Positivo
--boundary
Content-Disposition: form-data; name="file"; filename="certificado.pdf"
Content-Type: application/pdf

<binary content>
--boundary--
```

#### Response — 201 Created

```json
{
  "id": "cert_3",
  "title": "Adestramento Positivo",
  "fileName": "certificado.pdf",
  "status": "pending"
}
```

#### Response — 400 Bad Request

```json
{ "message": "title and file are required" }
```

---

### DELETE /profile/documents/certificates/{id}

**Description:** Removes a professional certification from the walker's profile. Only certificates with status `"pending"` or `"idle"` can be deleted via the UI — `"verified"` certificates show no delete button. The API should enforce this constraint as well.

**Authentication:** Required (Bearer JWT)

**Profile:** Walker

#### Path Parameters

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| id        | string | ✅        | Certificate identifier  |

#### Response — 204 No Content

Empty body on success.

#### Response — 404 Not Found

```json
{ "message": "Certificate not found" }
```

#### Response — 403 Forbidden

```json
{ "message": "Cannot delete a verified certificate" }
```

---

✅ **Fase 12 concluída.** 5 rotas encontradas e documentadas (`GET /profile/documents`, `POST /profile/documents/identity`, `POST /profile/documents/background`, `POST /profile/documents/certificates`, `DELETE /profile/documents/certificates/{id}`). Avançando para a Fase 13.

---

## 13. Walkers Explorer (Client)

> **Profile:** Client only

---

### GET /walkers

**Description:** Returns a paginated/filtered list of active walker profiles. The server supports `query` (full-text search over name, location, tags, and behavior expertise) and `size` (dog size category) as query parameters. Additional filters — "Trust Pack" (requires both `identityVerified` and `backgroundCheck`) and "Fit My Pets" (matches against the client's registered dogs) — are applied **client-side** after the API response, using the data already loaded by `GET /dogs`.

**Authentication:** Required (Bearer JWT)

**Profile:** Client

#### Query Parameters

| Parameter | Type                                        | Required | Description                                      |
|-----------|---------------------------------------------|----------|--------------------------------------------------|
| query     | string                                      | ❌        | Free-text search (name, location, tags, expertise)|
| size      | `"small" \| "medium" \| "large" \| "giant"` | ❌        | Filter by supported dog size                     |

#### Response — 200 OK

```json
[
  {
    "id": "walker_1",
    "name": "Lucas Mendes",
    "rating": 4.9,
    "reviews": 127,
    "location": "Pinheiros, São Paulo",
    "serviceArea": "Pinheiros e arredores",
    "description": "Passeador certificado com 5 anos de experiência...",
    "tags": ["Pontual", "Experiente", "Dog lover"],
    "verified": true,
    "availability": "Seg–Sex, 7h–19h",
    "completedWalks": 312,
    "trustChecks": {
      "identityVerified": true,
      "backgroundCheck": true
    },
    "certifications": [
      { "title": "Adestramento Positivo", "verified": true }
    ],
    "supportedSizes": ["small", "medium", "large"],
    "behaviorExpertise": ["reativo", "multiplos-caes", "filhote"]
  }
]
```

| Field                          | Type            | Description                                                     |
|--------------------------------|-----------------|-----------------------------------------------------------------|
| id                             | string          | Walker identifier                                               |
| name                           | string          | Full name                                                       |
| rating                         | number          | Average rating (1.0–5.0)                                        |
| reviews                        | number          | Total number of reviews                                         |
| location                       | string          | Neighborhood / city                                             |
| serviceArea                    | string          | Text description of the service area                            |
| description                    | string          | Walker's profile bio                                            |
| tags                           | string[]        | Display tags shown on the card                                  |
| verified                       | boolean         | Whether the profile has the "verified" badge                    |
| availability                   | string          | Human-readable availability schedule                            |
| completedWalks                 | number          | Total walks completed on the platform                           |
| trustChecks.identityVerified   | boolean         | Identity document verified by DogTravel                         |
| trustChecks.backgroundCheck    | boolean         | Criminal background check verified by DogTravel                 |
| certifications                 | array           | Professional certifications                                     |
| certifications[].title         | string          | Certificate name                                                |
| certifications[].verified      | boolean         | Whether DogTravel has verified this certificate                 |
| supportedSizes                 | `DogSize[]`     | Dog sizes this walker accepts                                   |
| behaviorExpertise              | string[]        | Behavior tags (e.g. `"reativo"`, `"multiplos-caes"`, `"filhote"`) |

> **Client-side filters:** "Trust Pack" (`trustChecks.identityVerified && trustChecks.backgroundCheck`) and "Fit My Pets" (cross-references `GET /dogs` sizes + behavior notes) are applied in the browser — no corresponding API parameters exist.

---

### GET /walkers/{id}

**Description:** Returns the full profile of a single walker, including detailed certifications and stats. Used on the walker detail page (`/walkers/{id}`).

**Authentication:** Required (Bearer JWT)

**Profile:** Client

#### Path Parameters

| Parameter | Type   | Required | Description       |
|-----------|--------|----------|-------------------|
| id        | string | ✅        | Walker identifier |

#### Response — 200 OK

Same shape as one element of `GET /walkers` array. Includes all fields listed in the table above.

#### Response — 404 Not Found

```json
{ "message": "Walker not found" }
```

---

### GET /walkers/{id}/reviews

**Description:** Returns the list of public reviews left by clients for a specific walker. Displayed on the walker detail page below the certifications section.

**Authentication:** Required (Bearer JWT)

**Profile:** Client

#### Path Parameters

| Parameter | Type   | Required | Description       |
|-----------|--------|----------|-------------------|
| id        | string | ✅        | Walker identifier |

#### Response — 200 OK

```json
[
  {
    "id": "pr1",
    "walkId": "2",
    "rating": 5,
    "comment": "Carlos é incrível! Meu cachorro adorou o passeio.",
    "clientName": "Ana S.",
    "createdAt": "2026-03-18T11:20:00Z"
  }
]
```

| Field       | Type   | Description                        |
|-------------|--------|------------------------------------|
| id          | string | Review identifier                  |
| walkId      | string | Walk that originated the review    |
| rating      | number | Score 1–5                          |
| comment     | string | Client's written feedback          |
| clientName  | string | Display name of the reviewing client |
| createdAt   | string | ISO 8601 timestamp                 |

**Source:** `src/features/walkers/api/walkers.api.ts` — `WalkersApi.getReviews()` · `src/features/walkers/hooks/use-walkers.ts` — `useWalkerReviews()` · `src/app/walkers/[id]/_components/walker-reviews-section.tsx`

---

### GET /walkers/{walkerId}/availability

**Description:** Returns the current availability toggle state of a specific walker. Used on the walker dashboard to show the live availability switch, and also called from the walker detail page (`/walkers/{id}`) to display a real-time availability badge to clients.

**Authentication:** Required (Bearer JWT)

**Profile:** Client | Walker

#### Path Parameters

| Parameter | Type   | Required | Description       |
|-----------|--------|----------|-------------------|
| walkerId  | string | ✅        | Walker identifier |

#### Response — 200 OK

```json
{ "available": true }
```

---

### PATCH /walkers/{walkerId}/availability

**Description:** Toggles the walker's availability. When set to `true`, the walker appears in search results and can receive walk requests. The frontend enforces an **onboarding gate** before calling this endpoint: the walker must have `identity === "verified"` AND `background === "verified"` (via `GET /profile/documents`). If either check fails, the toggle is blocked in the UI with an explanatory message, and this endpoint is never called.

**Authentication:** Required (Bearer JWT)

**Profile:** Walker

#### Path Parameters

| Parameter | Type   | Required | Description       |
|-----------|--------|----------|-------------------|
| walkerId  | string | ✅        | Walker identifier |

#### Request Body

| Field     | Type    | Required | Description                    |
|-----------|---------|----------|--------------------------------|
| available | boolean | ✅        | New availability state          |

```json
{ "available": true }
```

#### Response — 200 OK / 204 No Content

Empty body on success.

#### Response — 403 Forbidden

```json
{ "message": "Walker must complete identity and background verification before becoming available" }
```

---

### GET /walkers/available

**Description:** Returns walkers who are currently set as available AND match the requested date, time, and duration slot. Called in the walk request wizard (Step 2 — date and time selection) to let the client see which walkers can take their walk before submitting it. Also used on the `WalkerAvailabilityBadge` component if a date-context filter is desired in the future.

**Authentication:** Required (Bearer JWT)

**Profile:** Client

#### Query Parameters

| Parameter       | Type   | Required | Description                                            |
|-----------------|--------|----------|--------------------------------------------------------|
| date            | string | ✅        | Target date in `YYYY-MM-DD` format                     |
| time            | string | ✅        | Target start time in `HH:MM` (24 h) format             |
| durationMinutes | number | ✅        | Walk duration in minutes (15, 30, 45, or 60)           |

**Example Request:**
```
GET /walkers/available?date=2026-06-10&time=08:00&durationMinutes=30
```

#### Response — 200 OK

Array of `WalkerProfile` objects (same shape as `GET /walkers`) whose `available` flag is `true` and who have no conflicting walk in the requested time window.

```json
[
  {
    "id": "walker_1",
    "name": "Carlos Silva",
    "rating": 4.9,
    ...
  }
]
```

#### Response — 400 Bad Request

```json
{ "message": "date, time and durationMinutes are required" }
```

**Source:** `src/features/walkers/api/walkers.api.ts` — `WalkersApi.getAvailable()` · `src/features/walkers/hooks/use-walkers.ts` — `useAvailableWalkers()`

---

✅ **Fase 13 concluída.** 6 rotas encontradas e documentadas (`GET /walkers`, `GET /walkers/{id}`, `GET /walkers/{id}/reviews`, `GET /walkers/available`, `GET /walkers/{walkerId}/availability`, `PATCH /walkers/{walkerId}/availability`). Avançando para a Fase 14.

---

## 13.1 Walker Own Profile Management

> **Profile:** Walker only
>
> These routes allow a walker to view and edit their own professional profile (bio, service area, specialties). Separate from `GET/PATCH /profile` which manages base user fields (name, email, phone, avatar).

---

### GET /walkers/me

**Description:** Returns the full professional profile of the authenticated walker. Used on the walker profile editing page (`/profile/walker-profile`) to populate the form with current values.

**Authentication:** Required — Bearer token

**Profile:** Walker

#### Response — 200 OK

Same shape as `GET /walkers/{id}` — returns a full `WalkerProfile` object.

```json
{
  "id": "uuid-walker-1",
  "name": "Carlos Silva",
  "rating": 4.9,
  "reviews": 124,
  "location": "Zona Sul, São Paulo",
  "serviceArea": "Moema, Vila Mariana e Itaim Bibi",
  "description": "Especialista em cães de grande porte e alta energia.",
  "tags": ["Grande Porte", "Energéticos", "Adestrador"],
  "verified": true,
  "availability": "Seg–Sáb, 07:00–19:00",
  "completedWalks": 812,
  "trustChecks": {
    "identityVerified": true,
    "backgroundCheck": true
  },
  "certifications": [
    { "title": "Adestramento Positivo", "verified": true }
  ],
  "supportedSizes": ["medium", "large", "giant"],
  "behaviorExpertise": ["agitado", "reativo", "multiplos-caes"]
}
```

**Source:** `src/features/walkers/api/walkers.api.ts` — `WalkersApi.getMe()` · `src/features/walkers/hooks/use-walkers.ts` — `useWalkerProfile()` · `src/app/profile/walker-profile/page.tsx`

---

### PATCH /walkers/me

**Description:** Updates the authenticated walker's professional profile fields. Only editable fields are accepted — read-only fields (`rating`, `reviews`, `completedWalks`, `verified`, `trustChecks`, `certifications`) are ignored and must not be sent.

**Authentication:** Required — Bearer token

**Profile:** Walker

#### Request Body

All fields optional — send only those that changed.

| Field             | Type       | Description                                          |
|-------------------|------------|------------------------------------------------------|
| description       | string     | Walker's bio / presentation text                     |
| location          | string     | Neighborhood / city (e.g. `"Pinheiros, São Paulo"`)  |
| serviceArea       | string     | Text description of service coverage area            |
| availability      | string     | Human-readable schedule (e.g. `"Seg–Sex, 7h–19h"`)  |
| tags              | string[]   | Display tags shown on the public profile card        |
| supportedSizes    | DogSize[]  | Dog sizes accepted (`"small"`, `"medium"`, `"large"`, `"giant"`) |
| behaviorExpertise | string[]   | Behavior specialties (e.g. `"reativo"`, `"filhote"`) |

**Example Request:**
```json
{
  "description": "Passeador com 5 anos de experiência, especializado em cães reativos.",
  "location": "Pinheiros, São Paulo",
  "serviceArea": "Pinheiros, Vila Madalena e Perdizes",
  "availability": "Seg–Sex, 7h–19h",
  "tags": ["Pontual", "Experiente", "Dog Lover"],
  "supportedSizes": ["small", "medium", "large"],
  "behaviorExpertise": ["reativo", "filhote", "multiplos-caes"]
}
```

#### Response — 200 OK

```json
{}
```

#### Response — 403 Forbidden

```json
{
  "error": "NOT_A_WALKER",
  "message": "Esta rota é exclusiva para passeadores."
}
```

**Source:** `src/features/walkers/api/walkers.api.ts` — `WalkersApi.updateMe()` · `src/features/walkers/hooks/use-walkers.ts` — `useUpdateWalkerProfile()` · `src/app/profile/walker-profile/page.tsx`

---

### GET /walkers/me/earnings

**Description:** Returns the authenticated walker's full earnings history — one entry per completed or pending payout. Different from `GET /payment-history` which is exclusively for client-side payment records.

**Authentication:** Required — Bearer token

**Profile:** Walker

**Query Parameters:**

| Name       | Type   | Required | Description                             |
|------------|--------|----------|-----------------------------------------|
| `from`     | string | No       | ISO date filter — start date (YYYY-MM-DD) |
| `to`       | string | No       | ISO date filter — end date (YYYY-MM-DD)   |
| `page`     | number | No       | Page number (default: 1)               |
| `pageSize` | number | No       | Items per page (default: 20)           |

#### Response — 200 OK

```json
[
  {
    "id": "earn_1",
    "walkId": "uuid-walk-1",
    "date": "2026-03-22",
    "amount": 37.00,
    "status": "paid",
    "methodId": "",
    "description": "Passeio com Rex · Ana Silva"
  },
  {
    "id": "earn_2",
    "walkId": "uuid-walk-2",
    "date": "2026-03-21",
    "amount": 44.00,
    "status": "paid",
    "methodId": "",
    "description": "Passeio com Mel · Julia M."
  }
]
```

**Status values:**
- `paid` — payout already transferred to walker's account
- `pending` — walk completed but payout not yet processed
- `failed` — payout failed (see walk record for reason)

**Source:** `src/features/walkers/api/walkers.api.ts` — `WalkersApi.getEarnings()` · `src/features/walkers/hooks/use-walkers.ts` — `useWalkerEarnings()` · `src/app/payments/_components/walker-payments.tsx`

---

### GET /walkers/me/bank-account

**Description:** Returns the bank account details of the authenticated walker used for payout transfers.

**Authentication:** Required — Bearer token

**Profile:** Walker

#### Response — 200 OK

```json
{
  "bankName": "Nubank",
  "accountType": "checking",
  "branch": "0001",
  "accountNumber": "12345-6",
  "holderName": "Carlos Silva",
  "holderDocument": "123.456.789-00",
  "pixKey": "carlos@example.com"
}
```

**Source:** `src/features/walkers/api/walkers.api.ts` — `WalkersApi.getBankAccount()` · `src/features/walkers/hooks/use-walkers.ts` — `useWalkerBankAccount()` · `src/app/profile/bank-account/page.tsx`

---

### PATCH /walkers/me/bank-account

**Description:** Updates the walker's bank account used for receiving payouts.

**Authentication:** Required — Bearer token

**Profile:** Walker

#### Request Body

```json
{
  "bankName": "Nubank",
  "accountType": "checking",
  "branch": "0001",
  "accountNumber": "12345-6",
  "holderName": "Carlos Silva",
  "holderDocument": "123.456.789-00",
  "pixKey": "carlos@example.com"
}
```

| Field            | Type   | Required | Description                              |
|------------------|--------|----------|------------------------------------------|
| `bankName`       | string | Yes      | Bank name                                |
| `accountType`    | string | Yes      | `checking` or `savings`                  |
| `branch`         | string | Yes      | Bank branch number                       |
| `accountNumber`  | string | Yes      | Account number with digit                |
| `holderName`     | string | Yes      | Legal name of account holder             |
| `holderDocument` | string | Yes      | CPF or CNPJ                              |
| `pixKey`         | string | No       | PIX key (CPF, email, phone, or random)   |

#### Response — 200 OK

```json
{}
```

**Source:** `src/features/walkers/api/walkers.api.ts` — `WalkersApi.updateBankAccount()` · `src/features/walkers/hooks/use-walkers.ts` — `useUpdateWalkerBankAccount()` · `src/app/profile/bank-account/page.tsx`

---

## 14. Inferred Routes

The routes below are **not explicitly present** in any API module file (`*.api.ts`) but are **strongly implied** by UI flows, business logic, or code comments in the frontend. The backend should implement them.

---

### POST /auth/logout *(implemented)*

**Description:** Invalidates the server-side session. No request body is needed — the server identifies and revokes the session from the `Authorization: Bearer <accessToken>` header (injected automatically by the Axios interceptor). The client-side `signOut()` from NextAuth is called immediately after to clear the local JWT session cookie.

> **Note:** `refreshToken` is stored only in the server-side JWT callback and is **not** exposed to the client session (see `src/types/next-auth.d.ts`). This is why the request body is empty.

**Authentication:** Required (Bearer JWT)

**Request Body:** None

**Response — 200 OK:** `{}`

**Source:** `src/features/auth/api/auth.api.ts` — `AuthApi.logout()` · `src/features/auth/hooks/use-auth.ts` — `useLogout()` · `src/app/profile/_components/logout-button.tsx`

---

### POST /walks/estimate *(implemented — see Section 3)*

**Description:** ✅ This route is now implemented. Server-side pricing breakdown for a walk, given `durationMinutes`, `petCount`, and `isFirstRide`. See the full documentation in **[Section 3 — POST /walks/estimate](#post-walksestimate)**.

---

### GET /config/pricing *(inferred)*

**Description:** Returns the platform's current pricing configuration. The constants `DURATION_BASE_PRICE`, `EXTRA_PET_FEE`, `PLATFORM_AND_SAFETY_FEE_RATE`, and `FIRST_RIDE_DISCOUNT_RATE` are defined in `src/config/pricing.ts` (moved from `mock-data.ts`). Moving them to an API endpoint would allow dynamic pricing without a frontend deploy.

**Authentication:** Required (Bearer JWT)

**Expected Response — 200 OK:**

```json
{
  "durationBasePrices": { "15": 1200, "30": 1800, "45": 2400, "60": 2700 },
  "extraPetFee": 400,
  "platformFeeRate": 0.08,
  "firstRideDiscountRate": 0.15,
  "currency": "BRL"
}
```

*(amounts in cents)*

---

### WS /walks/{walkId}/location *(inferred — WebSocket upgrade)*

**Description:** Real-time walker location stream. Currently implemented as HTTP polling every 5 seconds via `GET /walks/{walkId}/location`. Source comment in `use-tracking.ts` reads: *"replace with WebSocket subscription when available"*. The backend should eventually upgrade this to a WebSocket connection.

**Expected events (server → client):**

```json
{ "walkId": "walk_1", "lat": -23.563, "lng": -46.654, "updatedAt": "2025-05-25T14:32:00Z" }
```

---

### WS /walks/{walkId}/messages *(inferred — WebSocket upgrade)*

**Description:** Real-time chat message stream. Currently polled every 5 seconds via `GET /walks/{walkId}/messages`. Source comment in `use-chat.ts` reads: *"replace with WebSocket subscription when available"*.

---

### POST /payments/pix *(inferred)*

**Description:** Initiates a PIX payment for a walk. Currently the frontend uses a mock PIX flow (hardcoded `PIX_INSTANT_ID = "pix_instant"` and `PIX_MOCK_KEY = "pagamentos@dogtravel.com.br"`). A real endpoint would generate the PIX QR code and EMV payload server-side.

**Authentication:** Required (Bearer JWT)

**Request Body:**

```json
{
  "walkId": "walk_1",
  "amount": 1800,
  "currency": "BRL"
}
```

**Expected Response — 201 Created:**

```json
{
  "paymentId": "pay_1",
  "pixKey": "pagamentos@dogtravel.com.br",
  "qrCode": "00020126...",
  "expiresAt": "2025-05-25T15:00:00Z"
}
```

---

### GET /payments/{paymentId}/status *(inferred)*

**Description:** Polls the status of an asynchronous PIX payment. The UI shows a "waiting for confirmation" state after the QR code is displayed — an endpoint to check payment status is implied.

**Authentication:** Required (Bearer JWT)

**Expected Response — 200 OK:**

```json
{ "paymentId": "pay_1", "status": "completed", "paidAt": "2025-05-25T14:45:00Z" }
```

---

### PATCH /walks/{walkId}/complete *(implemented)*

**Description:** Marks a walk as completed by the walker. Updates the walk status to `"completed"`, finalizes all timeline events to `"done"`, and triggers payment credit for the walker. A "Concluir passeio" button is shown to the walker in the walk detail page when status is `in_progress`.

**Authentication:** Required (Bearer JWT, walker role)

**Request Body:** None

**Response — 200 OK:** Full `WalkRecord` object with `status: "completed"` and all timeline events set to `state: "done"`.

**Source:** `src/features/walks/api/walks.api.ts` — `WalksApi.complete(walkId)` · `src/features/walks/hooks/use-walk-actions.ts` — `useCompleteWalk()` · `src/app/walks/[id]/_components/walk-detail-client.tsx`

---

## 15. Route Summary

Complete list of all documented API routes (excluding inferred).

| # | Method | Route | Profile | Section |
|---|--------|-------|---------|---------|
| 1 | POST | `/auth/register` | Client \| Walker | 1 |
| 2 | POST | `/auth/login` | Client \| Walker | 1 |
| 3 | POST | `/auth/refresh` | Client \| Walker | 1 |
| 4 | GET | `/me/stats` | Client | 2 |
| 5 | GET | `/walkers/me/stats` | Walker | 2 |
| 6 | GET | `/walks` | Client \| Walker | 2 |
| 7 | POST | `/walks` | Client | 3 |
| 8 | PATCH | `/walks/{id}/cancel` | Client | 3 |
| 9 | GET | `/walk-requests` | Walker | 4 |
| 10 | POST | `/walk-requests/{id}/accept` | Walker | 4 |
| 11 | POST | `/walk-requests/{id}/decline` | Walker | 4 |
| 12 | GET | `/walks/{id}` | Client \| Walker | 4 |
| 13 | PATCH | `/walks/{walkId}/start` | Walker | 4 |
| 14 | GET | `/walks/{walkId}/location` | Client \| Walker | 5 |
| 15 | PATCH | `/walks/{walkId}/location` | Walker | 5 |
| 16 | GET | `/walks/{walkId}/route` | Client | 5 |
| 17 | GET | `/walks/{walkId}/messages` | Client \| Walker | 6 |
| 18 | POST | `/walks/{walkId}/messages` | Client \| Walker | 6 |
| 19 | GET | `/payment-methods` | Client | 7 |
| 20 | POST | `/payment-methods` | Client | 7 |
| 21 | PATCH | `/payment-methods/{id}/default` | Client | 7 |
| 22 | DELETE | `/payment-methods/{id}` | Client | 7 |
| 23 | GET | `/payment-history` | Client | 7 |
| 24 | GET | `/walks/{walkId}/review` | Client \| Walker | 8 |
| 25 | POST | `/walks/{walkId}/review` | Client | 8 |
| 26 | PATCH | `/walks/{walkId}/review` | Client | 8 |
| 27 | GET | `/dogs` | Client | 10 |
| 28 | POST | `/dogs` | Client | 10 |
| 29 | PATCH | `/dogs/{id}` | Client | 10 |
| 30 | DELETE | `/dogs/{id}` | Client | 10 |
| 31 | GET | `/profile` | Client \| Walker | 11 |
| 32 | PATCH | `/profile` | Client \| Walker | 11 |
| 33 | GET | `/profile/documents` | Walker | 12 |
| 34 | POST | `/profile/documents/identity` | Walker | 12 |
| 35 | POST | `/profile/documents/background` | Walker | 12 |
| 36 | POST | `/profile/documents/certificates` | Walker | 12 |
| 37 | DELETE | `/profile/documents/certificates/{id}` | Walker | 12 |
| 38 | GET | `/walkers` | Client | 13 |
| 39 | GET | `/walkers/{id}` | Client | 13 |
| 40 | GET | `/walkers/{id}/reviews` | Client | 13 |
| 41 | GET | `/walkers/available` | Client | 13 |
| 42 | GET | `/walkers/{walkerId}/availability` | Client \| Walker | 13 |
| 43 | PATCH | `/walkers/{walkerId}/availability` | Walker | 13 |
| 44 | GET | `/walkers/me` | Walker | 13.1 |
| 45 | PATCH | `/walkers/me` | Walker | 13.1 |
| 46 | GET | `/walkers/me/earnings` | Walker | 13.1 |
| 47 | GET | `/walkers/me/bank-account` | Walker | 13.1 |
| 48 | PATCH | `/walkers/me/bank-account` | Walker | 13.1 |
| 49 | POST | `/profile/avatar` | Client \| Walker | 11 |
| 50 | POST | `/auth/logout` | Client \| Walker | 14 |
| 51 | PATCH | `/walks/{walkId}/complete` | Walker | 14 |
| 52 | POST | `/walks/estimate` | Client | 3 |
| 53 | POST | `/auth/forgot-password` | Client \| Walker | 1 |
| 54 | POST | `/auth/reset-password` | Client \| Walker | 1 |

**Total: 52 explicit routes + 5 inferred routes = 57 routes documented.**

---

## 16. External API Dependencies

These are calls made by the frontend to **third-party services** (not the DogTravel backend). They must be considered when configuring CORS, CSPs, or offline/fallback behavior.

---

### GET https://nominatim.openstreetmap.org/reverse *(External — OpenStreetMap)*

**Description:** Reverse geocoding — converts a GPS coordinate pair into a structured street address. Called in two scenarios:
1. When the user clicks "Usar minha localização atual" — the browser's Geolocation API returns `lat/lng`, which is immediately reverse-geocoded to fill the address form fields.
2. When the user drags the map marker to adjust the pick-up point — the new coordinates are reverse-geocoded to update the displayed address.

**Source:** `src/app/walks/new/_components/steps/step-location.tsx` — `reverseGeocode()` function (line 34)

**Authentication:** None (public endpoint)

**Request:**

```
GET https://nominatim.openstreetmap.org/reverse
  ?lat={latitude}
  &lon={longitude}
  &format=json
  &accept-language=pt-BR
Headers:
  User-Agent: DogTravel/1.0 (app)
```

| Parameter        | Type   | Description                    |
|------------------|--------|--------------------------------|
| lat              | number | Latitude (decimal degrees)     |
| lon              | number | Longitude (decimal degrees)    |
| format           | string | Always `"json"`                |
| accept-language  | string | Always `"pt-BR"`               |

**Response — 200 OK (excerpt):**

```json
{
  "address": {
    "road": "Rua das Flores",
    "house_number": "120",
    "suburb": "Moema",
    "city": "São Paulo",
    "state": "São Paulo"
  }
}
```

**Frontend field mapping:**

| Nominatim field                          | Form field           |
|------------------------------------------|----------------------|
| `address.road + address.house_number`    | `addressStreet`      |
| `address.suburb / neighbourhood / quarter` | `addressNeighborhood` |
| `address.city / town / village`          | `addressCity`        |
| All joined                               | `address` (combined) |

---

### GET https://nominatim.openstreetmap.org/search *(External — OpenStreetMap)*

**Description:** Forward geocoding — converts a free-text address string into GPS coordinates. Called automatically (debounced 800 ms) when the user finishes typing a street + city combination in the walk location step.

**Source:** `src/app/walks/new/_components/steps/step-location.tsx` — `forwardGeocode()` function (line 55)

**Authentication:** None (public endpoint)

**Request:**

```
GET https://nominatim.openstreetmap.org/search
  ?q={encodeURIComponent(combinedAddress)}
  &format=json
  &limit=1
  &accept-language=pt-BR
Headers:
  User-Agent: DogTravel/1.0 (app)
```

| Parameter       | Type   | Description                                 |
|-----------------|--------|---------------------------------------------|
| q               | string | URL-encoded combined address (street + city)|
| format          | string | Always `"json"`                             |
| limit           | number | Always `1` — only first result is used      |
| accept-language | string | Always `"pt-BR"`                            |

**Response — 200 OK:**

```json
[
  { "lat": "-23.60025", "lon": "-46.66506" }
]
```

The frontend parses `results[0].lat` and `results[0].lon` (both strings → converted to floats) and stores them as the walk's `lat`/`lng` start coordinates, which will be sent to `POST /walks`.

**Empty result (`[]`):** Sets the UI status to `"not_found"` and shows a warning banner — the user must correct the address before continuing.

> **Privacy note:** User-typed addresses are sent in plain text to OpenStreetMap's public servers. No authentication is required and requests are logged by Nominatim's infrastructure. For production deployments, consider self-hosting a Nominatim instance or replacing with a paid geocoding provider (e.g. Google Maps, Mapbox Geocoding API) for better rate limits and SLA guarantees.

---

### Mapbox GL JS *(External — Mapbox CDN)*

**Description:** Interactive map rendering. The app uses `react-map-gl/mapbox` (a React wrapper over Mapbox GL JS) to display three distinct map experiences, all using the `mapbox://styles/mapbox/streets-v12` tile style.

**Authentication:** API key via `NEXT_PUBLIC_MAPBOX_TOKEN` environment variable — passed as `mapboxAccessToken` prop to each `<Map>` component instance.

**Usage in the codebase:**

| Component | Source file | Purpose |
|-----------|-------------|---------|
| `WalkRouteMap` | `src/app/walks/[id]/_components/walk-route-map.tsx` | Renders the recorded GPS trail (GeoJSON LineString) for a completed walk, with A/B markers and bounding box fit |
| `MapTracker` | `src/app/walks/[id]/tracking/_components/map-tracker.tsx` | Real-time walker location dot during an `in_progress` walk; re-renders every 5 s as `GET /walks/{walkId}/location` polls |
| `LocationPickerMap` | `src/app/walks/new/_components/location-picker-map.tsx` | Draggable marker for picking the walk start point; `onDragEnd` fires `reverseGeocode()` (Nominatim) to update address fields |

**Mapbox endpoints called by the SDK (transparent to app code):**

| Endpoint | Purpose |
|----------|---------|
| `https://api.mapbox.com/styles/v1/mapbox/streets-v12` | Fetch map style JSON |
| `https://api.mapbox.com/v4/*` / `https://{a-d}.tiles.mapbox.com/*` | Vector tile downloads |
| `https://events.mapbox.com/events/v2` | Usage telemetry (analytics, billing) |

**Map style used:** `mapbox://styles/mapbox/streets-v12` (Mapbox-hosted Streets style v12)

**Token scope required:** A public Mapbox token with at least `styles:read` and `tiles:read` scopes is sufficient. Mapbox tracks usage against the token for billing.

> **CSP note:** The following origins must be whitelisted in the `Content-Security-Policy` header for Mapbox GL JS to function: `connect-src api.mapbox.com events.mapbox.com *.tiles.mapbox.com; worker-src blob:; img-src data: blob: *.mapbox.com`.

---

*Documentation generated by analyzing the full DogTravel frontend codebase (Next.js 15, TypeScript, TanStack Query, NextAuth.js). Routes marked "inferred" do not yet have a corresponding `*.api.ts` implementation but are implied by UI code, business logic, or source comments. External API dependencies (Section 16): Nominatim/OpenStreetMap (geocoding) and Mapbox GL JS (maps).*
