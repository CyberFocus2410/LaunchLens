export enum Severity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum AudienceType {
  Student = 'student',
  Developer = 'developer',
  Startup = 'startup',
  Judge = 'judge'
}

export enum ScanMode {
  Full = 'full',
  Safe = 'safe'
}

export interface SecurityIssue {
  issue: string;
  severity: Severity;
  mitigation: string;
  codeSnippet?: string;
}

export interface Scorecard {
  security: number;
  privacy: number;
  stability: number;
  bestPractices: number;
  productionReadiness: number;
  overallRisk: 'Low' | 'Moderate' | 'High';
  explanation: string;
}

export interface DemoPlan {
  objective: string;
  steps: string[];
  duration: string;
  highlight: string;
  avoid: string;
}

export interface FailedTest {
  scenario: string;
  curlCommand: string;
}

export interface AttackSurfaceNode {
  id: string;
  label: string;
  type: 'root' | 'route' | 'api' | 'external' | 'database';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AttackSurfaceEdge {
  source: string;
  target: string;
}

export interface AuditReport {
  appOverview: {
    purpose: string;
    routes: string[];
    userJourneys: string[];
  };
  functionalTests: {
    passed: string[];
    failed: FailedTest[];
    risky: string[];
    suggested: string[];
  };
  securityAnalysis: SecurityIssue[];
  attackSurface: {
    nodes: AttackSurfaceNode[];
    edges: AttackSurfaceEdge[];
  };
  scorecard: Scorecard;
  improvements: {
    technical: string[];
    ux: string[];
    security: string[];
    performance: string[];
  };
  demoPlan: DemoPlan;
  voiceoverScript: string;
}

export interface AuditRequest {
  url: string;
  description: string;
  testCreds?: string;
  audience: AudienceType;
  scanMode: ScanMode;
}
