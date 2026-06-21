import { allQuery, getQuery, runQuery } from '../db/index.js';
import type {
  Issue,
  IssueCreateRequest,
  IssueUpdateRequest,
  IssueQueryParams,
  IssueStatus,
  PaginatedResponse,
  UnresolvedByAssignee,
  HotTag,
} from '../../shared/types.js';

interface IssueRow {
  id: number;
  customer_name: string;
  channel: string;
  description: string;
  tags: string;
  status: IssueStatus;
  assignee: string;
  solution: string;
  created_at: string;
  updated_at: string;
}

function mapRowToIssue(row: IssueRow): Issue {
  return {
    id: row.id,
    customerName: row.customer_name,
    channel: row.channel,
    description: row.description,
    tags: JSON.parse(row.tags || '[]'),
    status: row.status,
    assignee: row.assignee,
    solution: row.solution || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findAll(
  params: IssueQueryParams = {}
): Promise<PaginatedResponse<Issue>> {
  const {
    keyword,
    tags,
    status,
    assignee,
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const whereClauses: string[] = [];
  const queryParams: any[] = [];

  if (keyword) {
    whereClauses.push(
      '(customer_name LIKE ? OR description LIKE ? OR solution LIKE ?)'
    );
    const keywordPattern = `%${keyword}%`;
    queryParams.push(keywordPattern, keywordPattern, keywordPattern);
  }

  if (status) {
    whereClauses.push('status = ?');
    queryParams.push(status);
  }

  if (assignee) {
    whereClauses.push('assignee = ?');
    queryParams.push(assignee);
  }

  let whereSql = '';
  if (whereClauses.length > 0) {
    whereSql = 'WHERE ' + whereClauses.join(' AND ');
  }

  const sortColumn =
    sortBy === 'createdAt'
      ? 'created_at'
      : sortBy === 'updatedAt'
      ? 'updated_at'
      : 'status';

  const countSql = `SELECT COUNT(*) as total FROM issues ${whereSql}`;
  const countResult = await getQuery<{ total: number }>(countSql, queryParams);
  const total = countResult?.total || 0;

  const offset = (page - 1) * pageSize;
  const dataSql = `
    SELECT * FROM issues ${whereSql}
    ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}
    LIMIT ? OFFSET ?
  `;
  queryParams.push(pageSize, offset);

  const rows = await allQuery<IssueRow>(dataSql, queryParams);
  let issues = rows.map(mapRowToIssue);

  if (tags && tags.length > 0) {
    issues = issues.filter((issue) =>
      tags.every((tag) => issue.tags.includes(tag))
    );
    const filteredTotal = issues.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    issues = issues.slice(startIndex, endIndex);
    return {
      data: issues,
      total: filteredTotal,
      page,
      pageSize,
    };
  }

  return {
    data: issues,
    total,
    page,
    pageSize,
  };
}

export async function findById(id: number): Promise<Issue | undefined> {
  const sql = 'SELECT * FROM issues WHERE id = ?';
  const row = await getQuery<IssueRow>(sql, [id]);
  return row ? mapRowToIssue(row) : undefined;
}

export async function create(data: IssueCreateRequest): Promise<Issue> {
  const sql = `
    INSERT INTO issues (customer_name, channel, description, tags, status, assignee, solution)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await runQuery(sql, [
    data.customerName,
    data.channel,
    data.description,
    JSON.stringify(data.tags),
    data.status,
    data.assignee,
    data.solution || '',
  ]);

  const issue = await findById(result.lastID);
  if (!issue) {
    throw new Error('Failed to create issue');
  }
  return issue;
}

export async function update(
  id: number,
  data: IssueUpdateRequest
): Promise<Issue | undefined> {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.customerName !== undefined) {
    fields.push('customer_name = ?');
    values.push(data.customerName);
  }
  if (data.channel !== undefined) {
    fields.push('channel = ?');
    values.push(data.channel);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }
  if (data.tags !== undefined) {
    fields.push('tags = ?');
    values.push(JSON.stringify(data.tags));
  }
  if (data.status !== undefined) {
    fields.push('status = ?');
    values.push(data.status);
  }
  if (data.assignee !== undefined) {
    fields.push('assignee = ?');
    values.push(data.assignee);
  }
  if (data.solution !== undefined) {
    fields.push('solution = ?');
    values.push(data.solution);
  }

  fields.push("updated_at = datetime('now')");
  values.push(id);

  const sql = `UPDATE issues SET ${fields.join(', ')} WHERE id = ?`;
  await runQuery(sql, values);

  return findById(id);
}

export async function remove(id: number): Promise<boolean> {
  const sql = 'DELETE FROM issues WHERE id = ?';
  const result = await runQuery(sql, [id]);
  return result.changes > 0;
}

export async function batchUpdateAssignee(
  ids: number[],
  assignee: string
): Promise<number> {
  if (ids.length === 0) return 0;

  const placeholders = ids.map(() => '?').join(', ');
  const sql = `
    UPDATE issues
    SET assignee = ?, updated_at = datetime('now')
    WHERE id IN (${placeholders})
  `;
  const params = [assignee, ...ids];
  const result = await runQuery(sql, params);
  return result.changes;
}

export async function batchUpdateStatus(
  ids: number[],
  status: IssueStatus
): Promise<number> {
  if (ids.length === 0) return 0;

  const placeholders = ids.map(() => '?').join(', ');
  const sql = `
    UPDATE issues
    SET status = ?, updated_at = datetime('now')
    WHERE id IN (${placeholders})
  `;
  const params = [status, ...ids];
  const result = await runQuery(sql, params);
  return result.changes;
}

export async function getUnresolvedByAssignee(): Promise<UnresolvedByAssignee[]> {
  const sql = `
    SELECT assignee, COUNT(*) as count
    FROM issues
    WHERE status IN ('pending', 'processing')
    GROUP BY assignee
    ORDER BY count DESC
  `;
  const rows = await allQuery<{ assignee: string; count: number }>(sql, []);
  return rows.map((row) => ({
    assignee: row.assignee,
    count: row.count,
  }));
}

export async function getHotTags(limit: number = 15): Promise<HotTag[]> {
  const sql = 'SELECT tags FROM issues';
  const rows = await allQuery<{ tags: string }>(sql, []);

  const tagCount: Record<string, number> = {};
  rows.forEach((row) => {
    const tags: string[] = JSON.parse(row.tags || '[]');
    tags.forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  const hotTags: HotTag[] = Object.entries(tagCount)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return hotTags;
}

export async function getAllTags(): Promise<string[]> {
  const sql = 'SELECT tags FROM issues';
  const rows = await allQuery<{ tags: string }>(sql, []);

  const tagSet = new Set<string>();
  rows.forEach((row) => {
    const tags: string[] = JSON.parse(row.tags || '[]');
    tags.forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}
