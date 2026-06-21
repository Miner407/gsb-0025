import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Issue, IssueCreateRequest, IssueUpdateRequest, IssueStatus } from '@shared/types';
import {
  STATUS_LABELS,
  CHANNELS,
  DEFAULT_ASSIGNEES,
  PRESET_TAGS,
} from '@shared/types';

interface IssueFormModalProps {
  isOpen: boolean;
  issue: Issue | null;
  existingTags: string[];
  onClose: () => void;
  onSubmit: (data: IssueCreateRequest | IssueUpdateRequest) => void;
}

export const IssueFormModal: React.FC<IssueFormModalProps> = ({
  isOpen,
  issue,
  existingTags,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<IssueCreateRequest>>({
    customerName: '',
    channel: CHANNELS[0],
    description: '',
    tags: [],
    status: 'pending' as IssueStatus,
    assignee: DEFAULT_ASSIGNEES[0],
    solution: '',
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (issue) {
      setFormData({
        customerName: issue.customerName,
        channel: issue.channel,
        description: issue.description,
        tags: issue.tags,
        status: issue.status,
        assignee: issue.assignee,
        solution: issue.solution,
      });
    } else {
      setFormData({
        customerName: '',
        channel: CHANNELS[0],
        description: '',
        tags: [],
        status: 'pending',
        assignee: DEFAULT_ASSIGNEES[0],
        solution: '',
      });
    }
    setErrors({});
    setNewTag('');
  }, [issue, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerName?.trim()) {
      newErrors.customerName = '请输入客户名称';
    }
    if (!formData.channel?.trim()) {
      newErrors.channel = '请选择渠道';
    }
    if (!formData.description?.trim()) {
      newErrors.description = '请输入问题描述';
    }
    if (!formData.assignee?.trim()) {
      newErrors.assignee = '请选择负责人';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: IssueCreateRequest | IssueUpdateRequest = {
      customerName: formData.customerName!,
      channel: formData.channel!,
      description: formData.description!,
      tags: formData.tags!,
      status: formData.status!,
      assignee: formData.assignee!,
      solution: formData.solution || '',
    };

    onSubmit(submitData);
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = formData.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    setFormData({ ...formData, tags: newTags });
  };

  const handleAddCustomTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), trimmedTag],
      });
    }
    setNewTag('');
  };

  const allTags = [...new Set([...PRESET_TAGS, ...existingTags])];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {issue ? '编辑问题' : '新建问题'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                客户名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customerName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入客户名称"
              />
              {errors.customerName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.customerName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                渠道 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.channel}
                onChange={(e) =>
                  setFormData({ ...formData, channel: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.channel ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {CHANNELS.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
              {errors.channel && (
                <p className="text-red-500 text-xs mt-1">{errors.channel}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              问题描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="请详细描述客户遇到的问题"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                    formData.tags?.includes(tag)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                placeholder="输入自定义标签，回车添加"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                添加
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                处理状态
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as IssueStatus,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                负责人 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.assignee}
                onChange={(e) =>
                  setFormData({ ...formData, assignee: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.assignee ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                  {DEFAULT_ASSIGNEES.map((assignee) => (
                    <option key={assignee} value={assignee}>
                      {assignee}
                    </option>
                  ))}
              </select>
              {errors.assignee && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.assignee}
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              解决方案
            </label>
            <textarea
              value={formData.solution}
              onChange={(e) =>
                setFormData({ ...formData, solution: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="请输入问题的解决方案（可选）"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
            >
              {issue ? '保存修改' : '创建问题'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
