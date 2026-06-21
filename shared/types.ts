export type IssueStatus = 'pending' | 'processing' | 'resolved' | 'closed';

export const STATUS_LABELS: Record<IssueStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭',
};

export const STATUS_COLORS: Record<IssueStatus, string> = {
  pending: 'bg-red-100 text-red-800',
  processing: 'bg-amber-100 text-amber-800',
  resolved: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-gray-100 text-gray-800',
};

export interface Issue {
  id: number;
  customerName: string;
  channel: string;
  description: string;
  tags: string[];
  status: IssueStatus;
  assignee: string;
  solution: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueCreateRequest {
  customerName: string;
  channel: string;
  description: string;
  tags: string[];
  status: IssueStatus;
  assignee: string;
  solution?: string;
}

export interface IssueUpdateRequest {
  customerName?: string;
  channel?: string;
  description?: string;
  tags?: string[];
  status?: IssueStatus;
  assignee?: string;
  solution?: string;
}

export interface IssueQueryParams {
  keyword?: string;
  tags?: string[];
  status?: IssueStatus;
  assignee?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BatchUpdateAssigneeRequest {
  ids: number[];
  assignee: string;
}

export interface BatchUpdateStatusRequest {
  ids: number[];
  status: IssueStatus;
}

export interface UnresolvedByAssignee {
  assignee: string;
  count: number;
}

export interface HotTag {
  tag: string;
  count: number;
}

export const CHANNELS = ['电话', '在线客服', '邮件', 'APP反馈', '微信公众号', '其他'];

export const DEFAULT_ASSIGNEES = ['李四', '赵六', '钱七', '孙八', '周九'];

export const PRESET_TAGS = [
  '账户问题',
  '认证',
  '支付',
  '订单',
  '退款',
  '优惠券',
  '促销',
  '配送',
  '账户',
  '系统故障',
  '使用咨询',
  '功能建议',
  '投诉',
  '表扬',
];
