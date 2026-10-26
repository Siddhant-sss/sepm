import { useState, useEffect } from 'react';
import { tacticalStore } from '../services/tacticalStore';

export function useTacticalStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = tacticalStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  return {
    store: tacticalStore,
    activeUser: tacticalStore.getActiveUser(),
    users: tacticalStore.users,
    personnel: tacticalStore.personnel,
    casualties: tacticalStore.casualties,
    inventory: tacticalStore.inventory,
    geoFeatures: tacticalStore.geoFeatures,
    supplies: tacticalStore.supplies,
    medicalFacilities: tacticalStore.medicalFacilities,
    maintenanceAssets: tacticalStore.maintenanceAssets,
    trainingCourses: tacticalStore.trainingCourses,
    weather: tacticalStore.weather,
    notifications: tacticalStore.notifications,
    auditLogs: tacticalStore.auditLogs,
  };
}
