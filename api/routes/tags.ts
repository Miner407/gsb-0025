import { Router } from 'express';
import * as issueService from '../services/issueService.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const tags = await issueService.getAllTags();
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

export default router;
