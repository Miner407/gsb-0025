import React from 'react';
import { Edit2, Trash2, User, Calendar, MessageSquare } from 'lucide-react';
import type { Issue } from '@shared/types';
import { STATUS_LABELS, STATUS_COLORS } from '@shared/types';

interface IssueCardProps {
  issue: Issue;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onEdit: (issue: Issue) => void;
  onDelete: (id: number) => void;
  index: number;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  index,
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-100 hover:border-gray-200'
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(issue.id)}
          className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">
                {issue.customerName}
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {issue.channel}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[issue.status]}`}
              >
                {STATUS_LABELS[issue.status]}
              </span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(issue)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="编辑"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(issue.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="删除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {issue.description}
          </p>

          {issue.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {issue.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {issue.solution && (
            <div className="bg-emerald-50 border border-emerald-200 rounded p-2 mb-3">
              <p className="text-xs text-emerald-800">
                <span className="font-medium">解决方案：</span>
                {issue.solution}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User size={12} />
              {issue.assignee}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(issue.createdAt)}
            </span>
            {issue.updatedAt !== issue.createdAt && (
              <span className="flex items-center gap-1">
                <MessageSquare size={12} />
                更新于 {formatDate(issue.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
