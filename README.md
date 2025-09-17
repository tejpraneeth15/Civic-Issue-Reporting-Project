Crowdsourced Civic Issue Reporting and Resolution System

Overview

This project is a mobile-first platform that lets citizens report local civic issues (potholes, garbage, drainage, water, electricity) and track resolution, while providing municipal admins a focused, popularity-aware queue by department and location. It consists of a React Native (Expo) mobile app and a Node.js/Express backend with MongoDB.

Key capabilities

- User onboarding
  - Register/login with mobile number + password (JWT-based sessions)
  - First-time location setup: district → municipality (dependent dropdowns for Jharkhand)
- Reporting
  - Twitter-style compose: text, optional address, up to 6 images/videos
  - Department selection guidance (Sanitation, Engineering, Drainage, WaterSupply, Electricity)
  - Media stored locally on the backend under `uploads/` and served at `/uploads/*`
- Feed (social-style)
  - Local vs All filter, location search, upvote (▲) popularity, and comments
  - Inline media thumbnails and image lightbox
- Dashboard
  - Stats: total reported, total resolved
  - Lists: All issues and Resolved (for the logged-in user)
  - Profile panel: mobile, district, municipality; update location, change password, logout
- Admin workflow
  - Select department → select district & municipality → view that municipality’s issues
  - Sorted by popularity (upvotes desc, then newest), see comment counts
- Theming & UX
  - Cohesive green/yellow theme, improved contrast and spacing
  - Skeleton loaders on Feed and Dashboard, in-app toast provider

Tech stack

- Mobile: React Native (Expo 54), React Navigation, Axios, AsyncStorage
- Backend: Node.js, Express 5, Mongoose 8, JWT, Multer, express-validator, CORS, morgan
- Database: MongoDB (tested locally via MongoDB Compass)

Project structure

SIH-project-2/
  backend/
    src/
      config/            # Mongo connection
      controllers/       # Auth, report, location controllers
      middleware/        # JWT auth
      models/            # User, Report (with comments & upvotes)
      routes/            # /auth, /location, /reports
      server.js          # App bootstrap
    uploads/             # Media storage (static-served)
  mobile/
    src/
      api/               # Axios client + token helper
      components/        # Toast, Skeleton, Lightbox
      screens/           # All app screens
      theme/             # Colors (green/yellow)

Data models (MongoDB)

- User
  - mobileNumber (unique), passwordHash
  - district, municipality
- Report
  - user (ref User)
  - text, address, district, municipality, department, status
  - media[]: { type: image|video, filename, mimeType, sizeBytes, url }
  - upvoteCount (number), upvotedBy [User]
  - comments[]: { user (ref User), text, createdAt }
  - Indexes: {user,createdAt}, {district,municipality,createdAt}, {department,district,municipality,upvoteCount,createdAt}

API (summary)

- Auth
  - POST /api/auth/register  { mobileNumber, password }
  - POST /api/auth/login     { mobileNumber, password } → { token, user }
  - POST /api/auth/change-password (auth) { currentPassword, newPassword }
- Location
  - GET  /api/location/districts → [districts]
  - GET  /api/location/municipalities/:district → [municipalities]
  - POST /api/location/set (auth) { district, municipality } → updated user
- Reports
  - GET  /api/reports/stats (auth) → { totalReported, totalResolved }
  - GET  /api/reports/mine  (auth, ?status) → user’s reports
  - POST /api/reports       (auth, multipart form-data: text, address, district, municipality, department, media[])
  - GET  /api/reports/feed  (auth, ?scope=local|all&search=string) → social feed
  - GET  /api/reports/:id/comments (auth)
  - POST /api/reports/:id/comments (auth) { text }
  - POST /api/reports/:id/upvote   (auth)
  - POST /api/reports/:id/unupvote (auth)
- Admin
  - GET  /api/reports/admin/list (auth, department, district, municipality) → popularity-sorted list

Mobile app flows

- Home: choose Admin or User
- User flow
  - Login/Register → (if first time) Location → Tabs (Feed | Report | Dashboard)
  - Feed: Local/All, search by location, upvote, comments, view images
  - Report: compose, add media, select department, submit
  - Dashboard: stats, profile, update location, change password, user issue lists
- Admin flow
  - Department → Location (district/municipality) → Issues sorted by popularity → View comments

Environment & setup

Backend

- Create `backend/.env`:
  - MONGO_URI=mongodb://127.0.0.1:27017/sih
  - JWT_SECRET=your_long_random_secret
  - PORT=5000
  - UPLOAD_DIR=uploads
- Install & run
  - cd backend
  - npm install
  - npm run dev

Mobile (Expo)

- Create `mobile/.env`:
  - EXPO_PUBLIC_API_BASE_URL=http://YOUR_PC_LAN_IP:5000
- Install & run
  - cd mobile
  - npm install
  - npx expo start (press a for Android, or scan QR with Expo Go)

Notes & recommendations

- LAN testing: Ensure phone and PC are on the same Wi-Fi; use the PC’s LAN IP in `EXPO_PUBLIC_API_BASE_URL`.
- Media: uploads are saved under `backend/uploads` and served at `/uploads/<filename>`.
- Security: keep JWT_SECRET private; rotate if leaked.
- Performance: indexes added for common queries; avoid unbounded result sets in production.
- Extensibility ideas: push notifications, map view with clustering, admin assignments, SLA tracking, analytics dashboards.

License

For educational and prototyping use. Add your preferred license here if needed.

