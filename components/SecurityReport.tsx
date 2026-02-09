import React from 'react';
import { SecurityIssue, Severity } from '../types';
import { AlertTriangle, AlertOctagon, Info, CheckCircle, Code } from 'lucide-react';

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
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-400">●</span> Web Application Security & Privacy Findings
        </h3>
        <p className="text-sm text-gray-400 mt-1">
            These findings are derived from client-side inspection, network behavior, and configuration analysis.
        </p>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {issues.map((issue, idx) => (
          <div key={idx} className={`border rounded-lg p-4 ${getBorderColor(issue.severity)}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {getIcon(issue.severity)}
                <span className="font-semibold text-gray-200">{issue.issue}</span>
              </div>
              <span 
                className={`text-xs font-bold px-2 py-0.5 rounded uppercase cursor-help ${
                    issue.severity === Severity.Critical || issue.severity === Severity.High ? 'bg-red-900 text-red-200' : 
                    issue.severity === Severity.Medium ? 'bg-yellow-900 text-yellow-200' : 'bg-blue-900 text-blue-200'
                }`}
                title="Severity reflects potential impact if exploited."
              >
                {issue.severity}
              </span>
            </div>
            <div className="pl-7 space-y-3">
                <p className="text-sm text-gray-400 font-mono"><span className="text-gray-500">Fix:</span> {issue.mitigation}</p>
                {issue.codeSnippet && (
                    <div className="mt-2 bg-gray-950 border border-gray-800 rounded p-3 relative group">
                         <div className="absolute top-2 right-2 flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-[10px] text-gray-400 font-mono uppercase">
                            <Code className="w-3 h-3" /> Fix It
                         </div>
                         <pre className="text-xs text-green-400 overflow-x-auto font-mono pt-4">
                            <code>{issue.codeSnippet}</code>
                         </pre>
                    </div>
                )}
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
