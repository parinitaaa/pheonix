# Run Instructions for PHEONIX Project

---

## 📋 Prerequisites
- **Node.js** ≥ 20 (LTS) – install from https://nodejs.org/
- **npm** (comes with Node) or **yarn**
- **MongoDB** – local instance or Atlas connection string
- **Git** – to clone the repository (if not already present)
- **Optional**: Visual Studio Code for a richer development experience

---

## 🛠️ Backend Setup
1. Open a terminal and navigate to the project root, then into the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a local `.env` file (or copy the example) and fill in the required values:
   ```bash
   cp .env.example .env   # if an example exists; otherwise edit the existing .env
   ```
   Essential variables are:
   - `ADMIN_EMAIL` – admin login email
   - `ADMIN_PASSWORD` – admin login password
   - `JWT_SECRET` – secret for token signing
   - `MONGO_URI` – MongoDB connection string (e.g., `mongodb://localhost:27017/infinity-ecommerce`)
   - `PORT` – port the API will listen on (default **5000**)
4. (Optional) Seed the database with sample data:
   ```bash
   npm run seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   The backend will be reachable at **http://localhost:5000**.

---

## 💻 Frontend Setup
1. Open a new terminal window/tab and navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install UI dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (or copy the example) and point it to the backend API:
   ```bash
   cp .env.example .env   # if an example exists
   ```
   Then edit the file so it contains:
   ```text
   VITE_API_URL=http://localhost:5000/api
   ```
   Adjust the URL/port if you changed the backend configuration.
4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be served at **http://localhost:5173** (default Vite port).

---

## ✅ Quick Verification
- **Backend**: Run `curl http://localhost:5000/api/health` – you should receive a JSON response like `{ "status": "OK", "message": "INFINITY API running" }`.
- **Frontend**: Open the URL printed by `npm run dev` (usually http://localhost:5173) in a browser. The app should load without console errors and be able to fetch data from the backend.

---

## ⚠️ Common Gotchas
- **MongoDB connectivity** – ensure the `MONGO_URI` points to a reachable database and that the user has read/write permissions.
- **Port conflicts** – if another process uses `5000` or `5173`, modify the respective `.env` files and restart the servers.
- **Environment variables** – missing or miss‑typed variables cause the server to crash on start; double‑check your `.env` files.
- **CORS** – the backend is configured to allow requests from `http://localhost:5173` and the URL set in `FRONTEND_URL`. Keep this in sync if you change ports.

---

## 📦 Production Build (Optional)
When you are ready to ship:
```bash
# Backend (if a build script is defined; otherwise just deploy the source)
npm run build   # may be a custom script, otherwise skip

# Frontend
npm run build   # creates ./dist for static hosting
```
Deploy the `backend` folder to a Node‑compatible host and serve the generated `frontend/dist` directory via a reverse‑proxy (e.g., Nginx) or a static‑file CDN.

---

*Happy coding! 🚀*
