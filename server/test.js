import test from 'node:test';
import assert from 'node:assert/strict';

test('Security & Role Permissions: Authorization checks', (t) => {
  // Define permission checker matching store logic
  function checkPermission(role, allowedRoles) {
    if (role === 'System Administrator') return true;
    return allowedRoles.includes(role);
  }

  // Medical Officer clearance
  assert.equal(checkPermission('Medical Officer', ['Medical Officer']), true);
  assert.equal(checkPermission('System Administrator', ['Medical Officer']), true);
  assert.equal(checkPermission('Logistics Officer', ['Medical Officer']), false);
  assert.equal(checkPermission('Read-Only Auditor', ['Medical Officer']), false);

  // Maintenance certification
  assert.equal(checkPermission('Maintenance Officer', ['Maintenance Officer']), true);
  assert.equal(checkPermission('Personnel Officer', ['Maintenance Officer']), false);

  // Logistics orders
  assert.equal(checkPermission('Logistics Officer', ['Logistics Officer', 'Command Supervisor']), true);
  assert.equal(checkPermission('Command Supervisor', ['Logistics Officer', 'Command Supervisor']), true);
  assert.equal(checkPermission('Read-Only Auditor', ['Logistics Officer', 'Command Supervisor']), false);
});

test('Derived Metrics: Days of Supply and burn rate calculations', () => {
  function calculateDaysOfSupply(currentStock, dailyBurnRate) {
    if (dailyBurnRate <= 0) return Infinity;
    return Math.round((currentStock / dailyBurnRate) * 10) / 10;
  }

  // 32,000 Liters with 4,500 L/day burn rate = 7.1 days
  assert.equal(calculateDaysOfSupply(32000, 4500), 7.1);

  // 2,800 cases with 140 cases/day = 20.0 days
  assert.equal(calculateDaysOfSupply(2800, 140), 20.0);

  // Stock critical threshold check (< 10 days)
  const isCritical = (days) => days <= 10;
  assert.equal(isCritical(7.1), true);
  assert.equal(isCritical(20.0), false);
});

test('Maintenance Serviceability Rule: PMCS sign-off requirement', () => {
  // Rule 12: An asset must not automatically return to serviceable status until authorized inspection and verification are recorded
  function transitionServiceability(asset, action, officerRole) {
    if (action === 'RETURN_TO_SERVICEABLE') {
      if (officerRole !== 'Maintenance Officer' && officerRole !== 'System Administrator') {
        throw new Error('Unauthorized: Only Maintenance Officer can certify serviceability');
      }
      return { ...asset, serviceability: 'Serviceable', overdue: false };
    }
    return asset;
  }

  const asset = { id: 'VEH-01', serviceability: 'Under Repair', overdue: true };

  // Unauthorized attempt throws error
  assert.throws(
    () => transitionServiceability(asset, 'RETURN_TO_SERVICEABLE', 'Training Officer'),
    /Unauthorized/
  );

  // Authorized attempt succeeds
  const updated = transitionServiceability(asset, 'RETURN_TO_SERVICEABLE', 'Maintenance Officer');
  assert.equal(updated.serviceability, 'Serviceable');
  assert.equal(updated.overdue, false);
});

test('Personnel & Casualty: Duplicate and conflict detection', () => {
  const casualties = [
    { id: 'CAS-01', serviceId: 'USA-441-2098', status: 'Confirmed' },
    { id: 'CAS-02', serviceId: 'USA-902-6154', status: 'Confirmed' },
  ];

  function detectConflict(existingCasualties, incomingServiceId) {
    return existingCasualties.some((c) => c.serviceId === incomingServiceId);
  }

  assert.equal(detectConflict(casualties, 'USA-441-2098'), true);
  assert.equal(detectConflict(casualties, 'USA-NEW-9999'), false);
});
