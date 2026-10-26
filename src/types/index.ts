export type UserRole =
  | 'System Administrator'
  | 'Command Supervisor'
  | 'Personnel Officer'
  | 'Medical Officer'
  | 'Logistics Officer'
  | 'Maintenance Officer'
  | 'Training Officer'
  | 'Read-Only Auditor';

export type ClearanceLevel = 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET';

export interface User {
  id: string;
  username: string;
  displayName: string;
  rank: string;
  role: UserRole;
  clearanceLevel: ClearanceLevel;
  assignedUnit: string;
  email: string;
  mfaEnabled: boolean;
  lastLogin: string;
}

export type PersonnelStatus =
  | 'Active'
  | 'On Leave'
  | 'Injured'
  | 'Hospitalized'
  | 'Missing'
  | 'Deceased'
  | 'Temporarily Unavailable';

export type VerificationStatus = 'Confirmed' | 'Unverified';

export interface Personnel {
  serviceId: string;
  name: string;
  rank: string;
  unit: string;
  assignedRole: string;
  status: PersonnelStatus;
  contactInfo: {
    phone: string;
    emergencyContact: string;
    emergencyPhone: string;
  };
  bloodType: string;
  verificationStatus: VerificationStatus;
  lastUpdated: string;
  nokStatus: 'Pending' | 'Notified - Phone' | 'Delivered - In Person' | 'Not Applicable';
  assignedEquipment: string[];
}

export interface CasualtyIncident {
  id: string;
  timestamp: string;
  incidentReference: string;
  serviceId: string;
  personnelName: string;
  unit: string;
  incidentType: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Critical' | 'Fatal';
  reportingAuthority: string;
  verificationStatus: VerificationStatus;
  medevacRequested: boolean;
  medevacStatus: 'Pending' | 'En Route' | 'Completed' | 'N/A';
  receivingFacilityId: string;
  receivingFacilityName: string;
  returnToDutyStatus: 'Not Cleared' | 'Pending Medical Evaluation' | 'Cleared for Limited Duty' | 'Cleared Full Duty';
  clearedByMedicalOfficer?: string;
  nokNotificationState: 'Pending' | 'Notified - Phone' | 'Delivered - In Person';
  auditNotes: string[];
}

export type InventoryStatus =
  | 'Available'
  | 'Reserved'
  | 'Issued'
  | 'Returned'
  | 'Damaged'
  | 'Quarantined'
  | 'Under Inspection';

export interface InventoryItem {
  id: string;
  category: 'Small Arms' | 'Heavy Weapons' | 'Ammunition' | 'Optics & Thermal' | 'Communications' | 'Body Armor';
  nomenclature: string;
  serialNumber: string;
  quantity: number;
  unitOfIssue: string;
  minStockThreshold: number;
  storageLocation: string;
  custodian: string;
  status: InventoryStatus;
  batchLotId?: string;
  inspectionDate: string;
  nextInspectionDue: string;
  discrepancyReported: boolean;
  lastAuditDate: string;
}

export interface GeographicFeature {
  id: string;
  name: string;
  type: 'Base / HQ' | 'Forward Outpost' | 'Warehouse / Depot' | 'Medical Facility' | 'Bridge' | 'Mountain Pass' | 'Supply Transit Route';
  coordinates: [number, number];
  status: 'Operational' | 'Caution' | 'Compromised' | 'Blocked';
  elevationMeters: number;
  hazardRisks: {
    type: 'Flood' | 'Landslide' | 'Extreme Weather' | 'Structural Damage' | 'Road Block';
    severity: 'Low' | 'Medium' | 'High' | 'Severe';
    description: string;
  }[];
  accessibilityScore: number;
  capacityOrDetails: string;
  source: string;
}

export interface SupplyItem {
  id: string;
  category: 'Rations (MRE)' | 'Potable Water' | 'Fuel (JP-8/Diesel)' | 'Medical Supplies' | 'Vehicle Parts' | 'Tactical Batteries';
  name: string;
  warehouseLocation: string;
  currentStock: number;
  allocatedStock: number;
  unit: string;
  dailyBurnRate: number;
  daysOfSupplyRemaining: number;
  minReorderPoint: number;
  expiryDate?: string;
  replenishmentStatus: 'Adequate' | 'Reorder Suggested' | 'Critical Shortage' | 'In Transit';
  supplier: string;
}

export interface MedicalFacility {
  id: string;
  name: string;
  echelonRole: 'Role 1 (Battalion Aid)' | 'Role 2 (Forward Surgical)' | 'Role 3 (Field Hospital)';
  location: string;
  coordinates: [number, number];
  contactAuthority: string;
  contactPhone: string;
  totalBeds: number;
  occupiedBeds: number;
  icuBeds: number;
  occupiedIcuBeds: number;
  surgicalTheaters: number;
  surgicalActive: number;
  bloodInventory: {
    bloodType: string;
    unitsAvailable: number;
    minThreshold: number;
    expiresSoonUnits: number;
  }[];
  emergencyResponseStatus: 'Normal' | 'Surge Alert' | 'Capacity Divert';
}

export type AssetServiceability = 'Serviceable' | 'Restricted' | 'Under Repair' | 'Awaiting Inspection' | 'Retired';

export interface MaintenanceFaultTicket {
  ticketId: string;
  reportedDate: string;
  reportedBy: string;
  faultDescription: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  stage: 'Reported' | 'Diagnosis' | 'In Repair' | 'Testing' | 'Awaiting Sign-off' | 'Closed';
  assignedTechnician: string;
  replacedParts: string[];
  inspectedAndVerifiedBy?: string;
  closedDate?: string;
}

export interface MaintenanceAsset {
  id: string;
  assetTag: string;
  name: string;
  category: 'Tactical Vehicle' | 'Power Generation' | 'Communications Array' | 'Heavy Transport' | 'Surveillance Radar';
  serviceability: AssetServiceability;
  custodian: string;
  location: string;
  meterHoursOrKm: string;
  lastPmcsDate: string;
  nextPmcsDue: string;
  overdue: boolean;
  faultTickets: MaintenanceFaultTicket[];
}

export interface TrainingCourse {
  id: string;
  code: string;
  title: string;
  validityMonths: number;
  requiredForRoles: string[];
  enrolledCount: number;
  certifiedCount: number;
  expiringIn30Days: number;
  upcomingSession: {
    date: string;
    location: string;
    instructor: string;
    seatsAvailable: number;
  };
}

export interface WeatherObservation {
  stationId: string;
  stationName: string;
  timestamp: string;
  tempCelsius: number;
  condition: string;
  windSpeedKmh: number;
  windDirection: string;
  precipitationMm: number;
  visibilityKm: number;
  barometricHpa: number;
  flightCondition: 'VFR (Good)' | 'MVFR (Marginal)' | 'IFR (Instrument)' | 'LIFR (Ground Stop)';
  groundMobility: 'GO (All-Terrain)' | 'SLOW (Caution / Chains)' | 'NO-GO (Impassable)';
  activeAlerts: {
    id: string;
    type: string;
    severity: 'Watch' | 'Warning' | 'Emergency';
    description: string;
    validUntil: string;
  }[];
  dataSource: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  module: string;
  targetRecord: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  module: string;
  severity: 'Critical' | 'Warning' | 'Info' | 'Success';
  read: boolean;
  linkModule?: string;
}
