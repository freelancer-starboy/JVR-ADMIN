# SRI JVR TEXTILES – Admin

Admin dashboard for the JVR storefront (Next.js 13 pages router, MUI, MongoDB via mongoose).

Modules: Dashboard, Products (add / edit / delete with Cloudinary photos), WhatsApp Leads,
Enquiries (contact-form messages with email replies) and Orders (earlier online-payment orders).

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

Environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string (same database as the storefront) |
| `JWT_SECRET` | Long random string used to sign admin login tokens |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Product photo uploads |
| `NODEMAILER_USER`, `NODEMAILER_APP_PASSWORD` | Gmail account + app password for replying to enquiries |

Generate a `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Routes

- `/` – login page. Logged-in admins are sent straight to `/dashboard`.
- `/dashboard` – overview (landing page after login).
- `/products`, `/products/new`, `/products/:id`, `/products/:id/edit`
- `/leads`, `/leads/:id` – WhatsApp leads
- `/enquiries`, `/enquiries/:id` – contact-form messages
- `/orders`, `/orders/:id`

Every page and `/api/*` route requires a login (see `middleware.js`). Signed-out page visits are
redirected to `/?next=<page>`; API calls get `401`.

## Admin login

There is no sign-up page. Admin accounts live in the MongoDB collection **`admins`**:

```js
{ username: String (unique), password: String (bcrypt hash), name: String, createdAt: Date }
```

Logging in issues a JWT (HS256, signed with `JWT_SECRET`, valid 7 days) stored in the
`admin_token` httpOnly cookie. Log out from the profile menu in the top-right corner.

### Option 1 – script (recommended)

```bash
npm run create-admin -- <username> <password> [display name]
# e.g.
npm run create-admin -- jvradmin "a-strong-password" "JVR Admin"
```

It reads `MONGO_URI` from `.env.local` (or the environment), hashes the password with bcrypt and
creates the admin. Running it again for an existing username resets that admin's password.

### Option 2 – insert manually (MongoDB Atlas / Compass / mongosh)

1. Create a bcrypt hash of the password (run inside this project so `bcryptjs` is available):

   ```bash
   node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" "a-strong-password"
   ```

2. Insert a document into the `admins` collection:

   ```js
   db.admins.insertOne({
     username: "jvradmin",
     password: "$2a$12$...the hash from step 1...",
     name: "JVR Admin",
     createdAt: new Date()
   })
   ```

A plain-text password in `password` also works (handy for a first test), but the server logs a
warning each time it is used. Replace it with a bcrypt hash as soon as possible.

To remove an admin, delete their document from `admins`; their session stops working on the next
request that checks the account.

## WhatsApp leads

The storefront records every "Order on WhatsApp" click in the `whatsapp_enquiries` collection
(one document per customer or guest visitor, each click appended to `enquiries`). The schema is
mirrored in `lib/Models/whatsappEnquiryModel.js` – keep it in sync with the storefront's
`lib/Schema/whatsappEnquirySchema.js`. The admin only changes `followUpStatus` and `followUpNotes`.

## Scripts

- `npm run dev` / `npm run build` / `npm start`
- `npm run lint`
- `npm run create-admin -- <username> <password> [name]`

To run a second dev server or a build next to an already running one, give it its own output
folder: `NEXT_DIST_DIR=.next-verify npx next dev -p 3201`.
