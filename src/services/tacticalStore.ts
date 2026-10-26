import {
  User,
  UserRole,
  Personnel,
  CasualtyIncident,
  InventoryItem,
  GeographicFeature,
  SupplyItem,
  MedicalFacility,
  MaintenanceAsset,
  TrainingCourse,
  WeatherObservation,
  AuditLog,
  NotificationItem,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PERSONNEL,
  INITIAL_CASUALTIES,
  INITIAL_INVENTORY,
  INITIAL_GEOGRAPHIC_FEATURES,
  INITIAL_SUPPLIES,
  INITIAL_MEDICAL_FACILITIES,
  INITIAL_MAINTENANCE_ASSETS,
  INITIAL_TRAINING_COURSES,
  INITIAL_WEATHER,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './tacticalData';

const STORAGE_KEYS = {
  USERS: 'mms_users',
  ACTIVE_USER_ID: 'mms_active_user_id',
  PERSONNEL: 'mms_personnel',
  CASUALTIES: 'mms_casualties',
  INVENTORY: 'mms_inventory',
  GEO_FEATURES: 'mms_geo_features',
  SUPPLIES: 'mms_supplies',
  MEDICAL: 'mms_medical',
  MAINTENANCE: 'mms_maintenance',
  TRAINING: 'mms_training',
  WEATHER: 'mms_weather',
  NOTIFICATIONS: 'mms_notifications',
  AUDIT_LOGS: 'mms_audit_logs',
};

function loadItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed to parse localStorage key ${key}`, e);
    return defaultValue;
  }
}

function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save localStorage key ${key}`, e);
  }
}

type Listener = () => void;

class TacticalStore {
  private listeners: Set<Listener> = new Set();

  public users: User[] = loadItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  public activeUserId: string = loadItem(STORAGE_KEYS.ACTIVE_USER_ID, INITIAL_USERS[0].id);
  public personnel: Personnel[] = loadItem(STORAGE_KEYS.PERSONNEL, INITIAL_PERSONNEL);
  public casualties: CasualtyIncident[] = loadItem(STORAGE_KEYS.CASUALTIES, INITIAL_CASUALTIES);
  public inventory: InventoryItem[] = loadItem(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  public geoFeatures: GeographicFeature[] = loadItem(STORAGE_KEYS.GEO_FEATURES, INITIAL_GEOGRAPHIC_FEATURES);
  public supplies: SupplyItem[] = loadItem(STORAGE_KEYS.SUPPLIES, INITIAL_SUPPLIES);
  public medicalFacilities: MedicalFacility[] = loadItem(STORAGE_KEYS.MEDICAL, INITIAL_MEDICAL_FACILITIES);
  public maintenanceAssets: MaintenanceAsset[] = loadItem(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_ASSETS);
  public trainingCourses: TrainingCourse[] = loadItem(STORAGE_KEYS.TRAINING, INITIAL_TRAINING_COURSES);
  public weather: WeatherObservation[] = loadItem(STORAGE_KEYS.WEATHER, INITIAL_WEATHER);
  public notifications: NotificationItem[] = loadItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  public auditLogs: AuditLog[] = loadItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getActiveUser(): User {
    const found = this.users.find((u) => u.id === this.activeUserId);
    return found || this.users[0];
  }

  public setActiveUser(userId: string): void {
    this.activeUserId = userId;
    saveItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
    const user = this.getActiveUser();
    this.addAuditLog(
      'ROLE_SWITCH',
      'Security & Access Control',
      `Switched session to ${user.displayName} (${user.role})`,
      'SUCCESS'
    );
    this.notify();
  }

  public addAuditLog(
    action: string,
    module: string,
    details: string,
    status: 'SUCCESS' | 'DENIED' | 'FLAGGED' = 'SUCCESS',
    targetRecord: string = 'N/A'
  ): void {
    const currentUser = this.getActiveUser();
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actorId: currentUser.id,
      actorName: currentUser.displayName,
      actorRole: currentUser.role,
      action,
      module,
      targetRecord,
      details,
      ipAddress: '10.14.88.' + (Math.floor(Math.random() * 50) + 10),
      status,
    };
    this.auditLogs = [newLog, ...this.auditLogs];
    saveItem(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    this.notify();
  }

  public addNotification(
    title: string,
    message: string,
    module: string,
    severity: 'Critical' | 'Warning' | 'Info' | 'Success',
    linkModule?: string
  ): void {
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      title,
      message,
      module,
      severity,
      read: false,
      linkModule,
    };
    this.notifications = [notif, ...this.notifications];
    saveItem(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public markNotificationAsRead(id: string): void {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveItem(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public clearAllNotifications(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    saveItem(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  // --- Role Check Helper ---
  public checkPermission(allowedRoles: UserRole[]): { allowed: boolean; reason?: string } {
    const user = this.getActiveUser();
    if (user.role === 'System Administrator') return { allowed: true };
    if (allowedRoles.includes(user.role)) return { allowed: true };
    return {
      allowed: false,
      reason: `Access restricted. Your role '${user.role}' lacks permission for this operation. Required: ${allowedRoles.join(', ')}`,
    };
  }

  // --- Personnel & Casualty Operations ---
  public addPersonnel(person: Omit<Personnel, 'lastUpdated'>): { success: boolean; message: string } {
    const perm = this.checkPermission(['Personnel Officer', 'Command Supervisor']);
    if (!perm.allowed) {
      this.addAuditLog('ADD_PERSONNEL_DENIED', 'Personnel', perm.reason!, 'DENIED', person.serviceId);
      return { success: false, message: perm.reason! };
    }

    if (this.personnel.some((p) => p.serviceId.toLowerCase() === person.serviceId.toLowerCase())) {
      return { success: false, message: `Conflict: Service ID ${person.serviceId} already exists in registry.` };
    }

    const newPerson: Personnel = {
      ...person,
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
    };
    this.personnel = [newPerson, ...this.personnel];
    saveItem(STORAGE_KEYS.PERSONNEL, this.personnel);
    this.addAuditLog('ADD_PERSONNEL', 'Personnel', `Added ${newPerson.rank} ${newPerson.name}`, 'SUCCESS', newPerson.serviceId);
    this.notify();
    return { success: true, message: `Personnel record for ${newPerson.name} registered successfully.` };
  }

  public updatePersonnelStatus(
    serviceId: string,
    newStatus: Personnel['status'],
    reason: string
  ): { success: boolean; message: string } {
    const perm = this.checkPermission(['Personnel Officer', 'Command Supervisor', 'Medical Officer']);
    if (!perm.allowed) {
      this.addAuditLog('UPDATE_PERSONNEL_STATUS_DENIED', 'Personnel', perm.reason!, 'DENIED', serviceId);
      return { success: false, message: perm.reason! };
    }

    this.personnel = this.personnel.map((p) => {
      if (p.serviceId === serviceId) {
        return {
          ...p,
          status: newStatus,
          lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
        };
      }
      return p;
    });
    saveItem(STORAGE_KEYS.PERSONNEL, this.personnel);
    this.addAuditLog(
      'UPDATE_PERSONNEL_STATUS',
      'Personnel',
      `Changed status of ${serviceId} to ${newStatus}. Reason: ${reason}`,
      'SUCCESS',
      serviceId
    );
    this.notify();
    return { success: true, message: `Personnel ${serviceId} updated to ${newStatus}.` };
  }

  public fileCasualtyIncident(
    incident: Omit<CasualtyIncident, 'id' | 'timestamp' | 'auditNotes'>
  ): { success: boolean; message: string } {
    const perm = this.checkPermission(['Personnel Officer', 'Medical Officer', 'Command Supervisor']);
    if (!perm.allowed) {
      this.addAuditLog('FILE_CASUALTY_DENIED', 'Casualty Management', perm.reason!, 'DENIED');
      return { success: false, message: perm.reason! };
    }

    const newId = `CAS-2026-0${this.casualties.length + 84}`;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
    const newIncident: CasualtyIncident = {
      ...incident,
      id: newId,
      timestamp,
      auditNotes: [
        `${timestamp} - Reported by ${this.getActiveUser().displayName}`,
        `Verification Status: ${incident.verificationStatus}`,
      ],
    };

    this.casualties = [newIncident, ...this.casualties];
    saveItem(STORAGE_KEYS.CASUALTIES, this.casualties);

    // If verified, update the soldier status
    if (incident.verificationStatus === 'Confirmed') {
      const targetStatus = incident.severity === 'Fatal' ? 'Deceased' : incident.severity === 'Critical' ? 'Hospitalized' : 'Injured';
      this.personnel = this.personnel.map((p) =>
        p.serviceId === incident.serviceId ? { ...p, status: targetStatus, verificationStatus: 'Confirmed' } : p
      );
      saveItem(STORAGE_KEYS.PERSONNEL, this.personnel);
    }

    this.addAuditLog(
      'FILE_CASUALTY_INCIDENT',
      'Casualty Management',
      `Filed ${newIncident.id} (${newIncident.severity}) for ${newIncident.personnelName}. Verification: ${newIncident.verificationStatus}`,
      'SUCCESS',
      newIncident.id
    );

    if (newIncident.severity === 'Critical' || newIncident.severity === 'Fatal') {
      this.addNotification(
        `HIGH PRIORITY CASUALTY: ${newIncident.personnelName}`,
        `Casualty ${newIncident.id} filed with severity '${newIncident.severity}'. NOK action required.`,
        'Soldier Status & Casualties',
        'Critical',
        'personnel'
      );
    }

    this.notify();
    return { success: true, message: `Incident ${newId} logged successfully.` };
  }

  public verifyCasualtyIncident(incidentId: string): { success: boolean; message: string } {
    const perm = this.checkPermission(['Personnel Officer', 'Command Supervisor']);
    if (!perm.allowed) {
      return { success: false, message: perm.reason! };
    }

    let targetPersonId = '';
    let targetSeverity = '';
    this.casualties = this.casualties.map((c) => {
      if (c.id === incidentId) {
        targetPersonId = c.serviceId;
        targetSeverity = c.severity;
        const note = `${new Date().toISOString().slice(11, 16)} UTC - Verified by ${this.getActiveUser().displayName}`;
        return {
          ...c,
          verificationStatus: 'Confirmed',
          auditNotes: [...c.auditNotes, note],
        };
      }
      return c;
    });

    if (targetPersonId) {
      const newStatus = targetSeverity === 'Fatal' ? 'Deceased' : targetSeverity === 'Critical' ? 'Hospitalized' : 'Injured';
      this.personnel = this.personnel.map((p) =>
        p.serviceId === targetPersonId ? { ...p, status: newStatus, verificationStatus: 'Confirmed' } : p
      );
      saveItem(STORAGE_KEYS.PERSONNEL, this.personnel);
    }

    saveItem(STORAGE_KEYS.CASUALTIES, this.casualties);
    this.addAuditLog('VERIFY_CASUALTY', 'Casualty Management', `Verified casualty report ${incidentId}`, 'SUCCESS', incidentId);
    this.notify();
    return { success: true, message: `Casualty incident ${incidentId} confirmed and verified.` };
  }

  public updateReturnToDuty(
    incidentId: string,
    newStatus: CasualtyIncident['returnToDutyStatus']
  ): { success: boolean; message: string } {
    // Only Medical Officer or System Admin can sign off medical return to duty!
    const perm = this.checkPermission(['Medical Officer']);
    if (!perm.allowed) {
      this.addAuditLog('RETURN_TO_DUTY_DENIED', 'Medical Management', perm.reason!, 'DENIED', incidentId);
      return { success: false, message: 'Restricted: Only certified Medical Officers can authorize Return to Duty.' };
    }

    const doctor = this.getActiveUser().displayName;
    let targetPersonId = '';
    this.casualties = this.casualties.map((c) => {
      if (c.id === incidentId) {
        targetPersonId = c.serviceId;
        const note = `${new Date().toISOString().slice(11, 16)} UTC - Return to duty updated to '${newStatus}' by ${doctor}`;
        return {
          ...c,
          returnToDutyStatus: newStatus,
          clearedByMedicalOfficer: doctor,
          auditNotes: [...c.auditNotes, note],
        };
      }
      return c;
    });

    if (targetPersonId && newStatus === 'Cleared Full Duty') {
      this.personnel = this.personnel.map((p) =>
        p.serviceId === targetPersonId ? { ...p, status: 'Active' } : p
      );
      saveItem(STORAGE_KEYS.PERSONNEL, this.personnel);
    }

    saveItem(STORAGE_KEYS.CASUALTIES, this.casualties);
    this.addAuditLog('RETURN_TO_DUTY_SIGN_OFF', 'Medical Management', `Authorized ${newStatus} for ${incidentId}`, 'SUCCESS', incidentId);
    this.notify();
    return { success: true, message: `Return to duty status set to ${newStatus}.` };
  }

  // --- Inventory Operations ---
  public issueOrReturnInventory(
    itemId: string,
    action: 'Issue' | 'Return',
    custodian: string
  ): { success: boolean; message: string } {
    const perm = this.checkPermission(['Logistics Officer', 'Command Supervisor']);
    if (!perm.allowed) {
      return { success: false, message: perm.reason! };
    }

    this.inventory = this.inventory.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          status: action === 'Issue' ? 'Issued' : 'Available',
          custodian: action === 'Issue' ? custodian : 'Armory Pool',
          lastAuditDate: new Date().toISOString().slice(0, 10),
        };
      }
      return item;
    });
    saveItem(STORAGE_KEYS.INVENTORY, this.inventory);
    this.addAuditLog(
      action === 'Issue' ? 'INVENTORY_ISSUED' : 'INVENTORY_RETURNED',
      'Weapons & Ammunition',
      `${action} recorded for asset ${itemId}. Custodian: ${custodian}`,
      'SUCCESS',
      itemId
    );
    this.notify();
    return { success: true, message: `Asset ${itemId} ${action.toLowerCase()}d successfully.` };
  }

  public quarantineInventoryItem(itemId: string, reason: string): { success: boolean; message: string } {
    const perm = this.checkPermission(['Logistics Officer', 'Command Supervisor']);
    if (!perm.allowed) return { success: false, message: perm.reason! };

    this.inventory = this.inventory.map((item) =>
      item.id === itemId ? { ...item, status: 'Quarantined', discrepancyReported: true } : item
    );
    saveItem(STORAGE_KEYS.INVENTORY, this.inventory);
    this.addAuditLog('INVENTORY_QUARANTINED', 'Weapons & Ammunition', `Quarantined item ${itemId}. Reason: ${reason}`, 'SUCCESS', itemId);
    this.notify();
    return { success: true, message: `Item ${itemId} has been moved to Quarantine.` };
  }

  // --- Logistics Operations ---
  public requestSupplyRequisition(
    supplyId: string,
    orderQuantity: number
  ): { success: boolean; message: string } {
    const perm = this.checkPermission(['Logistics Officer', 'Command Supervisor']);
    if (!perm.allowed) return { success: false, message: perm.reason! };

    this.supplies = this.supplies.map((s) => {
      if (s.id === supplyId) {
        return {
          ...s,
          replenishmentStatus: 'In Transit',
        };
      }
      return s;
    });
    saveItem(STORAGE_KEYS.SUPPLIES, this.supplies);
    this.addAuditLog(
      'SUPPLY_REQUISITION',
      'Logistics & Supply',
      `Requisition dispatched for ${orderQuantity} units of ${supplyId}`,
      'SUCCESS',
      supplyId
    );
    this.addNotification(
      'SUPPLY REQUISITION DISPATCHED',
      `Requisition for ${orderQuantity} units of ${supplyId} initiated. Delivery convoy queued.`,
      'Logistics & Supply Chain',
      'Info',
      'logistics'
    );
    this.notify();
    return { success: true, message: `Supply requisition queued for delivery.` };
  }

  // --- Maintenance Operations ---
  public createFaultTicket(
    assetId: string,
    ticket: Omit<MaintenanceAsset['faultTickets'][0], 'ticketId' | 'reportedDate'>
  ): { success: boolean; message: string } {
    const perm = this.checkPermission(['Maintenance Officer', 'Command Supervisor']);
    if (!perm.allowed) return { success: false, message: perm.reason! };

    const newTicketId = `TCK-2026-0${Math.floor(Math.random() * 900) + 100}`;
    const reportedDate = new Date().toISOString().slice(0, 10);

    this.maintenanceAssets = this.maintenanceAssets.map((asset) => {
      if (asset.id === assetId) {
        return {
          ...asset,
          serviceability: 'Under Repair',
          faultTickets: [
            ...asset.faultTickets,
            {
              ...ticket,
              ticketId: newTicketId,
              reportedDate,
            },
          ],
        };
      }
      return asset;
    });

    saveItem(STORAGE_KEYS.MAINTENANCE, this.maintenanceAssets);
    this.addAuditLog('FAULT_TICKET_OPENED', 'Equipment Maintenance', `Created ticket ${newTicketId} on asset ${assetId}`, 'SUCCESS', assetId);
    this.notify();
    return { success: true, message: `Maintenance ticket ${newTicketId} created.` };
  }

  public advanceMaintenanceStage(
    assetId: string,
    ticketId: string,
    newStage: MaintenanceAsset['faultTickets'][0]['stage'],
    technicianNotes?: string
  ): { success: boolean; message: string } {
    const perm = this.checkPermission(['Maintenance Officer']);
    if (!perm.allowed) return { success: false, message: perm.reason! };

    this.maintenanceAssets = this.maintenanceAssets.map((asset) => {
      if (asset.id === assetId) {
        const updatedTickets = asset.faultTickets.map((t) => {
          if (t.ticketId === ticketId) {
            return {
              ...t,
              stage: newStage,
              ...(newStage === 'Closed' ? { closedDate: new Date().toISOString().slice(0, 10) } : {}),
            };
          }
          return t;
        });
        return {
          ...asset,
          faultTickets: updatedTickets,
        };
      }
      return asset;
    });

    saveItem(STORAGE_KEYS.MAINTENANCE, this.maintenanceAssets);
    this.addAuditLog('MAINTENANCE_STAGE_UPDATED', 'Equipment Maintenance', `Ticket ${ticketId} progressed to ${newStage}`, 'SUCCESS', ticketId);
    this.notify();
    return { success: true, message: `Maintenance stage set to ${newStage}.` };
  }

  public authorizeAssetReturnToService(
    assetId: string,
    inspectorName: string
  ): { success: boolean; message: string } {
    // ENFORCEMENT OF RULE 12: An asset must not automatically return to serviceable status until authorized inspection and verification are recorded!
    const perm = this.checkPermission(['Maintenance Officer']);
    if (!perm.allowed) {
      this.addAuditLog('PMCS_SIGN_OFF_DENIED', 'Equipment Maintenance', perm.reason!, 'DENIED', assetId);
      return { success: false, message: 'Restricted: Only certified Maintenance Officers can certify serviceability.' };
    }

    this.maintenanceAssets = this.maintenanceAssets.map((asset) => {
      if (asset.id === assetId) {
        return {
          ...asset,
          serviceability: 'Serviceable',
          overdue: false,
          lastPmcsDate: new Date().toISOString().slice(0, 10),
          nextPmcsDue: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        };
      }
      return asset;
    });

    saveItem(STORAGE_KEYS.MAINTENANCE, this.maintenanceAssets);
    this.addAuditLog(
      'ASSET_SERVICEABILITY_CERTIFIED',
      'Equipment Maintenance',
      `Authorized return to SERVICEABLE for ${assetId}. Inspected by ${inspectorName}`,
      'SUCCESS',
      assetId
    );
    this.notify();
    return { success: true, message: `Asset ${assetId} formally inspected and returned to Serviceable.` };
  }

  // --- Training Operations ---
  public enrollInCourse(courseId: string, soldierName: string): { success: boolean; message: string } {
    const perm = this.checkPermission(['Training Officer', 'Personnel Officer']);
    if (!perm.allowed) return { success: false, message: perm.reason! };

    this.trainingCourses = this.trainingCourses.map((c) =>
      c.id === courseId ? { ...c, enrolledCount: c.enrolledCount + 1 } : c
    );
    saveItem(STORAGE_KEYS.TRAINING, this.trainingCourses);
    this.addAuditLog('TRAINING_ENROLLMENT', 'Training & Readiness', `Enrolled ${soldierName} in course ${courseId}`, 'SUCCESS', courseId);
    this.notify();
    return { success: true, message: `Soldier enrolled in training course.` };
  }

  // --- Reset to Demonstration Data ---
  public resetToFactoryDemo(): void {
    localStorage.clear();
    this.users = INITIAL_USERS;
    this.activeUserId = INITIAL_USERS[0].id;
    this.personnel = INITIAL_PERSONNEL;
    this.casualties = INITIAL_CASUALTIES;
    this.inventory = INITIAL_INVENTORY;
    this.geoFeatures = INITIAL_GEOGRAPHIC_FEATURES;
    this.supplies = INITIAL_SUPPLIES;
    this.medicalFacilities = INITIAL_MEDICAL_FACILITIES;
    this.maintenanceAssets = INITIAL_MAINTENANCE_ASSETS;
    this.trainingCourses = INITIAL_TRAINING_COURSES;
    this.weather = INITIAL_WEATHER;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.notify();
  }
}

export const tacticalStore = new TacticalStore();
