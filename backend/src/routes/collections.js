import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// GET /api/collections -> READ all of the user's collections.
router.get("/", async (req, res) => {
  const collections = await prisma.collection.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(collections);
});

// POST /api/collections -> CREATE.
router.post("/", async (req, res) => {
  const { name } = req.body;
  const collection = await prisma.collection.create({
    data: { name, userId: req.user.id },
  });
  res.status(201).json(collection);
});

// PUT /api/collections/:id -> UPDATE (full replace).
// A collection has only one editable field (name), so replacing it wholesale
// with PUT is natural here. PATCH would also be acceptable.
// Docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const existing = await prisma.collection.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!existing)
    return res.status(404).json({ message: "Collection not found" });

  const collection = await prisma.collection.update({
    where: { id },
    data: { name },
  });
  res.json(collection);
});

// DELETE /api/collections/:id -> DELETE.
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.collection.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!existing)
    return res.status(404).json({ message: "Collection not found" });

  // Detach links first so they don't point at a collection id that no longer exists.
  // updateMany edits all matching rows in one query.
  // Docs: https://www.prisma.io/docs/orm/prisma-client/queries/crud#update-multiple-records
  await prisma.link.updateMany({
    where: { collectionId: id },
    data: { collectionId: null },
  });
  await prisma.collection.delete({ where: { id } });

  res.json({ id });
});

export default router;
