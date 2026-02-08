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

export interface SecurityIssue {
  issue: string;
  severity: Severity;
  mitigation: string;
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

export interface AuditReport {
  appOverview: {
    purpose: string;
    routes: string[];
    userJourneys: string[];
  };
  functionalTests: {
    passed: string[];
    failed: string[];
    risky: string[];
    suggested: string[];
  };
  securityAnalysis: SecurityIssue[];
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
}
