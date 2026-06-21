import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, RotateCcw } from 'lucide-react';
import type { IssueQueryParams, IssueStatus } from '@shared/types';
import { STATUS_LABELS, PRESET_TAGS, DEFAULT_ASSIGNEES } from '@shared/types';

interface FilterBarProps {
  queryParams: IssueQueryParams;
  allTags: string[];
  onFilterChange: (params: Partial<IssueQueryParams>) => void;
  onReset: () => void;
  onNewIssue: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  queryParams,
  allTags,
  onFilterChange,
  onReset,
  onNewIssue,
}) => {
  const [keyword, setKeyword] = useState(queryParams.keyword || '');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(e.target as Node)
      ) {
        setShowTagDropdown(false);
      }
      if (
        assigneeDropdownRef.current &&
        !assigneeDropdownRef.current.contains(e.target as Node)
      ) {
        setShowAssigneeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ keyword: keyword.trim() || undefined });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = queryParams.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    onFilterChange({ tags: newTags.length > 0 ? newTags : undefined });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({
      status: status ? (status as IssueStatus) : undefined,
    });
  };

  const handleAssigneeChange = (assignee: string) => {
    onFilterChange({ assignee: assignee || undefined });
    setShowAssigneeDropdown(false);
  };

  const availableTags = [...new Set([...PRESET_TAGS, ...allTags])];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索客户名称、问题描述、解决方案..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => {
                  setKeyword('');
                  onFilterChange({ keyword: undefined });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative" ref={tagDropdownRef}>
            <button
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm text-gray-700">
                标签筛选
                {queryParams.tags?.length
                  ? ` (${queryParams.tags.length})`
                  : ''}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            {showTagDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                <div className="p-2">
                  {availableTags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={queryParams.tags?.includes(tag) || false}
                        onChange={() => handleTagToggle(tag)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <select
            value={queryParams.status || ''}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm text-gray-700"
          >
            <option value="">全部状态</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <div className="relative" ref={assigneeDropdownRef}>
            <button
              onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-[140px]"
            >
              <span className="text-sm text-gray-700">
                {queryParams.assignee || '选择负责人'}
              </span>
              <ChevronDown size={16} className="text-gray-400 ml-auto" />
            </button>
            {showAssigneeDropdown && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleAssigneeChange('')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  全部负责人
                </button>
                {DEFAULT_ASSIGNEES.map((assignee) => (
                  <button
                    key={assignee}
                    onClick={() => handleAssigneeChange(assignee)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                      queryParams.assignee === assignee
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {assignee}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
            <span className="text-sm">重置</span>
          </button>

          <button
            onClick={onNewIssue}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
          >
            <span className="text-lg leading-none">+</span>
            新建问题
          </button>
        </div>
      </div>

      {queryParams.tags && queryParams.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">已选标签：</span>
          {queryParams.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
            >
              {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="hover:text-blue-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
