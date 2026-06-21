import React, { useState, useRef, useEffect } from 'react';
import { Users, CheckCircle2, X } from 'lucide-react';
import type { IssueStatus } from '@shared/types';
import { STATUS_LABELS, DEFAULT_ASSIGNEES } from '@shared/types';

interface BatchActionBarProps {
  selectedCount: number;
  onBatchUpdateAssignee: (assignee: string) => void;
  onBatchUpdateStatus: (status: IssueStatus) => void;
  onClearSelection: () => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  onBatchUpdateAssignee,
  onBatchUpdateStatus,
  onClearSelection,
}) => {
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        assigneeDropdownRef.current &&
        !assigneeDropdownRef.current.contains(e.target as Node)
      ) {
        setShowAssigneeDropdown(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target as Node)
      ) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-sm text-blue-800">
          已选择 <span className="font-semibold">{selectedCount}</span> 条记录
        </span>
        <button
          onClick={onClearSelection}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <X size={14} />
          取消选择
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative" ref={assigneeDropdownRef}>
          <button
            onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors"
          >
            <Users size={16} />
            批量分配负责人
          </button>
          {showAssigneeDropdown && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              {DEFAULT_ASSIGNEES.map((assignee) => (
                <button
                key={assignee}
                onClick={() => {
                  onBatchUpdateAssignee(assignee);
                  setShowAssigneeDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50"
              >
                {assignee}
              </button>
            ))}
            </div>
          )}
        </div>

        <div className="relative" ref={statusDropdownRef}>
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors"
          >
            <CheckCircle2 size={16} />
            批量修改状态
          </button>
          {showStatusDropdown && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    onBatchUpdateStatus(value as IssueStatus);
                    setShowStatusDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
