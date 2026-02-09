import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Loader2, ShieldCheck, Lock, CheckCircle2, SkipForward, Server, Wifi, Activity, XCircle } from 'lucide-react';
import { ScanMode } from '../types';

interface LogStreamProps {
  url: string;
  scanMode: ScanMode;
  onCancel: () => void;
}

const LogStream: React.FC<LogStreamProps> = ({ url, scanMode, onCancel }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [activeStage, setActiveStage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hostname = url ? new URL(url).hostname : 'target-host';
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const STAGES = [
    { id: 'provision', label: 'Provisioning' },
    { id: 'network', label: 'Network & DNS' },
    { id: 'crawl', label: scanMode === ScanMode.Safe ? 'Deep Crawl (Skipped)' : 'Deep Crawl' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'report', label: 'Reporting' }
  ];

  useEffect(() => {
    // Generate stages dynamically based on mode, simulating Fargate + SSE
    let steps = [
      // Stage 0: Provisioning (Fargate/Container simulation)
      { stage: 0, msg: `Authenticating with LaunchLens Cloud...` },
      { stage: 0, msg: `[Queue] Job #882199 added to BullMQ (Priority: High).` },
      { stage: 0, msg: `[Worker] Worker-12 picked up job.` },
      { stage: 0, msg: `Requesting ephemeral scanner instance (AWS Fargate)...` },
      { stage: 0, msg: `Provisioning task: arn:aws:ecs:us-east-1:task/scanner-v4...` },
      { stage: 0, msg: `Pulling image: launchlens/scanner:latest...` },
      { stage: 0, msg: `Container started. IP: 10.0.42.15` },
      { stage: 0, msg: `Initializing WebSocket connection (wss://stream.launchlens.io/v1/jobs/882199)...` },
      { stage: 0, msg: `Connection established. Subscribed to real-time events.` },
      
      // Stage 1: Network
      { stage: 1, msg: `Resolving host: ${hostname}...` },
      { stage: 1, msg: `Verifying SSL/TLS certificate chain...` },
      { stage: 1, msg: `Checking for self-signed or expired certificates...` },
      { stage: 1, msg: `Analyzing port configuration (80, 443, 8080, 8443)...` },
      { stage: 1, msg: `Checking DNS CAA records...` },
    ];

    if (scanMode === ScanMode.Full) {
        steps.push(
            // Stage 2: Crawl (Only in Full)
            { stage: 2, msg: `Initializing Playwright (Chromium) in isolated sandbox...` },
            { stage: 2, msg: `[Puppeteer] Configuring page context and interceptors...` },
            { stage: 2, msg: `Enforcing CSP context isolation to prevent local leakage...` },
            { stage: 2, msg: `Target confirmed. Starting active deep scan...` },
            { stage: 2, msg: `Crawling robots.txt and sitemap.xml...` },
            { stage: 2, msg: `Rendering DOM tree and hydrating JS...` }
        );
    } else {
         steps.push(
            // Stage 2: Skipped in Safe
            { stage: 2, msg: `Skipping headless browser initialization (Quick Scan active).` },
            { stage: 2, msg: `Skipping active crawler (Quick Scan active).` }
        );
    }

    steps.push(
      // Stage 3: Analysis
      { stage: 3, msg: `Analyzing tech stack signatures...` },
      { stage: 3, msg: `Detected framework: React/Next.js (Inferred)` },
      { stage: 3, msg: `Identifying security headers (HSTS, X-Frame-Options)...` },
    );

    if (scanMode === ScanMode.Full) {
        steps.push(
             { stage: 3, msg: `Simulating user journey: Login flow...` },
             { stage: 3, msg: `Testing reaction to large payload inputs...` },
             { stage: 3, msg: `Checking for OWASP Top 10 vulnerabilities...` }
        );
    }

    steps.push(
      // Stage 4: Report
      { stage: 4, msg: `Generating security scorecard...` },
      { stage: 4, msg: `Drafting demo automation script...` },
      { stage: 4, msg: `Finalizing report artifacts...` },
      { stage: 4, msg: `Uploading report to secure storage...` },
      { stage: 4, msg: `Disconnecting session.` }
    );

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < steps.length) {
        const step = steps[currentIndex];
        setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0,8)}] ${step.msg}`]);
        setActiveStage(step.stage);
        
        // Mock socket status change
        if (step.msg.includes('Connection established')) setIsSocketConnected(true);
        if (step.msg.includes('Disconnecting')) setIsSocketConnected(false);

        currentIndex++;
      }
    }, scanMode === ScanMode.Safe ? 350 : 700); 

    return () => clearInterval(interval);
  }, [url, scanMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Infrastructure Badge */}
      <div className="flex justify-between items-center px-2">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Server className="w-3 h-3" />
                <span>Runner: AWS Fargate (Ephemeral)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <Wifi className={`w-3 h-3 ${isSocketConnected ? 'text-green-500' : 'text-gray-500'}`} />
                <span className={isSocketConnected ? 'text-green-500 font-medium' : 'text-gray-500'}>
                    {isSocketConnected ? 'WebSocket Connected' : 'Connecting...'}
                </span>
            </div>
         </div>
         <button 
            onClick={onCancel}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded text-xs text-red-400 transition-colors group"
         >
            <XCircle className="w-3 h-3 group-hover:scale-110 transition-transform" />
            Cancel Scan
         </button>
      </div>

      {/* Progress Timeline */}
      <div className="flex justify-between items-center bg-surface border border-gray-700 rounded-lg p-4 shadow-lg relative overflow-hidden">
        {/* Progress Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -z-0 transform -translate-y-1/2"></div>
        
        {STAGES.map((stage, idx) => {
          const isActive = idx === activeStage;
          const isCompleted = idx < activeStage;
          const isSkipped = scanMode === ScanMode.Safe && stage.id === 'crawl';
          
          return (
            <div key={stage.id} className="flex flex-col items-center flex-1 relative z-10">
               <div className="flex items-center justify-center mb-2 bg-surface px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isSkipped ? 'bg-gray-800 border-gray-600 text-gray-500' :
                    isCompleted ? 'bg-green-500 border-green-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                    isActive ? 'bg-blue-900 border-blue-500 text-blue-400 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
                    'bg-gray-800 border-gray-600 text-gray-500'
                  }`}>
                    {isSkipped ? <SkipForward className="w-4 h-4"/> : isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
               </div>
               <span className={`text-xs font-medium transition-colors duration-300 hidden sm:block ${
                 isSkipped ? 'text-gray-500 italic' : isActive ? 'text-blue-400 font-bold' : isCompleted ? 'text-green-500' : 'text-gray-600'
               }`}>
                 {stage.label}
               </span>
            </div>
          );
        })}
      </div>

      {/* Terminal Window */}
      <div className="bg-gray-950 rounded-xl overflow-hidden border border-gray-800 shadow-2xl font-mono text-sm relative group">
        <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <Terminal className="w-4 h-4 text-gray-400" />
             <span className="text-gray-300 font-semibold">Live Audit Log</span>
          </div>
          <div className="flex items-center gap-3">
             {isSocketConnected && (
                 <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-900/10 border border-green-500/20 rounded text-[10px] text-green-400 uppercase tracking-wider animate-pulse">
                    <Activity className="w-3 h-3" />
                    LIVE
                 </div>
             )}
             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-900/20 border border-green-500/20 rounded text-xs text-green-400" title="Environment Isolated">
                <ShieldCheck className="w-3 h-3" />
                <span className="hidden sm:inline">Secure Context</span>
             </div>
          </div>
        </div>
        
        {/* Log Content */}
        <div 
          ref={scrollRef}
          className="h-[300px] overflow-y-auto p-4 space-y-2 text-green-500/90 font-mono text-xs md:text-sm"
        >
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2 animate-fade-in">
              <span className="text-gray-600 shrink-0 select-none w-20">{log.split(']')[0]}]</span>
              <span className={`break-all ${log.includes('Error') ? 'text-red-400' : 'text-gray-300'}`}>
                  {log.split(']')[1]}
              </span>
            </div>
          ))}
          {activeStage < 4 && <div className="animate-pulse text-blue-500">_</div>}
        </div>
      </div>
      
      {/* Isolation Notice */}
      <div className="flex justify-center opacity-70">
          <p className="text-[10px] text-gray-500 flex items-center gap-1 uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            Execution isolated in ephemeral container (us-east-1)
          </p>
      </div>
    </div>
  );
};

export default LogStream;
