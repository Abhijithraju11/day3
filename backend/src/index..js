// Express: the web framework handling routing, requests and responses.
// Docs: https://expressjs.com/en/starter/hello-world.html
import express from "express";

// CORS: lets our frontend (localhost:5173) call this API (localhost:3000).
// Browsers block cross-origin requests by default; this opts in.
// Docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
import cors from "cors";

// clerkMiddleware attaches auth state to every request. We deliberately do NOT use
// requireAuth() here: it redirects unauthenticated users, which is meant for full-stack
// apps. For a separate-origin API we check auth ourselves (in attachUser) and return 401.
// Docs: https://clerk.com/docs/reference/express/clerk-middleware
import { clerkMiddleware } from "@clerk/express";

import { attachUser } from "./middleware/auth.js";
import linksRouter from "./routes/links.js";
import collectionsRouter from "./routes/collections.js";
import tagsRouter from "./routes/tags.js";

const app = express();

// Global middleware (runs on every request, in order)
app.use(cors());

// Parses JSON request bodies onto req.body. Without it, req.body is undefined on POST/PATCH/PUT.
// Docs: https://expressjs.com/en/api.html#express.json
app.use(express.json());

// Must run before routes so getAuth() works inside them. clerkMiddleware() should be
// set before other middleware that depends on auth state.
app.use(clerkMiddleware());

// attachUser runs first on each group: it enforces auth (401 if missing) and loads req.user,
// then the router handles the request. Mounting at a base path means handlers use relative
// paths (router.get('/') here answers GET /api/links).
app.use("/api/links", attachUser, linksRouter);
app.use("/api/collections", attachUser, collectionsRouter);
app.use("/api/tags", attachUser, tagsRouter);

// Error-handling middleware has FOUR args (err first); Express identifies it by arity
// and routes any next(err) here. Register it LAST.
// Docs: https://expressjs.com/en/guide/error-handling.html
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

// process.env.PORT comes from .env, loaded via the --env-file flag in package.json scripts.
// Docs: https://nodejs.org/api/cli.html#--env-fileconfig
const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`),
);
