import type {
  Issue,
  IssueCreateRequest,
  IssueUpdateRequest,
  IssueQueryParams,
  PaginatedResponse,
  BatchUpdateAssigneeRequest,
  BatchUpdateStatusRequest,
  UnresolvedByAssignee,
  HotTag,
} from '@shared/types';

const API_BASE = '/api';

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      if (value.length > 0) {
        searchParams.append(key, value.join(','));
      }
    } else {
      searchParams.append(key, String(value));
    }
  });
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function fetchIssues(
  params: IssueQueryParams = {}
): Promise<PaginatedResponse<Issue>> {
  const queryString = buildQueryString(params);
  const response = await fetch(`${API_BASE}/issues${queryString}`);
  return handleResponse(response);
}

export async function fetchIssue(id: number): Promise<Issue> {
  const response = await fetch(`${API_BASE}/issues/${id}`);
  return handleResponse(response);
}

export async function createIssue(data: IssueCreateRequest): Promise<Issue> {
  const response = await fetch(`${API_BASE}/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateIssue(
  id: number,
  data: IssueUpdateRequest
): Promise<Issue> {
  const response = await fetch(`${API_BASE}/issues/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteIssue(id: number): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/issues/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

export async function batchUpdateAssignee(
  data: BatchUpdateAssigneeRequest
): Promise<{ updated: number }> {
  const response = await fetch(`${API_BASE}/issues/batch/assignee`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function batchUpdateStatus(
  data: BatchUpdateStatusRequest
): Promise<{ updated: number }> {
  const response = await fetch(`${API_BASE}/issues/batch/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function fetchUnresolvedByAssignee(): Promise<
  UnresolvedByAssignee[]
> {
  const response = await fetch(`${API_BASE}/stats/unresolved-by-assignee`);
  return handleResponse(response);
}

export async function fetchHotTags(limit?: number): Promise<HotTag[]> {
  const queryString = limit ? `?limit=${limit}` : '';
  const response = await fetch(`${API_BASE}/stats/hot-tags${queryString}`);
  return handleResponse(response);
}

export async function fetchAllTags(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/tags`);
  return handleResponse(response);
}
