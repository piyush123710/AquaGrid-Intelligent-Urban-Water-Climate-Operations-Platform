import {
  AuditLogItem,
  FieldTeam,
  FieldWorker,
  Incident,
  InfrastructureAsset,
  InAppNotification,
  Organization,
  User,
  WeatherRecord,
  ZoneRisk,
} from '../types';
import {
  SEED_ORGANIZATIONS,
  SEED_USERS,
  SEED_TEAMS,
  SEED_WORKERS,
  SEED_ASSETS,
  SEED_ZONES_CONFIG,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
  createSeedIncidents,
} from '../data/seedData';
import { CURRENT_WEATHER_DEFAULT, calculateZoneRiskMetrics } from './weatherRiskEngine';

const STORAGE_KEY_PREFIX = 'aquagrid_state_v2';

export interface AppState {
  organizations: Organization[];
  activeOrgId: string;
  currentUser: User;
  users: User[];
  incidents: Incident[];
  assets: InfrastructureAsset[];
  teams: FieldTeam[];
  workers: FieldWorker[];
  notifications: InAppNotification[];
  auditLogs: AuditLogItem[];
  weather: WeatherRecord;
}

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('State subscriber error:', e);
    }
  });
}

export function subscribeToState(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}_data`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.incidents) && parsed.incidents.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse saved state, seeding defaults:', err);
  }

  // Generate seed
  const seededIncidents = createSeedIncidents();
  const state: AppState = {
    organizations: SEED_ORGANIZATIONS,
    activeOrgId: 'org-city-corp',
    currentUser: SEED_USERS[0], // Admin by default
    users: SEED_USERS,
    incidents: seededIncidents,
    assets: SEED_ASSETS,
    teams: SEED_TEAMS,
    workers: SEED_WORKERS,
    notifications: SEED_NOTIFICATIONS,
    auditLogs: SEED_AUDIT_LOGS,
    weather: CURRENT_WEATHER_DEFAULT,
  };

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_data`, JSON.stringify(state));
  } catch {}

  return state;
}

let currentState: AppState = loadInitialState();

function saveState() {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_data`, JSON.stringify(currentState));
  } catch (e) {
    console.error('Failed to write to localStorage:', e);
  }
  notifyListeners();
}

export const StorageService = {
  getState(): AppState {
    return currentState;
  },

  resetToDemo(): AppState {
    const seededIncidents = createSeedIncidents();
    currentState = {
      organizations: SEED_ORGANIZATIONS,
      activeOrgId: 'org-city-corp',
      currentUser: SEED_USERS[0],
      users: SEED_USERS,
      incidents: seededIncidents,
      assets: SEED_ASSETS,
      teams: SEED_TEAMS,
      workers: SEED_WORKERS,
      notifications: SEED_NOTIFICATIONS,
      auditLogs: SEED_AUDIT_LOGS,
      weather: CURRENT_WEATHER_DEFAULT,
    };
    saveState();
    return currentState;
  },

  setActiveOrg(orgId: string) {
    currentState.activeOrgId = orgId;
    saveState();
  },

  setCurrentUser(user: User) {
    currentState.currentUser = user;
    saveState();
  },

  switchUserByRole(role: 'ADMIN' | 'FIELD_WORKER' | 'CITIZEN') {
    const target = currentState.users.find((u) => u.role === role) || SEED_USERS.find((u) => u.role === role);
    if (target) {
      currentState.currentUser = target;
      saveState();
    }
  },

  getIncidents(orgId?: string): Incident[] {
    const targetOrg = orgId || currentState.activeOrgId;
    return currentState.incidents.filter((i) => i.organizationId === targetOrg);
  },

  getIncidentById(id: string): Incident | undefined {
    return currentState.incidents.find((i) => i.id === id);
  },

  getAssets(orgId?: string): InfrastructureAsset[] {
    const targetOrg = orgId || currentState.activeOrgId;
    return currentState.assets.filter((a) => a.organizationId === targetOrg);
  },

  getTeams(orgId?: string): FieldTeam[] {
    const targetOrg = orgId || currentState.activeOrgId;
    return currentState.teams.filter((t) => t.organizationId === targetOrg);
  },

  getWorkers(orgId?: string): FieldWorker[] {
    const targetOrg = orgId || currentState.activeOrgId;
    return currentState.workers.filter((w) => w.organizationId === targetOrg);
  },

  getZonesRisk(): ZoneRisk[] {
    const activeIncidents = this.getIncidents();
    return SEED_ZONES_CONFIG.map((zoneCfg) => {
      const activeCount = activeIncidents.filter(
        (i) => i.zoneId === zoneCfg.id && i.status !== 'RESOLVED' && i.status !== 'CLOSED'
      ).length;
      return calculateZoneRiskMetrics(zoneCfg, currentState.weather, activeCount);
    });
  },

  addIncident(incident: Incident): Incident {
    currentState.incidents = [incident, ...currentState.incidents];
    
    // Add audit log
    this.addAuditLog({
      id: `log-${Date.now()}`,
      organizationId: incident.organizationId,
      timestamp: 'Just now',
      userName: incident.reportedBy.name,
      userRole: incident.reportedBy.isCitizen ? 'CITIZEN' : 'SYSTEM',
      action: 'REPORT_SUBMITTED',
      entityType: 'INCIDENT',
      entityId: incident.id,
      previousValue: undefined,
      newValue: `${incident.category} (${incident.severity})`,
      metadata: `Priority: ${incident.priorityScore}/100 | Zone: ${incident.zoneName}`,
    });

    // Notify Admins
    this.addNotification({
      id: `notif-${Date.now()}`,
      targetRole: 'ADMIN',
      organizationId: incident.organizationId,
      title: `${incident.severity === 'CRITICAL' ? '🔴 CRITICAL: ' : '⚠️ '}${incident.title}`,
      message: `New incident reported in ${incident.zoneName}. Priority ${incident.priorityScore}/100. Loss: ${incident.estimatedWaterLossLitersPerDay.toLocaleString()} L/day.`,
      incidentId: incident.id,
      type: incident.severity === 'CRITICAL' ? 'CRITICAL_ALERT' : 'STATUS_UPDATE',
      isRead: false,
      createdAt: 'Just now',
    });

    saveState();
    return incident;
  },

  assignIncident(incidentId: string, teamId: string, workerId?: string) {
    const inc = currentState.incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    const team = currentState.teams.find((t) => t.id === teamId);
    const worker = currentState.workers.find((w) => w.id === workerId) || currentState.workers.find((w) => w.teamId === teamId);

    const prevTeam = inc.assignedTeamName || 'Unassigned';
    inc.assignedTeamId = teamId;
    inc.assignedTeamName = team?.name || 'Field Team';
    inc.assignedWorkerId = worker?.id;
    inc.assignedWorkerName = worker?.name;
    inc.status = 'ASSIGNED';
    inc.updatedAt = new Date().toISOString();

    inc.timeline.push({
      id: `tl-${Date.now()}`,
      timestamp: 'Just now',
      title: `Assigned to ${team?.name || 'Field Team'}`,
      description: `Dispatched ${worker?.name || 'field crew'} for immediate inspection.`,
      actor: currentState.currentUser.name,
      actorRole: currentState.currentUser.role,
      stage: 'ASSIGNED',
    });

    this.addAuditLog({
      id: `log-${Date.now()}`,
      organizationId: inc.organizationId,
      timestamp: 'Just now',
      userName: currentState.currentUser.name,
      userRole: currentState.currentUser.role,
      action: 'INCIDENT_ASSIGNED',
      entityType: 'ASSIGNMENT',
      entityId: incidentId,
      previousValue: prevTeam,
      newValue: `${team?.name} (${worker?.name})`,
      metadata: `Priority ${inc.priorityScore}/100`,
    });

    // Notify worker
    this.addNotification({
      id: `notif-${Date.now()}`,
      targetRole: 'FIELD_WORKER',
      userId: worker?.id,
      organizationId: inc.organizationId,
      title: `⚠️ New Assignment: ${inc.id}`,
      message: `You have been assigned to ${inc.title} in ${inc.zoneName}.`,
      incidentId: inc.id,
      type: 'ASSIGNMENT',
      isRead: false,
      createdAt: 'Just now',
    });

    // Notify citizen reporter
    this.addNotification({
      id: `notif-cit-${Date.now()}`,
      targetRole: 'CITIZEN',
      organizationId: inc.organizationId,
      title: `Assignment Update: ${inc.id}`,
      message: `Your report has been assigned to ${team?.name || 'Field Team 7'}. Inspection crew is en route.`,
      incidentId: inc.id,
      type: 'STATUS_UPDATE',
      isRead: false,
      createdAt: 'Just now',
    });

    saveState();
  },

  startInspection(incidentId: string, workerNotes?: string, beforePhotoUrl?: string) {
    const inc = currentState.incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    inc.status = 'IN_PROGRESS';
    inc.workerNotes = workerNotes || inc.workerNotes || 'Inspection initiated. Pressure gauges deployed, excavating valve manifold.';
    inc.updatedAt = new Date().toISOString();

    if (beforePhotoUrl) {
      inc.photos.push({
        id: `photo-b-${Date.now()}`,
        url: beforePhotoUrl,
        caption: 'Before Repair: On-site breach inspection',
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentState.currentUser.name,
        type: 'BEFORE_REPAIR',
      });
    }

    inc.timeline.push({
      id: `tl-${Date.now()}`,
      timestamp: 'Just now',
      title: 'Inspection Commenced & Before Photo Uploaded',
      description: workerNotes || 'Worker on-site; baseline water loss rate confirmed.',
      actor: currentState.currentUser.name,
      actorRole: 'FIELD_WORKER',
      stage: 'INSPECTION',
    });

    this.addAuditLog({
      id: `log-${Date.now()}`,
      organizationId: inc.organizationId,
      timestamp: 'Just now',
      userName: currentState.currentUser.name,
      userRole: 'FIELD_WORKER',
      action: 'INSPECTION_STARTED',
      entityType: 'INCIDENT',
      entityId: incidentId,
      previousValue: 'ASSIGNED',
      newValue: 'IN_PROGRESS',
    });

    saveState();
  },

  submitResolution(
    incidentId: string,
    params: {
      beforePhotoUrl?: string;
      afterPhotoUrl: string;
      repairNotes: string;
      aiVerificationConfidence: number;
      aiVerificationResult: 'VERIFIED_RESOLVED' | 'NEEDS_REVIEW';
      aiVerificationNotes?: string;
    }
  ) {
    const inc = currentState.incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    const isResolved = params.aiVerificationResult === 'VERIFIED_RESOLVED';
    inc.status = isResolved ? 'RESOLVED' : 'IN_PROGRESS';
    inc.workerNotes = params.repairNotes;
    inc.updatedAt = new Date().toISOString();

    // Water saved calculations
    if (isResolved) {
      inc.waterSavedLiters = inc.estimatedWaterLossLitersPerDay;
    }

    if (params.afterPhotoUrl) {
      inc.photos.push({
        id: `photo-a-${Date.now()}`,
        url: params.afterPhotoUrl,
        caption: 'After Repair: Resolution proof and dry surface inspection',
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentState.currentUser.name,
        type: 'AFTER_REPAIR',
      });
    }

    inc.resolutionDetails = {
      resolvedAt: new Date().toISOString(),
      resolvedByWorkerId: currentState.currentUser.id,
      beforePhotoUrl: params.beforePhotoUrl || inc.photos.find((p) => p.type === 'BEFORE_REPAIR')?.url,
      afterPhotoUrl: params.afterPhotoUrl,
      aiVerificationConfidence: params.aiVerificationConfidence,
      aiVerificationResult: params.aiVerificationResult,
      aiVerificationNotes: params.aiVerificationNotes || 'AI Vision: Flow arrested, structural repair validated.',
      adminOverride: false,
      actualRepairMethod: params.repairNotes,
    };

    inc.timeline.push({
      id: `tl-rep-${Date.now()}`,
      timestamp: 'Just now',
      title: 'Repair Completed & After Photo Uploaded',
      description: params.repairNotes,
      actor: currentState.currentUser.name,
      actorRole: 'FIELD_WORKER',
      stage: 'IN_PROGRESS',
    });

    inc.timeline.push({
      id: `tl-ai-${Date.now()}`,
      timestamp: 'Just now',
      title: `AI Repair Verification: ${params.aiVerificationConfidence}% Confidence`,
      description: params.aiVerificationNotes || 'Computer vision verified that water leak is sealed and surface has dried.',
      actor: 'AquaGrid AI Vision',
      actorRole: 'AI',
      stage: 'REPAIR_VERIFIED',
    });

    if (isResolved) {
      inc.timeline.push({
        id: `tl-res-${Date.now()}`,
        timestamp: 'Just now',
        title: 'Incident Officially RESOLVED',
        description: `Loss prevented: ${inc.estimatedWaterLossLitersPerDay.toLocaleString()} L/day preserved for municipal distribution.`,
        actor: 'AquaGrid Operations System',
        actorRole: 'SYSTEM',
        stage: 'RESOLVED',
      });
    }

    // Add Audit Log
    this.addAuditLog({
      id: `log-${Date.now()}`,
      organizationId: inc.organizationId,
      timestamp: 'Just now',
      userName: currentState.currentUser.name,
      userRole: 'FIELD_WORKER',
      action: 'REPAIR_SUBMITTED_AND_VERIFIED',
      entityType: 'VERIFICATION',
      entityId: incidentId,
      previousValue: 'IN_PROGRESS',
      newValue: isResolved ? 'RESOLVED' : 'NEEDS_REVIEW',
      metadata: `AI Confidence: ${params.aiVerificationConfidence}% | Saved: ${inc.waterSavedLiters?.toLocaleString() || 0} L`,
    });

    // Notify Admin
    this.addNotification({
      id: `notif-admin-${Date.now()}`,
      targetRole: 'ADMIN',
      organizationId: inc.organizationId,
      title: `✅ Incident ${inc.id} Resolved`,
      message: `Field Team repaired leak in ${inc.zoneName}. AI Verification: ${params.aiVerificationConfidence}%. Water saved: ${inc.estimatedWaterLossLitersPerDay.toLocaleString()} L/day.`,
      incidentId: inc.id,
      type: 'RESOLUTION',
      isRead: false,
      createdAt: 'Just now',
    });

    // Notify Citizen
    this.addNotification({
      id: `notif-cit-${Date.now()}`,
      targetRole: 'CITIZEN',
      organizationId: inc.organizationId,
      title: `🎉 Issue Resolved: ${inc.id}`,
      message: `Your reported water issue has been verified and repaired by our municipal field unit. Thank you for protecting our urban water!`,
      incidentId: inc.id,
      type: 'RESOLUTION',
      isRead: false,
      createdAt: 'Just now',
    });

    saveState();
  },

  adminOverrideVerification(incidentId: string, approve: boolean) {
    const inc = currentState.incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    inc.status = approve ? 'RESOLVED' : 'IN_PROGRESS';
    if (inc.resolutionDetails) {
      inc.resolutionDetails.adminOverride = true;
      inc.resolutionDetails.aiVerificationResult = approve ? 'VERIFIED_RESOLVED' : 'NEEDS_REVIEW';
    }
    if (approve) {
      inc.waterSavedLiters = inc.estimatedWaterLossLitersPerDay;
    }

    inc.timeline.push({
      id: `tl-ovr-${Date.now()}`,
      timestamp: 'Just now',
      title: `Admin Override: ${approve ? 'Approved Resolution' : 'Reopened for Further Work'}`,
      description: `Chief Commissioner overridden status directly.`,
      actor: currentState.currentUser.name,
      actorRole: 'ADMIN',
      stage: approve ? 'RESOLVED' : 'IN_PROGRESS',
    });

    this.addAuditLog({
      id: `log-${Date.now()}`,
      organizationId: inc.organizationId,
      timestamp: 'Just now',
      userName: currentState.currentUser.name,
      userRole: 'ADMIN',
      action: 'ADMIN_OVERRIDE',
      entityType: 'VERIFICATION',
      entityId: incidentId,
      previousValue: approve ? 'NEEDS_REVIEW' : 'RESOLVED',
      newValue: approve ? 'RESOLVED (ADMIN OVERRIDE)' : 'IN_PROGRESS',
    });

    saveState();
  },

  scheduleAssetMaintenance(assetId: string) {
    const asset = currentState.assets.find((a) => a.id === assetId);
    if (!asset) return;

    asset.status = 'OPERATIONAL';
    asset.riskScore = Math.max(15, asset.riskScore - 35);
    asset.riskLevel = asset.riskScore >= 80 ? 'CRITICAL' : asset.riskScore >= 60 ? 'HIGH' : asset.riskScore >= 40 ? 'MEDIUM' : 'LOW';
    asset.lastMaintenanceDate = new Date().toISOString().split('T')[0];

    this.addAuditLog({
      id: `log-${Date.now()}`,
      organizationId: asset.organizationId,
      timestamp: 'Just now',
      userName: currentState.currentUser.name,
      userRole: currentState.currentUser.role,
      action: 'PREVENTIVE_MAINTENANCE_SCHEDULED',
      entityType: 'ASSET',
      entityId: assetId,
      previousValue: 'MAINTENANCE_REQUIRED',
      newValue: 'OPERATIONAL',
      metadata: 'Preventive acoustic relining and pressure testing completed.',
    });

    this.addNotification({
      id: `notif-${Date.now()}`,
      targetRole: 'ADMIN',
      organizationId: asset.organizationId,
      title: `🔧 Maintenance Logged: ${asset.id}`,
      message: `Preventive maintenance successfully registered for ${asset.name}. Risk score reduced to ${asset.riskScore}/100.`,
      type: 'SYSTEM',
      isRead: false,
      createdAt: 'Just now',
    });

    saveState();
  },

  addAuditLog(entry: AuditLogItem) {
    currentState.auditLogs = [entry, ...currentState.auditLogs];
    saveState();
  },

  addNotification(notif: InAppNotification) {
    currentState.notifications = [notif, ...currentState.notifications];
    saveState();
  },

  markNotificationRead(id: string) {
    const n = currentState.notifications.find((item) => item.id === id);
    if (n) {
      n.isRead = true;
      saveState();
    }
  },

  markAllNotificationsRead() {
    currentState.notifications.forEach((n) => (n.isRead = true));
    saveState();
  },
};
