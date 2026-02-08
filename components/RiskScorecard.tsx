import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend, Tooltip } from 'recharts';
import { Scorecard } from '../types';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

interface RiskScorecardProps {
  scorecard: Scorecard;
}

const RiskScorecard: React.FC<RiskScorecardProps> = ({ scorecard }) => {
  const data = [
    { name: 'Security', uv: scorecard.security, fill: '#ef4444' },
    { name: 'Privacy', uv: scorecard.privacy, fill: '#f59e0b' },
    { name: 'Stability', uv: scorecard.stability, fill: '#3b82f6' },
    { name: 'Best Practices', uv: scorecard.bestPractices, fill: '#10b981' },
    { name: 'Production Ready', uv: scorecard.productionReadiness, fill: '#8b5cf6' },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Moderate': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-green-500 bg-green-500/10 border-green-500/20';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
        case 'High': return <ShieldAlert className="w-8 h-8 text-red-500" />;
        case 'Moderate': return <Shield className="w-8 h-8 text-yellow-500" />;
        default: return <ShieldCheck className="w-8 h-8 text-green-500" />;
    }
  }

  return (
    <div className="bg-surface border border-gray-700 rounded-xl p-6 shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white">Risk Scorecard</h3>
        <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getRiskColor(scorecard.overallRisk)}`}>
            {getRiskIcon(scorecard.overallRisk)}
            <span className="font-bold uppercase text-sm tracking-wider">{scorecard.overallRisk} RISK</span>
        </div>
      </div>
      
      <p className="text-gray-400 text-sm mb-6">{scorecard.explanation}</p>

      <div className="flex-1 min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="20%" 
            outerRadius="100%" 
            barSize={15} 
            data={data}
            startAngle={180} 
            endAngle={0}
          >
            <RadialBar
              label={{ position: 'insideStart', fill: '#fff' }}
              background
              dataKey="uv"
            />
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{color: '#94a3b8'}} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                itemStyle={{ color: '#e2e8f0' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
             <div className="text-sm text-gray-500">Overall Score</div>
             <div className="text-3xl font-bold text-white">
                {Math.round((scorecard.security + scorecard.privacy + scorecard.stability + scorecard.bestPractices + scorecard.productionReadiness) / 5)}
             </div>
        </div>
      </div>
    </div>
  );
};

export default RiskScorecard;
