import { create } from 'zustand';
import type {
  Issue,
  IssueQueryParams,
  PaginatedResponse,
  UnresolvedByAssignee,
  HotTag,
  IssueCreateRequest,
  IssueUpdateRequest,
} from '@shared/types';
import * as api from '../utils/api';

interface IssueState {
  issues: Issue[];
  total: number;
  loading: boolean;
  error: string | null;
  queryParams: IssueQueryParams;
  selectedIds: number[];
  unresolvedStats: UnresolvedByAssignee[];
  hotTags: HotTag[];
  allTags: string[];
  fetchIssues: (params?: IssueQueryParams) => Promise<void>;
  createIssue: (data: IssueCreateRequest) => Promise<Issue>;
  updateIssue: (id: number, data: IssueUpdateRequest) => Promise<Issue>;
  deleteIssue: (id: number) => Promise<void>;
  batchUpdateAssignee: (ids: number[], assignee: string) => Promise<void>;
  batchUpdateStatus: (ids: number[], status: any) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchTags: () => Promise<void>;
  setQueryParams: (params: Partial<IssueQueryParams>) => void;
  toggleSelect: (id: number) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  resetFilters: () => void;
}

export const useIssueStore = create<IssueState>((set, get) => ({
  issues: [],
  total: 0,
  loading: false,
  error: null,
  queryParams: {
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  selectedIds: [],
  unresolvedStats: [],
  hotTags: [],
  allTags: [],

  fetchIssues: async (params?: IssueQueryParams) => {
    set({ loading: true, error: null });
    try {
      const currentParams = get().queryParams;
      const mergedParams = { ...currentParams, ...params };
      const result: PaginatedResponse<Issue> = await api.fetchIssues(
        mergedParams
      );
      set({
        issues: result.data,
        total: result.total,
        queryParams: mergedParams,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '加载失败',
        loading: false,
      });
    }
  },

  createIssue: async (data: IssueCreateRequest) => {
    const issue = await api.createIssue(data);
    get().fetchIssues();
    return issue;
  },

  updateIssue: async (id: number, data: IssueUpdateRequest) => {
    const issue = await api.updateIssue(id, data);
    get().fetchIssues();
    get().fetchStats();
    return issue;
  },

  deleteIssue: async (id: number) => {
    await api.deleteIssue(id);
    get().fetchIssues();
    get().fetchStats();
  },

  batchUpdateAssignee: async (ids: number[], assignee: string) => {
    await api.batchUpdateAssignee({ ids, assignee });
    get().fetchIssues();
    get().fetchStats();
    set({ selectedIds: [] });
  },

  batchUpdateStatus: async (ids: number[], status: any) => {
    await api.batchUpdateStatus({ ids, status });
    get().fetchIssues();
    get().fetchStats();
    set({ selectedIds: [] });
  },

  fetchStats: async () => {
    try {
      const [unresolvedStats, hotTags] = await Promise.all([
        api.fetchUnresolvedByAssignee(),
        api.fetchHotTags(15),
      ]);
      set({ unresolvedStats, hotTags });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  },

  fetchTags: async () => {
    try {
      const tags = await api.fetchAllTags();
      set({ allTags: tags });
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  },

  setQueryParams: (params: Partial<IssueQueryParams>) => {
    const currentParams = get().queryParams;
    const newParams = { ...currentParams, ...params };
    if (params.keyword !== undefined || params.tags !== undefined || params.status !== undefined || params.assignee !== undefined) {
      newParams.page = 1;
    }
    set({ queryParams: newParams });
    get().fetchIssues(newParams);
  },

  toggleSelect: (id: number) => {
    const selectedIds = get().selectedIds;
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    set({ selectedIds: newSelected });
  },

  toggleSelectAll: () => {
    const { issues, selectedIds } = get();
    const issueIds = issues.map((i) => i.id);
    const allSelected = issueIds.every((id) => selectedIds.includes(id));
    set({ selectedIds: allSelected ? [] : issueIds });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  resetFilters: () => {
    const defaultParams: IssueQueryParams = {
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    set({ queryParams: defaultParams, selectedIds: [] });
    get().fetchIssues(defaultParams);
  },
}));
