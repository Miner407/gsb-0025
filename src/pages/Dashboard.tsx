import React, { useEffect, useState } from 'react';
import { LayoutDashboard, RefreshCw, AlertCircle } from 'lucide-react';
import { useIssueStore } from '../store/useIssueStore';
import { FilterBar } from '../components/FilterBar';
import { IssueCard } from '../components/IssueCard';
import { StatsPanel } from '../components/StatsPanel';
import { BatchActionBar } from '../components/BatchActionBar';
import { IssueFormModal } from '../components/IssueFormModal';
import { Pagination } from '../components/Pagination';
import type { Issue, IssueCreateRequest, IssueUpdateRequest, IssueStatus } from '@shared/types';

export const Dashboard: React.FC = () => {
  const {
    issues,
    total,
    loading,
    error,
    queryParams,
    selectedIds,
    unresolvedStats,
    hotTags,
    allTags,
    fetchIssues,
    createIssue,
    updateIssue,
    deleteIssue,
    batchUpdateAssignee,
    batchUpdateStatus,
    fetchStats,
    fetchTags,
    setQueryParams,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    resetFilters,
  } = useIssueStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

  useEffect(() => {
    fetchIssues();
    fetchStats();
    fetchTags();
  }, []);

  const totalUnresolved = unresolvedStats.reduce((sum, s) => sum + s.count, 0);
  const totalPages = Math.ceil(total / (queryParams.pageSize || 10));

  const handleNewIssue = () => {
    setEditingIssue(null);
    setIsModalOpen(true);
  };

  const handleEditIssue = (issue: Issue) => {
    setEditingIssue(issue);
    setIsModalOpen(true);
  };

  const handleDeleteIssue = async (id: number) => {
    if (window.confirm('确定要删除这个问题吗？')) {
      await deleteIssue(id);
    }
  };

  const handleFormSubmit = async (data: IssueCreateRequest | IssueUpdateRequest) => {
    try {
      if (editingIssue) {
        await updateIssue(editingIssue.id, data as IssueUpdateRequest);
      } else {
        await createIssue(data as IssueCreateRequest);
      }
      setIsModalOpen(false);
      fetchStats();
      fetchTags();
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleBatchUpdateAssignee = async (assignee: string) => {
    if (window.confirm(`确定将选中的 ${selectedIds.length} 条记录分配给 ${assignee}？`)) {
      await batchUpdateAssignee(selectedIds, assignee);
    }
  };

  const handleBatchUpdateStatus = async (status: IssueStatus) => {
    if (window.confirm(`确定修改选中的 ${selectedIds.length} 条记录的状态？`)) {
      await batchUpdateStatus(selectedIds, status);
    }
  };

  const handleRefresh = () => {
    fetchIssues();
    fetchStats();
    fetchTags();
  };

  const allSelected = issues.length > 0 && issues.every((i) => selectedIds.includes(i.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <LayoutDashboard size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">客服问题标签归档看板</h1>
                <p className="text-xs text-gray-500">Customer Service Issue Archive Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span className="text-sm">刷新</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <FilterBar
              queryParams={queryParams}
              allTags={allTags}
              onFilterChange={setQueryParams}
              onReset={resetFilters}
              onNewIssue={handleNewIssue}
            />

            <BatchActionBar
              selectedCount={selectedIds.length}
              onBatchUpdateAssignee={handleBatchUpdateAssignee}
              onBatchUpdateStatus={handleBatchUpdateStatus}
              onClearSelection={clearSelection}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="ml-auto text-sm text-red-600 hover:text-red-800 underline"
                >
                  重试
                </button>
              </div>
            )}

            {issues.length > 0 && (
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  全选当前页
                </label>
                <span className="text-sm text-gray-500">
                  显示 {issues.length} 条，共 {total} 条
                </span>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border border-gray-100 p-4 animate-pulse"
                  >
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : issues.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无问题记录</h3>
                <p className="text-gray-500 mb-6">
                  没有找到符合条件的问题，请尝试调整筛选条件
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    重置筛选
                  </button>
                  <button
                    onClick={handleNewIssue}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    新建问题
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {issues.map((issue, index) => (
                  <div key={issue.id} className="group">
                    <IssueCard
                      issue={issue}
                      isSelected={selectedIds.includes(issue.id)}
                      onSelect={toggleSelect}
                      onEdit={handleEditIssue}
                      onDelete={handleDeleteIssue}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            )}

            <Pagination
              currentPage={queryParams.page || 1}
              totalPages={totalPages}
              pageSize={queryParams.pageSize || 10}
              total={total}
              onPageChange={(page) => setQueryParams({ page })}
            />
          </div>

          <aside className="lg:w-80 flex-shrink-0">
            <StatsPanel
              unresolvedStats={unresolvedStats}
              hotTags={hotTags}
              totalUnresolved={totalUnresolved}
            />
          </aside>
        </div>
      </main>

      <IssueFormModal
        isOpen={isModalOpen}
        issue={editingIssue}
        existingTags={allTags}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
