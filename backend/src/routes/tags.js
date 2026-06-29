import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// TODO for students: implement the Tags CRUD routes.
// Use links.js and collections.js as your reference — the patterns are identical.
//
// Every handler must scope queries by req.user.id (set in attachUser middleware),
// so a user only ever touches their own tags.
//
// 1. GET '/'        -> READ all tags for the user.
//    Hint: prisma.tag.findMany({ where: { userId: req.user.id }, orderBy: { name: 'asc' } })
//
// 2. POST '/'       -> CREATE a tag from req.body.name. Respond 201 with the new tag.
//    Hint: validate the name is non-empty first (return 400 if missing).
//          prisma.tag.create({ data: { name, userId: req.user.id } })
//
// 3. PUT '/:id'     -> UPDATE (rename) a tag. Read the id from req.params.
//    Hint: check ownership with prisma.tag.findFirst({ where: { id, userId: req.user.id } })
//          and return 404 if not found, before prisma.tag.update(...).
//
// 4. DELETE '/:id'  -> DELETE a tag. Check ownership the same way, then prisma.tag.delete(...).
//
// Docs you'll need:
// - CRUD operations: https://www.prisma.io/docs/orm/prisma-client/queries/crud
// - Route params (req.params): https://expressjs.com/en/guide/routing.html#route-parameters
// - HTTP status codes (201/400/404): https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
//
// Once these work, the Tags page on the frontend will start showing data.

export default router;
