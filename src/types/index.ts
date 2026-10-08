export type UserRole = 'ADMIN' | 'FIELD_WORKER' | 'CITIZEN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  organizationId: string;
  avatarUrl?: string;
  teamId?: string; // for workers
  designation?: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  type: 'MUNICIPALITY' | 'HOSPITAL_NETWORK' | 'INDUSTRIAL_PARK' | 'CAMPUS';
  city: string;
  centerCoordinates: [number, number]; // [lat, lng]
  activeWaterZones: number;
  contactEmail: string;
  emergencyHotline: string;
}

export type IncidentCategory =
  | 'PIPELINE_LEAK'
  | 'WATER_SHORTAGE'
  | 'FLOODING'
  | 'DRAINAGE_PROBLEM'
  | 'WATER_CONTAMINATION'
  | 'TANK_OVERFLOW'
  | 'INFRASTRUCTURE_DAMAGE'
  | 'MAINTENANCE';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface PriorityBreakdown {
  score: number; // 0 - 100
  classification: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  severityFactor: { score: number; max: 30; label: string };
  populationFactor: { score: number; max: 25; label: string };
  durationFactor: { score: number; max: 20; label: string };
  locationCriticality: { score: number; max: 20; label: string };
  waterLossFactor: { score: number; max: 5; label: string };
  explanation: string;
}

export interface AIAnalysis {
  category: IncidentCategory;
  severity: IncidentSeverity;
  confidence: number; // e.g. 94%
  criticalInfrastructure?: string; // e.g. "City Hospital (120m away)"
  estimatedWaterLossLitersPerDay: number;
  flowRateLitersPerMin: number;
  affectedPopulationEstimate: number;
  recommendedAction: string;
  suggestedTeamType: string;
  analyzedAt: string;
  modelUsed: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  actor: string;
  actorRole: UserRole | 'SYSTEM' | 'AI';
  stage: IncidentStatus | 'AI_CLASSIFICATION' | 'PRIORITY_CALCULATED' | 'INSPECTION' | 'REPAIR_VERIFIED';
}

export interface IncidentPhoto {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy: string;
  type: 'INITIAL_REPORT' | 'BEFORE_REPAIR' | 'AFTER_REPAIR';
}

export interface Incident {
  id: string; // e.g. "AQ-1024"
  organizationId: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  priorityScore: number;
  priorityBreakdown: PriorityBreakdown;
  aiAnalysis?: AIAnalysis;
  zoneId: string;
  zoneName: string;
  locationAddress: string;
  coordinates: [number, number]; // [lat, lng]
  reportedBy: {
    name: string;
    email: string;
    phone?: string;
    isCitizen: boolean;
  };
  assignedTeamId?: string;
  assignedTeamName?: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  estimatedWaterLossLitersPerDay: number;
  waterSavedLiters?: number;
  flowRateLitersPerMin?: number;
  affectedPopulation: number;
  criticalFacilities?: string[];
  photos: IncidentPhoto[];
  timeline: TimelineEvent[];
  workerNotes?: string;
  resolutionDetails?: {
    resolvedAt: string;
    resolvedByWorkerId: string;
    beforePhotoUrl?: string;
    afterPhotoUrl?: string;
    aiVerificationConfidence?: number;
    aiVerificationResult?: 'VERIFIED_RESOLVED' | 'NEEDS_REVIEW';
    aiVerificationNotes?: string;
    adminOverride?: boolean;
    actualRepairMethod?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FieldWorker {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  teamId: string;
  teamName: string;
  organizationId: string;
  specialization: string;
  activeIncidentsCount: number;
  completedIncidentsCount: number;
  rating: number; // e.g. 4.9
  currentStatus: 'AVAILABLE' | 'ON_FIELD' | 'OFF_DUTY';
}

export interface FieldTeam {
  id: string;
  name: string; // e.g. "Field Team 7 - Rapid Leak Response"
  zoneId: string;
  zoneName: string;
  organizationId: string;
  leaderName: string;
  membersCount: number;
  vehicleCode: string;
  equipment: string[];
  status: 'ACTIVE' | 'STANDBY' | 'DISPATCHED';
}

export interface InfrastructureAsset {
  id: string; // e.g. "PIPE-102"
  organizationId: string;
  name: string;
  type: 'PIPELINE' | 'WATER_TANK' | 'PUMP' | 'DRAIN' | 'TREATMENT_PLANT';
  zoneId: string;
  zoneName: string;
  coordinates: [number, number];
  installationDate: string;
  ageYears: number;
  lastMaintenanceDate: string;
  previousIncidentsCount: number;
  riskScore: number; // 0 - 100
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE_REQUIRED' | 'OFFLINE';
  specification: string;
  capacity?: string;
  material?: string;
  recommendedPreventiveAction?: string;
}

export interface ZoneRisk {
  zoneId: string;
  zoneName: string;
  organizationId: string;
  coordinates: [number, number];
  radiusMeters: number;
  temperatureC: number;
  humidityPercent: number;
  heatIndexC: number;
  rainProbabilityPercent: number;
  waterAvailabilityPercent: number; // 0-100%
  populationDensity: number; // total people
  historicalIncidentCount: number;
  activeIncidentCount: number;
  infrastructureRiskScore: number; // 0-100
  heatRiskLevel: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW';
  waterRiskLevel: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW';
  overallRiskLevel: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW';
  overallRiskScore: number; // 0-100
  primaryVulnerability: string;
}

export interface WeatherRecord {
  temperatureC: number;
  humidityPercent: number;
  heatIndexC: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Heatwave Warning' | 'Rainy' | 'Thunderstorm';
  rainProbabilityPercent: number;
  windSpeedKmh: number;
  uvIndex: number;
  lastUpdated: string;
  advisoryNote: string;
}

export interface InAppNotification {
  id: string;
  userId?: string;
  targetRole: UserRole | 'ALL';
  organizationId: string;
  title: string;
  message: string;
  incidentId?: string;
  type: 'CRITICAL_ALERT' | 'ASSIGNMENT' | 'STATUS_UPDATE' | 'RESOLUTION' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  organizationId: string;
  timestamp: string;
  userName: string;
  userRole: UserRole | 'SYSTEM';
  action: string;
  entityType: 'INCIDENT' | 'ASSIGNMENT' | 'ASSET' | 'USER' | 'VERIFICATION';
  entityId: string;
  previousValue?: string;
  newValue?: string;
  metadata?: string;
}
