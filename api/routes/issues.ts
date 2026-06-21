import { Router } from 'express';
import * as issueService from '../services/issueService.js';
import type {
  IssueCreateRequest,
  IssueUpdateRequest,
  IssueQueryParams,
  BatchUpdateAssigneeRequest,
  BatchUpdateStatusRequest,
} from '../../shared/types.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const params: IssueQueryParams = {};

    if (req.query.keyword) {
      params.keyword = String(req.query.keyword);
    }
    if (req.query.tags) {
      const tagsStr = String(req.query.tags);
      params.tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (req.query.status) {
      params.status = req.query.status as IssueQueryParams['status'];
    }
    if (req.query.assignee) {
      params.assignee = String(req.query.assignee);
    }
    if (req.query.page) {
      params.page = parseInt(String(req.query.page), 10);
    }
    if (req.query.pageSize) {
      params.pageSize = parseInt(String(req.query.pageSize), 10);
    }
    if (req.query.sortBy) {
      params.sortBy = req.query.sortBy as IssueQueryParams['sortBy'];
    }
    if (req.query.sortOrder) {
      params.sortOrder = req.query.sortOrder as IssueQueryParams['sortOrder'];
    }

    const result = await issueService.getIssues(params);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const issue = await issueService.getIssueById(id);

    if (!issue) {
      res.status(404).json({ error: '问题不存在' });
      return;
    }

    res.json(issue);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = req.body as IssueCreateRequest;
    const issue = await issueService.createIssue(data);
    res.status(201).json(issue);
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      next(err);
    }
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body as IssueUpdateRequest;
    const issue = await issueService.updateIssue(id, data);

    if (!issue) {
      res.status(404).json({ error: '问题不存在' });
      return;
    }

    res.json(issue);
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      next(err);
    }
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const success = await issueService.deleteIssue(id);

    if (!success) {
      res.status(404).json({ error: '问题不存在' });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.patch('/batch/assignee', async (req, res, next) => {
  try {
    const { ids, assignee } = req.body as BatchUpdateAssigneeRequest;
    const updated = await issueService.batchUpdateAssignee(ids, assignee);
    res.json({ updated });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      next(err);
    }
  }
});

router.patch('/batch/status', async (req, res, next) => {
  try {
    const { ids, status } = req.body as BatchUpdateStatusRequest;
    const updated = await issueService.batchUpdateStatus(ids, status);
    res.json({ updated });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      next(err);
    }
  }
});

export default router;
