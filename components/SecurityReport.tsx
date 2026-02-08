import React from 'react';
import { SecurityIssue, Severity } from '../types';
import { AlertTriangle, AlertOctagon, Info, CheckCircle } from 'lucide-react';

interface SecurityReportProps {
  issues: SecurityIssue[];
}

const SecurityReport: React.FC<SecurityReportProps> = ({ issues }) => {
  const getIcon = (severity: Severity) => {
    switch (severity) {
      case Severity.Critical: return <AlertOctagon className="w-5 h-5 text-red-500" />;
      case Severity.High: return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case Severity.Medium: return <Info className="w-5 h-5 text-yellow-500" />;
      case Severity.Low: return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBorderColor = (severity: Severity) => {
    switch (severity) {
      case Severity.Critical: return 'border-red-500/50 bg-red-500/5';
      case Severity.High: return 'border-orange-500/50 bg-orange-500/5';
      case Severity.Medium: return 'border-yellow-500/50 bg-yellow-500/5';
      case Severity.Low: return 'border-blue-500/50 bg-blue-500/5';
      default: return 'border-gray-500/50';
    }
  };

  return (
    <div className="bg-surface border border-gray-700 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-red-400">●</span> Security & Privacy Findings
      </h3>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {issues.map((issue, idx) => (
          <div key={idx} className={`border rounded-lg p-4 ${getBorderColor(issue.severity)}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {getIcon(issue.severity)}
                <span className="font-semibold text-gray-200">{issue.issue}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                issue.severity === Severity.Critical || issue.severity === Severity.High ? 'bg-red-900 text-red-200' : 
                issue.severity === Severity.Medium ? 'bg-yellow-900 text-yellow-200' : 'bg-blue-900 text-blue-200'
              }`}>
                {issue.severity}
              </span>
            </div>
            <div className="pl-7">
                <p className="text-sm text-gray-400 font-mono"><span className="text-gray-500">Fix:</span> {issue.mitigation}</p>
            </div>
          </div>
        ))}
        {issues.length === 0 && (
            <div className="text-center py-8 text-gray-500">
                No major security issues detected.
            </div>
        )}
      </div>
    </div>
  );
};

export default SecurityReport;
