import React, { useState } from 'react';
import { DemoPlan } from '../types';
import { Play, Copy, Check } from 'lucide-react';

interface DemoStudioProps {
  plan: DemoPlan;
  script: string;
}

const DemoStudio: React.FC<DemoStudioProps> = ({ plan, script }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Plan Section */}
      <div className="bg-surface border border-gray-700 rounded-xl p-6 shadow-lg flex flex-col">
        <div className="mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-blue-400">●</span> Demo Blueprint
            </h3>
            <p className="text-sm text-gray-400 mt-1">Goal: {plan.objective}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4">
                {plan.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-blue-900 text-blue-200 flex items-center justify-center text-xs font-bold border border-blue-700">
                                {idx + 1}
                            </div>
                            {idx < plan.steps.length - 1 && <div className="w-0.5 h-full bg-gray-700 my-1"></div>}
                        </div>
                        <p className="text-sm text-gray-300 py-0.5">{step}</p>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-2 gap-4">
                <div className="bg-green-900/10 border border-green-500/20 rounded p-3">
                    <p className="text-xs text-green-500 uppercase font-bold mb-1">Highlight</p>
                    <p className="text-sm text-gray-300">{plan.highlight}</p>
                </div>
                <div className="bg-red-900/10 border border-red-500/20 rounded p-3">
                    <p className="text-xs text-red-500 uppercase font-bold mb-1">Avoid</p>
                    <p className="text-sm text-gray-300">{plan.avoid}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Script Section */}
      <div className="bg-surface border border-gray-700 rounded-xl p-6 shadow-lg flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-purple-400">●</span> Voiceover Script
            </h3>
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-600"
            >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy Text'}
            </button>
        </div>

        <div className="flex-1 bg-gray-950/50 rounded-lg p-6 border border-gray-800 font-mono text-sm leading-relaxed overflow-y-auto text-gray-300 shadow-inner">
            <div className="whitespace-pre-wrap">{script}</div>
        </div>
        
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <span>Estimated Duration: <span className="text-gray-300">{plan.duration}</span></span>
            <div className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                <span>Read at natural pace</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DemoStudio;
