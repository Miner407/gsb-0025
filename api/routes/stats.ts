import { Router } from 'express';
import * as issueService from '../services/issueService.js';

const router = Router();

router.get('/unresolved-by-assignee', async (_req, res, next) => {
  try {
    const stats = await issueService.getUnresolvedByAssignee();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

router.get('/hot-tags', async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
    const tags = await issueService.getHotTags(limit);
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

export default router;
