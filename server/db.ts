import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  reservoirs, InsertReservoir, 
  reservoirWaterLevels, InsertReservoirWaterLevel,
  rainfallStations, InsertRainfallStation,
  rainfallRecords, InsertRainfallRecord,
  waterLevelStations, InsertWaterLevelStation,
  waterLevelRecords, InsertWaterLevelRecord,
  irrigationDistricts, InsertIrrigationDistrict,
  irrigationFacilities, InsertIrrigationFacility,
  riskAssessments, InsertRiskAssessment,
  waterAllocationSimulations, InsertWaterAllocationSimulation,
  dataSyncLogs, InsertDataSyncLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ User Helpers ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ Reservoir Helpers ============
export async function getAllReservoirs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reservoirs).orderBy(reservoirs.name);
}

export async function getReservoirById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(reservoirs).where(eq(reservoirs.id, id)).limit(1);
  return result[0];
}

export async function upsertReservoir(data: InsertReservoir) {
  const db = await getDb();
  if (!db) return;
  await db.insert(reservoirs).values(data).onDuplicateKeyUpdate({
    set: { ...data, updatedAt: new Date() }
  });
}

export async function getLatestReservoirWaterLevels() {
  const db = await getDb();
  if (!db) return [];
  
  const subquery = db
    .select({
      reservoirId: reservoirWaterLevels.reservoirId,
      maxTime: sql<Date>`MAX(${reservoirWaterLevels.recordTime})`.as('maxTime')
    })
    .from(reservoirWaterLevels)
    .groupBy(reservoirWaterLevels.reservoirId)
    .as('latest');

  return db
    .select({
      reservoir: reservoirs,
      waterLevel: reservoirWaterLevels
    })
    .from(reservoirWaterLevels)
    .innerJoin(reservoirs, eq(reservoirWaterLevels.reservoirId, reservoirs.id))
    .innerJoin(subquery, and(
      eq(reservoirWaterLevels.reservoirId, subquery.reservoirId),
      eq(reservoirWaterLevels.recordTime, subquery.maxTime)
    ));
}

export async function insertReservoirWaterLevel(data: InsertReservoirWaterLevel) {
  const db = await getDb();
  if (!db) return;
  await db.insert(reservoirWaterLevels).values(data);
}

// ============ Rainfall Station Helpers ============
export async function getAllRainfallStations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rainfallStations).orderBy(rainfallStations.name);
}

export async function upsertRainfallStation(data: InsertRainfallStation) {
  const db = await getDb();
  if (!db) return;
  await db.insert(rainfallStations).values(data).onDuplicateKeyUpdate({
    set: { ...data, updatedAt: new Date() }
  });
}

export async function getLatestRainfallRecords() {
  const db = await getDb();
  if (!db) return [];
  
  const subquery = db
    .select({
      stationId: rainfallRecords.stationId,
      maxTime: sql<Date>`MAX(${rainfallRecords.recordTime})`.as('maxTime')
    })
    .from(rainfallRecords)
    .groupBy(rainfallRecords.stationId)
    .as('latest');

  return db
    .select({
      station: rainfallStations,
      record: rainfallRecords
    })
    .from(rainfallRecords)
    .innerJoin(rainfallStations, eq(rainfallRecords.stationId, rainfallStations.id))
    .innerJoin(subquery, and(
      eq(rainfallRecords.stationId, subquery.stationId),
      eq(rainfallRecords.recordTime, subquery.maxTime)
    ));
}

export async function insertRainfallRecord(data: InsertRainfallRecord) {
  const db = await getDb();
  if (!db) return;
  await db.insert(rainfallRecords).values(data);
}

// ============ Water Level Station Helpers ============
export async function getAllWaterLevelStations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(waterLevelStations).orderBy(waterLevelStations.name);
}

export async function upsertWaterLevelStation(data: InsertWaterLevelStation) {
  const db = await getDb();
  if (!db) return;
  await db.insert(waterLevelStations).values(data).onDuplicateKeyUpdate({
    set: { ...data, updatedAt: new Date() }
  });
}

export async function getLatestWaterLevelRecords() {
  const db = await getDb();
  if (!db) return [];
  
  const subquery = db
    .select({
      stationId: waterLevelRecords.stationId,
      maxTime: sql<Date>`MAX(${waterLevelRecords.recordTime})`.as('maxTime')
    })
    .from(waterLevelRecords)
    .groupBy(waterLevelRecords.stationId)
    .as('latest');

  return db
    .select({
      station: waterLevelStations,
      record: waterLevelRecords
    })
    .from(waterLevelRecords)
    .innerJoin(waterLevelStations, eq(waterLevelRecords.stationId, waterLevelStations.id))
    .innerJoin(subquery, and(
      eq(waterLevelRecords.stationId, subquery.stationId),
      eq(waterLevelRecords.recordTime, subquery.maxTime)
    ));
}

export async function insertWaterLevelRecord(data: InsertWaterLevelRecord) {
  const db = await getDb();
  if (!db) return;
  await db.insert(waterLevelRecords).values(data);
}

// ============ Irrigation District Helpers ============
export async function getAllIrrigationDistricts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(irrigationDistricts).orderBy(irrigationDistricts.name);
}

export async function getIrrigationDistrictById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(irrigationDistricts).where(eq(irrigationDistricts.id, id)).limit(1);
  return result[0];
}

export async function upsertIrrigationDistrict(data: InsertIrrigationDistrict) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(irrigationDistricts).values(data).onDuplicateKeyUpdate({
    set: { ...data, updatedAt: new Date() }
  });
  // Return the district by code
  const result = await db.select().from(irrigationDistricts).where(eq(irrigationDistricts.code, data.code)).limit(1);
  return result[0] || null;
}

// ============ Irrigation Facility Helpers ============
export async function getFacilitiesByDistrict(districtId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(irrigationFacilities).where(eq(irrigationFacilities.districtId, districtId));
}

export async function getAllFacilities() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(irrigationFacilities);
}

export async function insertIrrigationFacility(data: InsertIrrigationFacility) {
  const db = await getDb();
  if (!db) return;
  await db.insert(irrigationFacilities).values(data);
}

// ============ Risk Assessment Helpers ============
export async function getLatestRiskAssessments() {
  const db = await getDb();
  if (!db) return [];
  
  const subquery = db
    .select({
      districtId: riskAssessments.districtId,
      maxDate: sql<Date>`MAX(${riskAssessments.assessmentDate})`.as('maxDate')
    })
    .from(riskAssessments)
    .groupBy(riskAssessments.districtId)
    .as('latest');

  return db
    .select({
      district: irrigationDistricts,
      assessment: riskAssessments
    })
    .from(riskAssessments)
    .innerJoin(irrigationDistricts, eq(riskAssessments.districtId, irrigationDistricts.id))
    .innerJoin(subquery, and(
      eq(riskAssessments.districtId, subquery.districtId),
      eq(riskAssessments.assessmentDate, subquery.maxDate)
    ));
}

export async function getRiskAssessmentHistory(districtId: number, limit: number = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(riskAssessments)
    .where(eq(riskAssessments.districtId, districtId))
    .orderBy(desc(riskAssessments.assessmentDate))
    .limit(limit);
}

export async function insertRiskAssessment(data: InsertRiskAssessment) {
  const db = await getDb();
  if (!db) return;
  await db.insert(riskAssessments).values(data);
}

// ============ Water Allocation Simulation Helpers ============
export async function getSimulationsByDistrict(districtId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(waterAllocationSimulations)
    .where(eq(waterAllocationSimulations.districtId, districtId))
    .orderBy(desc(waterAllocationSimulations.simulationDate))
    .limit(limit);
}

export async function insertWaterAllocationSimulation(data: InsertWaterAllocationSimulation) {
  const db = await getDb();
  if (!db) return;
  await db.insert(waterAllocationSimulations).values(data);
}

// ============ Data Sync Log Helpers ============
export async function getRecentSyncLogs(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(dataSyncLogs)
    .orderBy(desc(dataSyncLogs.createdAt))
    .limit(limit);
}

export async function createSyncLog(data: InsertDataSyncLog) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(dataSyncLogs).values(data);
  return result[0]?.insertId;
}

export async function updateSyncLog(id: number, data: Partial<InsertDataSyncLog>) {
  const db = await getDb();
  if (!db) return;
  await db.update(dataSyncLogs).set(data).where(eq(dataSyncLogs.id, id));
}

// ============ Dashboard Statistics ============
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const [reservoirCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(reservoirs);
  const [rainfallStationCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(rainfallStations);
  const [waterLevelStationCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(waterLevelStations);
  const [districtCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(irrigationDistricts);
  const [facilityCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(irrigationFacilities);

  return {
    reservoirs: reservoirCount?.count || 0,
    rainfallStations: rainfallStationCount?.count || 0,
    waterLevelStations: waterLevelStationCount?.count || 0,
    irrigationDistricts: districtCount?.count || 0,
    irrigationFacilities: facilityCount?.count || 0
  };
}


// ============ Additional Helpers ============
export async function getReservoirByStationId(stationId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(reservoirs).where(eq(reservoirs.stationId, stationId)).limit(1);
  return result[0];
}

export async function upsertFacility(data: InsertIrrigationFacility) {
  const db = await getDb();
  if (!db) return;
  await db.insert(irrigationFacilities).values(data).onDuplicateKeyUpdate({
    set: { ...data, updatedAt: new Date() }
  });
}

// Alias for insertWaterAllocationSimulation
export async function insertSimulation(data: InsertWaterAllocationSimulation) {
  return insertWaterAllocationSimulation(data);
}

// Delete simulation by ID
export async function deleteSimulation(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(waterAllocationSimulations).where(eq(waterAllocationSimulations.id, id));
}
