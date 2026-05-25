import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, keywordsTable } from "@workspace/db";
import {
  CreateKeywordBody,
  DeleteKeywordParams,
  ListKeywordsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/keywords", async (req, res): Promise<void> => {
  const keywords = await db
    .select()
    .from(keywordsTable)
    .orderBy(keywordsTable.createdAt);
  res.json(ListKeywordsResponse.parse(keywords));
});

router.post("/keywords", async (req, res): Promise<void> => {
  const parsed = CreateKeywordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [keyword] = await db
    .insert(keywordsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(keyword);
});

router.delete("/keywords/:id", async (req, res): Promise<void> => {
  const params = DeleteKeywordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(keywordsTable)
    .where(eq(keywordsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Keyword not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
