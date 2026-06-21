import * as issueRepository from '../repositories/issueRepository.js';
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

export function getIssues(
  params: IssueQueryParams = {}
): Promise<PaginatedResponse<Issue>> {
  return issueRepository.findAll(params);
}

export function getIssueById(id: number): Promise<Issue | undefined> {
  return issueRepository.findById(id);
}

export function createIssue(data: IssueCreateRequest): Promise<Issue> {
  if (!data.customerName?.trim()) {
    throw new Error('客户名称不能为空');
  }
  if (!data.channel?.trim()) {
    throw new Error('渠道不能为空');
  }
  if (!data.description?.trim()) {
    throw new Error('问题描述不能为空');
  }
  if (!data.assignee?.trim()) {
    throw new Error('负责人不能为空');
  }
  if (!data.status) {
    throw new Error('状态不能为空');
  }

  return issueRepository.create(data);
}

export function updateIssue(
  id: number,
  data: IssueUpdateRequest
): Promise<Issue | undefined> {
  return issueRepository.update(id, data);
}

export function deleteIssue(id: number): Promise<boolean> {
  return issueRepository.remove(id);
}

export function batchUpdateAssignee(
  ids: number[],
  assignee: string
): Promise<number> {
  if (!assignee?.trim()) {
    throw new Error('负责人不能为空');
  }
  return issueRepository.batchUpdateAssignee(ids, assignee);
}

export function batchUpdateStatus(
  ids: number[],
  status: IssueStatus
): Promise<number> {
  if (!status) {
    throw new Error('状态不能为空');
  }
  return issueRepository.batchUpdateStatus(ids, status);
}

export function getUnresolvedByAssignee(): Promise<UnresolvedByAssignee[]> {
  return issueRepository.getUnresolvedByAssignee();
}

export function getHotTags(limit?: number): Promise<HotTag[]> {
  return issueRepository.getHotTags(limit);
}

export function getAllTags(): Promise<string[]> {
  return issueRepository.getAllTags();
}
