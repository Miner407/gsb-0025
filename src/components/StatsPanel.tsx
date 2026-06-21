import React from 'react';
import { AlertTriangle, TrendingUp, Users, Tag } from 'lucide-react';
import type { UnresolvedByAssignee, HotTag } from '@shared/types';

interface StatsPanelProps {
  unresolvedStats: UnresolvedByAssignee[];
  hotTags: HotTag[];
  totalUnresolved: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  unresolvedStats,
  hotTags,
  totalUnresolved,
}) => {
  const maxCount = Math.max(...unresolvedStats.map((s) => s.count), 1);
  const maxTagCount = Math.max(...hotTags.map((t) => t.count), 1);

  const getTagColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-emerald-100 text-emerald-800',
      'bg-amber-100 text-amber-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-cyan-100 text-cyan-800',
      'bg-orange-100 text-orange-800',
      'bg-indigo-100 text-indigo-800',
    ];
    return colors[index % colors.length];
  };

  const getTagSize = (count: number) => {
    const ratio = count / maxTagCount;
    if (ratio >= 0.8) return 'text-lg font-bold py-2 px-3';
    if (ratio >= 0.5) return 'text-base font-semibold py-1.5 px-2.5';
    if (ratio >= 0.3) return 'text-sm font-medium py-1 px-2';
    return 'text-xs py-1 px-2';
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-blue-100 text-sm">未解决问题总数</p>
            <p className="text-3xl font-bold">{totalUnresolved}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-gray-500" />
          <h3 className="font-semibold text-gray-800">按负责人统计</h3>
        </div>
        <div className="space-y-3">
          {unresolvedStats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">暂无数据</p>
          ) : (
            unresolvedStats.map((stat) => (
              <div key={stat.assignee}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{stat.assignee}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stat.count} 个
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${(stat.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Tag size={18} className="text-gray-500" />
          <h3 className="font-semibold text-gray-800">高频问题标签</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {hotTags.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4 w-full">暂无数据</p>
          ) : (
            hotTags.map((hotTag, index) => (
              <span
                key={hotTag.tag}
                className={`inline-flex items-center gap-1 rounded-full ${getTagColor(
                  index
                )} ${getTagSize(hotTag.count)} transition-transform hover:scale-105 cursor-default`}
              >
                <span>{hotTag.tag}</span>
                <span className="opacity-70">({hotTag.count})</span>
              </span>
            ))
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-emerald-100 text-sm">问题总数</p>
            <p className="text-2xl font-bold">
              {hotTags.reduce((sum, t) => sum + t.count, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
