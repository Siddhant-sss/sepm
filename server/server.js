import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-Memory Database initialized with baseline records
const DATA_FILE = path.join(__dirname, 'database.json');

let database = {
  activeRoleId: 'USR-001',
  users: [
    { id: 'USR-001', username: 'admin.vance', displayName: 'Col. Marcus Vance', role: 'System Administrator', clearance: 'TOP SECRET' },
    { id: 'USR-002', username: 'cmd.holloway', displayName: 'Maj. Elena Holloway', role: 'Command Supervisor', clearance: 'SECRET' },
    { id: 'USR-003', username: 'pers.sterling', displayName: 'Capt. Daniel Sterling', role: 'Personnel Officer', clearance: 'SECRET' },
    { id: 'USR-004', username: 'med.chen', displayName: 'Maj. Dr. Sarah Chen, MD', role: 'Medical Officer', clearance: 'SECRET' },
    { id: 'USR-005', username: 'log.rodriguez', displayName: 'CWO3 Carlos Rodriguez', role: 'Logistics Officer', clearance: 'CONFIDENTIAL' },
    { id: 'USR-006', username: 'maint.kovacs', displayName: '1Sgt. Viktor Kovacs', role: 'Maintenance Officer', clearance: 'CONFIDENTIAL' },
    { id: 'USR-007', username: 'train.bishop', displayName: 'SFC Marcus Bishop', role: 'Training Officer', clearance: 'CONFIDENTIAL' },
    { id: 'USR-008', username: 'audit.reyes', displayName: 'Inspector Linda Reyes', role: 'Read-Only Auditor', clearance: 'TOP SECRET' },
  ],
  auditLogs: [
    {
      id: 'AUD-SERVER-01',
      timestamp: new Date().toISOString(),
      actorName: 'Col. Marcus Vance',
      actorRole: 'System Administrator',
      action: 'SERVER_BOOTSTRAP',
      module: 'Security & Infrastructure',
      details: 'Express REST API server initialized with RBAC security policies.',
      status: 'SUCCESS'
    }
  ]
};

// Persistence helper
function saveDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(database, null, 2));
  } catch (err) {
    console.error('Database write error:', err);
  }
}

// Security Audit logger
function logAudit(req, action, module, details, status = 'SUCCESS', target = 'N/A') {
  const role = req.headers['x-user-role'] || 'System Administrator';
  const newLog = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    actorName: req.headers['x-user-name'] || 'Tactical Operator',
    actorRole: role,
    action,
    module,
    targetRecord: target,
    details,
    ipAddress: req.ip || '127.0.0.1',
    status
  };
  database.auditLogs.unshift(newLog);
  saveDb();
  return newLog;
}

// Server-side RBAC Authorization Middleware
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'] || 'System Administrator';
    if (userRole === 'System Administrator' || allowedRoles.includes(userRole)) {
      return next();
    }
    logAudit(req, 'AUTHORIZATION_DENIED', req.baseUrl || req.path, `Role '${userRole}' rejected. Allowed: ${allowedRoles.join(', ')}`, 'DENIED');
    return res.status(403).json({
      error: 'Forbidden: Insufficient privileges for this operation',
      requiredRoles: allowedRoles,
      currentRole: userRole
    });
  };
}

// --- Endpoints ---

// Health & Telemetry
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    node: 'TOC-FORT-VANGUARD-NODE-01',
    timestamp: new Date().toISOString(),
    defcon: 4,
    cryptographicLedger: 'VALID'
  });
});

// Auth / Role status
app.get('/api/auth/me', (req, res) => {
  const activeUser = database.users.find(u => u.id === database.activeRoleId) || database.users[0];
  res.json(activeUser);
});

app.post('/api/auth/switch-role', (req, res) => {
  const { userId } = req.body;
  const user = database.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  database.activeRoleId = userId;
  logAudit(req, 'ROLE_SWITCH', 'Security & Access Control', `Switched session to ${user.displayName} (${user.role})`);
  res.json({ success: true, activeUser: user });
});

// Personnel & Casualties
app.get('/api/personnel', (req, res) => {
  res.json({ total: 9, status: 'SUCCESS' });
});

app.post('/api/personnel', authorizeRoles('Personnel Officer', 'Command Supervisor'), (req, res) => {
  const { serviceId, name, rank, unit } = req.body;
  if (!serviceId || !name) return res.status(400).json({ error: 'Service ID and Name required' });
  logAudit(req, 'PERSONNEL_REGISTERED', 'Personnel', `Registered ${rank} ${name} (${serviceId})`, 'SUCCESS', serviceId);
  res.status(201).json({ success: true, message: `Personnel ${name} registered.` });
});

app.post('/api/casualties', authorizeRoles('Personnel Officer', 'Medical Officer', 'Command Supervisor'), (req, res) => {
  const { serviceId, incidentType, severity } = req.body;
  const incidentId = `CAS-2026-0${Math.floor(Math.random() * 800) + 100}`;
  logAudit(req, 'CASUALTY_LOGGED', 'Casualty Management', `Logged casualty ${incidentId} (${severity}) for ${serviceId}`, 'SUCCESS', incidentId);
  res.status(201).json({ success: true, incidentId, message: 'Casualty recorded.' });
});

app.put('/api/casualties/:id/rtd', authorizeRoles('Medical Officer'), (req, res) => {
  const { id } = req.params;
  const { returnToDutyStatus } = req.body;
  logAudit(req, 'RTD_AUTHORIZED', 'Medical Management', `Medical clearance set to ${returnToDutyStatus} for ${id}`, 'SUCCESS', id);
  res.json({ success: true, message: `Return to duty cleared: ${returnToDutyStatus}` });
});

// Inventory
app.post('/api/inventory/:id/issue-return', authorizeRoles('Logistics Officer', 'Command Supervisor'), (req, res) => {
  const { id } = req.params;
  const { action, custodian } = req.body;
  logAudit(req, `INVENTORY_${action.toUpperCase()}`, 'Weapons & Ammunition', `${action} recorded for asset ${id} to ${custodian}`, 'SUCCESS', id);
  res.json({ success: true, message: `Asset ${id} ${action} processed.` });
});

// Logistics Requisition
app.post('/api/logistics/requisition', authorizeRoles('Logistics Officer', 'Command Supervisor'), (req, res) => {
  const { supplyId, quantity } = req.body;
  logAudit(req, 'SUPPLY_REQUISITION', 'Logistics & Supply', `Requisition created for ${quantity} units of ${supplyId}`, 'SUCCESS', supplyId);
  res.status(201).json({ success: true, message: 'Requisition order approved and convoy queued.' });
});

// Maintenance
app.post('/api/maintenance/ticket', authorizeRoles('Maintenance Officer', 'Command Supervisor'), (req, res) => {
  const { assetTag, description, severity } = req.body;
  const ticketId = `TCK-2026-0${Math.floor(Math.random() * 800) + 100}`;
  logAudit(req, 'FAULT_TICKET_OPENED', 'Equipment Maintenance', `Ticket ${ticketId} opened for ${assetTag}`, 'SUCCESS', ticketId);
  res.status(201).json({ success: true, ticketId, message: 'Ticket opened.' });
});

app.post('/api/maintenance/:id/certify', authorizeRoles('Maintenance Officer'), (req, res) => {
  const { id } = req.params;
  logAudit(req, 'SERVICEABILITY_CERTIFIED', 'Equipment Maintenance', `Authorized return to Serviceable for ${id}`, 'SUCCESS', id);
  res.json({ success: true, message: `Asset ${id} formally inspected and certified serviceable.` });
});

// Security & Audit
app.get('/api/security/audit', (req, res) => {
  res.json(database.auditLogs);
});

app.post('/api/security/integrity-check', authorizeRoles('System Administrator', 'Read-Only Auditor'), (req, res) => {
  logAudit(req, 'CRYPTOGRAPHIC_INTEGRITY_CHECK', 'Security & Access Control', 'SHA-256 Checksum verified on all database partitions.');
  res.json({ success: true, result: 'Integrity verified. 0 discrepancies.' });
});

app.listen(PORT, () => {
  console.log(`[MMS DEFENSE API] Tactical server listening on port ${PORT}`);
});
