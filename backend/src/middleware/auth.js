// getAuth() reads the authentication state that clerkMiddleware() attached to the request.
// For a separate-origin API like ours, getAuth() is the correct choice: it lets us return
// a 401 instead of redirecting (requireAuth() redirects, which suits full-stack apps only).
// Docs: https://clerk.com/docs/reference/express/get-auth
import { getAuth } from "@clerk/express";
import prisma from "../lib/prisma.js";

// Custom Express middleware: any function with (req, res, next).
// It turns the Clerk userId into OUR database user and attaches it to req.user
// so every route handler downstream can read the current user.
// Docs: https://expressjs.com/en/guide/using-middleware.html
export async function attachUser(req, res, next) {
  try {
    const { userId, isAuthenticated } = getAuth(req);

    // Since this API runs on a different origin from the client, we reject
    // unauthenticated requests with a 401 rather than redirecting them.
    // Docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
    if (!isAuthenticated) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    // "Find the user, or create on first request" (lazy user creation) — avoids
    // needing a separate signup webhook just to get a local user row.
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      user = await prisma.user.create({ data: { clerkId: userId } });
    }

    req.user = user;

    // next() passes control to the next handler. Omitting it leaves the request hanging.
    next();
  } catch (err) {
    // Forward errors to the error-handling middleware registered in index.js.
    // Docs: https://expressjs.com/en/guide/error-handling.html
    next(err);
  }
}
