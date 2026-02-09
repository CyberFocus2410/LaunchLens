import React, { useState, useRef } from 'react';
import AuditForm from './components/AuditForm';
import RiskScorecard from './components/RiskScorecard';
import SecurityReport from './components/SecurityReport';
import DemoStudio from './components/DemoStudio';
import LogStream from './components/LogStream';
import AttackSurfaceMap from './components/AttackSurfaceMap';
import { analyzeApp } from './services/gemini';
import { AuditRequest, AuditReport } from './types';
import { CheckCircle2, XCircle, AlertCircle, LayoutDashboard, FileText, Lock, Video, Terminal, Info, Copy, Check } from 'lucide-react';

const App: React.FC = () => {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'security' | 'qa' | 'demo'>('dashboard');
  const [requestData, setRequestData] = useState<AuditRequest | null>(null);
  const [copiedCurlId, setCopiedCurlId] = useState<number | null>(null);
  
  // Use a ref to track cancellation status across async operations
  const abortRef = useRef<boolean>(false);

  const handleAudit = async (request: AuditRequest) => {
    setLoading(true);
    setError(null);
    setReport(null);
    setRequestData(request);
    abortRef.current = false;

    try {
      const result = await analyzeApp(request);
      // Only update state if not cancelled
      if (!abortRef.current) {
        setReport(result);
      }
    } catch (err: any) {
      if (!abortRef.current) {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      if (!abortRef.current) {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    abortRef.current = true;
    setLoading(false);
    setRequestData(null);
    // Optionally stay on report or reset to form
    setReport(null); 
  };

  const handleCopyCurl = (cmd: string, id: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCurlId(id);
    setTimeout(() => setCopiedCurlId(null), 2000);
  };

  const TabButton = ({ id, label, icon }: { id: any, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === id 
          ? 'bg-primary text-white shadow-lg shadow-blue-500/20' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-gray-100 p-4 md:p-8 font-sans selection:bg-primary selection:text-white flex flex-col">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full mb-12 flex justify-between items-center border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg border border-primary/30">
            <Terminal className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">LaunchLens</h1>
            <p className="text-xs text-gray-500 font-mono">APP INTELLIGENCE SUITE</p>
          </div>
        </div>
        <div className="hidden md:flex gap-4 text-sm text-gray-500">
           <span>v1.0.0</span>
           <span>•</span>
           <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> System Online</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full flex-grow">
        {!report && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <AuditForm onSubmit={handleAudit} isLoading={loading} />
            {error && (
              <div className="mt-8 p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg flex items-center gap-3 max-w-xl animate-pulse">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        )}

        {loading && requestData && (
           <div className="flex flex-col items-center justify-center min-h-[50vh] w-full animate-fade-in">
              <LogStream 
                url={requestData.url} 
                scanMode={requestData.scanMode} 
                onCancel={handleCancel}
              />
              <p className="text-gray-500 mt-6 animate-pulse text-sm">Auditing infrastructure and simulating user flows...</p>
           </div>
        )}

        {report && (
          <div className="space-y-6 animate-fade-in pb-12">
             {/* Audited App Banner */}
             <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <h2 className="text-lg font-semibold text-white">
                    Audited Application: <span className="text-primary">{requestData?.url ? new URL(requestData.url).hostname : 'Target Web App'}</span>
                  </h2>
                   <p className="text-sm text-gray-400">Audit generated by LaunchLens using URL-based analysis and simulated user interactions.</p>
               </div>
               <div className="flex flex-col items-end gap-1">
                 <div className="px-3 py-1 bg-gray-800 rounded text-xs font-mono text-gray-300 border border-gray-700">
                    Target: {requestData?.url} 
                 </div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                    {requestData?.scanMode === 'safe' ? 'Quick Scan' : 'Deep Scan'}
                 </div>
               </div>
            </div>

            {/* Top Bar: Nav & Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-2 rounded-xl border border-gray-700">
                <div className="flex p-1 gap-1 overflow-x-auto w-full md:w-auto">
                    <TabButton id="dashboard" label="Overview" icon={<LayoutDashboard className="w-4 h-4"/>} />
                    <TabButton id="security" label="Security" icon={<Lock className="w-4 h-4"/>} />
                    <TabButton id="qa" label="QA Testing" icon={<FileText className="w-4 h-4"/>} />
                    <TabButton id="demo" label="Demo Studio" icon={<Video className="w-4 h-4"/>} />
                </div>
                <button 
                  onClick={() => { setReport(null); setRequestData(null); }}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
                >
                  New Audit
                </button>
            </div>

            {/* Dashboard View */}
            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-surface border border-gray-700 rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-bold text-white mb-2">App Overview</h2>
                            <p className="text-sm text-gray-400 mb-4 italic">
                                This overview summarizes the results of an automated audit performed by LaunchLens on the deployed application listed above.
                            </p>
                            <p className="text-gray-300 mb-6 leading-relaxed">{report.appOverview.purpose}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Core Routes</h4>
                                    <ul className="space-y-2">
                                        {report.appOverview.routes.map((route, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-300 bg-gray-900/40 p-2 rounded border border-gray-800">
                                                <span className="text-primary font-mono">/</span>
                                                {route}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">User Journeys</h4>
                                    <ul className="space-y-2">
                                        {report.appOverview.userJourneys.map((journey, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                                                {journey}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-surface border border-gray-700 rounded-xl p-6 shadow-lg">
                             <h2 className="text-xl font-bold text-white mb-4">Improvement Recommendations</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {report.improvements.technical.slice(0, 2).map((item, i) => (
                                    <div key={`tech-${i}`} className="p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg">
                                        <span className="text-xs font-bold text-blue-400 uppercase block mb-1">Technical</span>
                                        <p className="text-sm text-gray-300">{item}</p>
                                    </div>
                                ))}
                                {report.improvements.ux.slice(0, 2).map((item, i) => (
                                    <div key={`ux-${i}`} className="p-3 bg-purple-900/10 border border-purple-500/20 rounded-lg">
                                        <span className="text-xs font-bold text-purple-400 uppercase block mb-1">UX</span>
                                        <p className="text-sm text-gray-300">{item}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1 h-full">
                        <RiskScorecard scorecard={report.scorecard} />
                    </div>
                </div>
            )}

            {/* Security View */}
            {activeTab === 'security' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="md:col-span-2 space-y-6">
                        <AttackSurfaceMap nodes={report.attackSurface.nodes} edges={report.attackSurface.edges} />
                        <SecurityReport issues={report.securityAnalysis} />
                     </div>
                     <div className="space-y-6">
                        <div className="bg-surface border border-gray-700 rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-bold text-white mb-4">Hardening Steps</h3>
                            <ul className="space-y-3">
                                {report.improvements.security.map((step, i) => (
                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                     </div>
                </div>
            )}

            {/* QA View */}
            {activeTab === 'qa' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2 bg-blue-900/10 border border-blue-500/20 rounded-lg p-4 mb-2">
                        <p className="text-sm text-blue-200 flex items-start gap-2">
                            <Info className="w-5 h-5 shrink-0 mt-0.5" />
                            These test scenarios were generated by LaunchLens after crawling the deployed app and simulating real user flows.
                        </p>
                    </div>

                    <div className="bg-surface border border-gray-700 rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-4 text-green-400 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Passing Scenarios</h3>
                        <ul className="space-y-3">
                            {report.functionalTests.passed.map((test, i) => (
                                <li key={i} className="p-3 bg-gray-900/30 rounded border border-gray-800 text-sm text-gray-300">
                                    {test}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-surface border border-gray-700 rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-4 text-red-400 flex items-center gap-2"><XCircle className="w-5 h-5"/> Likely Failures / Edge Cases</h3>
                        <ul className="space-y-3">
                            {report.functionalTests.failed.map((test, i) => (
                                <li key={i} className="p-3 bg-red-900/10 rounded border border-red-900/20 text-sm text-gray-300 flex flex-col gap-2">
                                    <span className="font-medium text-red-200">{test.scenario}</span>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-black/50 text-xs text-gray-400 p-2 rounded font-mono truncate border border-red-900/30">
                                            {test.curlCommand}
                                        </code>
                                        <button 
                                            onClick={() => handleCopyCurl(test.curlCommand, i)}
                                            className="px-2 py-1.5 bg-red-900/30 hover:bg-red-900/50 rounded text-xs text-red-300 font-medium transition-colors border border-red-800/50 flex items-center gap-1 shrink-0"
                                            title="Copy reproduction command"
                                        >
                                            {copiedCurlId === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copiedCurlId === i ? 'Copied' : 'Copy cURL'}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-surface border border-gray-700 rounded-xl p-6 shadow-lg lg:col-span-2">
                        <h3 className="text-lg font-bold text-white mb-4 text-yellow-400 flex items-center gap-2"><AlertCircle className="w-5 h-5"/> Suggested Test Cases</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {report.functionalTests.suggested.map((test, i) => (
                                <div key={i} className="p-3 bg-yellow-900/10 rounded border border-yellow-900/20 text-sm text-gray-300">
                                    <span className="font-bold text-yellow-500 mr-2">TODO:</span>
                                    {test}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Demo Studio View */}
            {activeTab === 'demo' && (
                <div className="h-[calc(100vh-320px)]">
                    <DemoStudio plan={report.demoPlan} script={report.voiceoverScript} />
                </div>
            )}

          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="w-full max-w-7xl mx-auto border-t border-gray-800 py-6 mt-auto text-center">
         <p className="text-xs text-gray-500 max-w-2xl mx-auto">
            Disclaimer: LaunchLens performs automated analysis based on observable behavior and configurations. 
            Findings are indicative, not a substitute for a full manual security audit.
         </p>
      </footer>
    </div>
  );
};

export default App;
