// Router groups related routes so we can mount them under one base path
// (mounted at /api/links in index.js).
// Docs: https://expressjs.com/en/4x/api.html#router
import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// Helper: convert tag NAMES into tag IDS, creating any that don't exist yet.
// Centralized (DRY) because both POST and PATCH need identical logic.
async function resolveTagIds(userId, tagNames) {
  const ids = [];
  for (const name of tagNames) {
    // findFirst: we filter on a non-unique field (name scoped to a user).
    // Docs: https://www.prisma.io/docs/orm/prisma-client/queries/crud#get-the-first-record-that-matches-a-specific-criteria
    let tag = await prisma.tag.findFirst({ where: { userId, name } });
    if (!tag) {
      tag = await prisma.tag.create({ data: { name, userId } });
    }
    ids.push(tag.id);
  }
  return ids;
}

// GET /api/links -> READ. Query params let one endpoint serve several views.
// req.query holds the parsed ?key=value pairs from the URL.
// Docs: https://expressjs.com/en/api.html#req.query
router.get("/", async (req, res) => {
  const { favorite, collectionId } = req.query;

  // Always scope by req.user.id so a user only ever sees their own data.
  const where = { userId: req.user.id };
  if (favorite === "true") where.favorite = true;
  if (collectionId) where.collectionId = collectionId;

  // include pulls in the related tags (a "nested read" / eager load).
  // Docs: https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#nested-reads
  const links = await prisma.link.findMany({
    where,
    include: { tags: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(links);
});

// POST /api/links -> CREATE. Body is parsed by express.json() into req.body.
// 201 Created is the correct status for a successful resource creation.
// Docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201
router.post("/", async (req, res) => {
  const { url, notes, collectionId, tags = [] } = req.body;
  const tagIds = await resolveTagIds(req.user.id, tags);

  const link = await prisma.link.create({
    data: {
      url,
      notes,
      collectionId: collectionId || null,
      userId: req.user.id,
      // connect attaches existing related records (the tags) to this new link.
      // Docs: https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#connect-an-existing-record
      tags: { connect: tagIds.map((id) => ({ id })) },
    },
    include: { tags: true },
  });

  res.status(201).json(link);
});

// PATCH /api/links/:id -> UPDATE (partial). ":id" is a route param, read via req.params.
// PATCH means "modify only the fields sent" (vs PUT, which replaces the whole resource).
// Route params: https://expressjs.com/en/guide/routing.html#route-parameters
// PATCH vs PUT: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { url, notes, collectionId, favorite, tags } = req.body;

  // Ownership check before any write.
  const existing = await prisma.link.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!existing) return res.status(404).json({ message: "Link not found" });

  // Build the update only from fields actually provided
  // (undefined => client omitted it => leave unchanged).
  const data = {};
  if (url !== undefined) data.url = url;
  if (notes !== undefined) data.notes = notes;
  if (collectionId !== undefined) data.collectionId = collectionId || null;
  if (favorite !== undefined) data.favorite = favorite;
  if (tags !== undefined) {
    const tagIds = await resolveTagIds(req.user.id, tags);
    // set REPLACES the entire tags relation with exactly this list.
    // Docs: https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#set-a-specific-set-of-related-records
    data.tags = { set: tagIds.map((id) => ({ id })) };
  }

  const link = await prisma.link.update({
    where: { id },
    data,
    include: { tags: true },
  });

  res.json(link);
});

// DELETE /api/links/:id -> DELETE. Returns the id so the client can drop it from state.
// Docs: https://www.prisma.io/docs/orm/prisma-client/queries/crud#delete-a-single-record
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.link.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!existing) return res.status(404).json({ message: "Link not found" });

  await prisma.link.delete({ where: { id } });
  res.json({ id });
});

export default router;
