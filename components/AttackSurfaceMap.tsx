import React, { useMemo } from 'react';
import { AttackSurfaceNode, AttackSurfaceEdge } from '../types';
import { Globe, Database, Server, Link as LinkIcon, AlertTriangle } from 'lucide-react';

interface AttackSurfaceMapProps {
  nodes: AttackSurfaceNode[];
  edges: AttackSurfaceEdge[];
}

const AttackSurfaceMap: React.FC<AttackSurfaceMapProps> = ({ nodes, edges }) => {
  // Simple radial layout calculation
  const layout = useMemo(() => {
    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const rootNode = nodes.find(n => n.type === 'root') || nodes[0];
    const otherNodes = nodes.filter(n => n.id !== rootNode?.id);
    
    // Position root
    const nodePositions = new Map<string, { x: number, y: number, node: AttackSurfaceNode }>();
    if (rootNode) {
        nodePositions.set(rootNode.id, { x: centerX, y: centerY, node: rootNode });
    }

    // Position others in a circle
    const radius = 120;
    otherNodes.forEach((node, index) => {
        const angle = (index / otherNodes.length) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        nodePositions.set(node.id, { x, y, node });
    });

    return { nodePositions, width, height };
  }, [nodes]);

  const getIcon = (type: string) => {
    switch(type) {
        case 'root': return <Globe className="w-5 h-5 text-white" />;
        case 'database': return <Database className="w-4 h-4 text-purple-300" />;
        case 'api': return <Server className="w-4 h-4 text-blue-300" />;
        default: return <LinkIcon className="w-4 h-4 text-gray-300" />;
    }
  };

  const getColor = (node: AttackSurfaceNode) => {
    if (node.type === 'root') return 'bg-primary border-blue-400';
    if (node.riskLevel === 'high') return 'bg-red-900/80 border-red-500';
    if (node.riskLevel === 'medium') return 'bg-yellow-900/80 border-yellow-500';
    return 'bg-gray-800 border-gray-600';
  };

  return (
    <div className="bg-surface border border-gray-700 rounded-xl p-6 shadow-lg flex flex-col items-center">
        <h3 className="text-xl font-bold text-white mb-2 self-start flex items-center gap-2">
            <span className="text-orange-400">●</span> Attack Surface Map
        </h3>
        <p className="text-sm text-gray-400 mb-6 self-start">
            Visualizing interconnected components and their associated risk levels.
        </p>
        
        <div className="relative border border-gray-800 rounded-lg bg-gray-950/50 overflow-hidden w-full flex justify-center">
            <svg width="100%" height="400" viewBox={`0 0 ${layout.width} ${layout.height}`} className="max-w-[600px]">
                {/* Edges */}
                {edges.map((edge, i) => {
                    const start = layout.nodePositions.get(edge.source);
                    const end = layout.nodePositions.get(edge.target);
                    if (!start || !end) return null;
                    return (
                        <line 
                            key={i}
                            x1={start.x} 
                            y1={start.y} 
                            x2={end.x} 
                            y2={end.y} 
                            stroke="#475569" 
                            strokeWidth="1.5"
                            strokeOpacity="0.6"
                        />
                    );
                })}

                {/* Nodes (rendered as foreignObject for HTML content) */}
                {Array.from(layout.nodePositions.values()).map(({ x, y, node }) => (
                   <g key={node.id} transform={`translate(${x},${y})`}>
                       <circle 
                            r={node.type === 'root' ? 24 : 18} 
                            fill={node.type === 'root' ? '#3b82f6' : '#1e293b'} 
                            stroke={node.riskLevel === 'high' ? '#ef4444' : '#64748b'}
                            strokeWidth={2}
                            className="transition-all duration-300"
                        />
                   </g> 
                ))}
            </svg>

            {/* HTML Overlay for Tooltips/Icons (Easier than SVG formatting) */}
            <div className="absolute inset-0 pointer-events-none">
                 <div className="relative w-full h-full max-w-[600px] mx-auto">
                    {Array.from(layout.nodePositions.values()).map(({ x, y, node }) => (
                        <div 
                            key={node.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto cursor-pointer group`}
                            style={{ left: x, top: y }}
                        >
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg z-10 transition-transform group-hover:scale-110
                                ${getColor(node)}
                            `}>
                                {getIcon(node.type)}
                            </div>
                            
                            {/* Risk Badge */}
                            {node.riskLevel === 'high' && (
                                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 border border-gray-900 z-20">
                                    <AlertTriangle className="w-2.5 h-2.5 text-white" />
                                </div>
                            )}

                            {/* Label */}
                            <div className="mt-2 bg-black/80 px-2 py-1 rounded text-[10px] text-gray-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                                {node.label}
                                <span className={`block text-[9px] uppercase font-bold ${
                                    node.riskLevel === 'high' ? 'text-red-400' : 
                                    node.riskLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
                                }`}>
                                    {node.riskLevel} Risk
                                </span>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
        
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> High Risk</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Medium Risk</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-600"></div> Low Risk</div>
        </div>
    </div>
  );
};

export default AttackSurfaceMap;
