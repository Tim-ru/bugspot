import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Trash2, Eye, Calendar, 
  User, Tag, AlertTriangle, CheckCircle, Clock, XCircle,
  Bug, Zap, Info
} from 'lucide-react';
import { BugReport } from '../types';
import { getBugReports, updateBugReport, deleteBugReport, exportBugReports } from '../utils/storage';

export default function BugReportDashboard() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<BugReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, severityFilter]);

  const loadReports = () => {
    const savedReports = getBugReports();
    setReports(savedReports);
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(report => report.severity === severityFilter);
    }

    setFilteredReports(filtered);
  };

  const handleStatusChange = (reportId: string, newStatus: BugReport['status']) => {
    updateBugReport(reportId, { status: newStatus });
    loadReports();
  };

  const handleDelete = (reportId: string) => {
    if (confirm('Are you sure you want to delete this bug report?')) {
      deleteBugReport(reportId);
      loadReports();
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    }
  };

  const handleExport = () => {
    const data = exportBugReports();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bug-reports.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const statusColors = {
    open: 'bg-red-100 text-red-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const statusIcons = {
    open: XCircle,
    'in-progress': Clock,
    resolved: CheckCircle,
    closed: XCircle,
  };

  const severityColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600',
  };

  const severityIcons = {
    low: Info,
    medium: AlertTriangle,
    high: Bug,
    critical: Zap,
  };

  const stats = {
    total: reports.length,
    open: reports.filter(r => r.status === 'open').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bug Reports Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and track reported issues</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Reports</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <Bug className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Open</p>
                  <p className="text-2xl font-bold text-red-900">{stats.open}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Resolved</p>
                  <p className="text-2xl font-bold text-green-900">{stats.resolved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports Grid */}
          <div className="lg:col-span-2 space-y-4">
            {filteredReports.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bug reports found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const StatusIcon = statusIcons[report.status];
                const SeverityIcon = severityIcons[report.severity];
                
                return (
                  <div
                    key={report.id}
                    className={`
                      bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md
                      ${selectedReport?.id === report.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'}
                    `}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <SeverityIcon className={`w-5 h-5 ${severityColors[report.severity]}`} />
                          <span className={`text-sm font-medium ${severityColors[report.severity]}`}>
                            {report.severity.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{report.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                          <StatusIcon className="w-3 h-3" />
                          {report.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(report.timestamp).toLocaleDateString()}
                        </div>
                        {report.userEmail && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {report.userEmail}
                          </div>
                        )}
                      </div>
                      {report.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {report.tags.length}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Report Details */}
          <div className="lg:col-span-1">
            {selectedReport ? (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Report Details</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <XCircle className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedReport.id)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={selectedReport.status}
                      onChange={(e) => handleStatusChange(selectedReport.id, e.target.value as BugReport['status'])}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Environment</label>
                    <div className="mt-1 text-sm text-gray-600 space-y-1">
                      <p><strong>Browser:</strong> {selectedReport.environment.browser}</p>
                      <p><strong>OS:</strong> {selectedReport.environment.os}</p>
                      <p><strong>Resolution:</strong> {selectedReport.environment.screenResolution}</p>
                      <p><strong>URL:</strong> <span className="break-all">{selectedReport.environment.url}</span></p>
                    </div>
                  </div>

                  {selectedReport.steps.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Steps to Reproduce</label>
                      <ol className="mt-1 list-decimal list-inside text-sm text-gray-600 space-y-1">
                        {selectedReport.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {selectedReport.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tags</label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedReport.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedReport.screenshot && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Screenshot</label>
                      <div className="mt-1">
                        <img
                          src={selectedReport.screenshot}
                          alt="Bug screenshot"
                          className="w-full rounded-lg border"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Report</h3>
                <p className="text-gray-500">Click on a bug report to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}