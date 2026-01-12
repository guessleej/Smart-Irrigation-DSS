import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 水庫基本資料表
 */
export const reservoirs = mysqlTable("reservoirs", {
  id: int("id").autoincrement().primaryKey(),
  stationId: varchar("stationId", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  basin: varchar("basin", { length: 100 }),
  county: varchar("county", { length: 50 }),
  township: varchar("township", { length: 50 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  effectiveCapacity: decimal("effectiveCapacity", { precision: 12, scale: 2 }),
  deadStorageCapacity: decimal("deadStorageCapacity", { precision: 12, scale: 2 }),
  fullWaterLevel: decimal("fullWaterLevel", { precision: 8, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reservoir = typeof reservoirs.$inferSelect;
export type InsertReservoir = typeof reservoirs.$inferInsert;

/**
 * 水庫即時水情資料表
 */
export const reservoirWaterLevels = mysqlTable("reservoir_water_levels", {
  id: int("id").autoincrement().primaryKey(),
  reservoirId: int("reservoirId").notNull(),
  recordTime: timestamp("recordTime").notNull(),
  waterLevel: decimal("waterLevel", { precision: 8, scale: 2 }),
  effectiveStorage: decimal("effectiveStorage", { precision: 12, scale: 2 }),
  storagePercentage: decimal("storagePercentage", { precision: 5, scale: 2 }),
  inflow: decimal("inflow", { precision: 10, scale: 2 }),
  outflow: decimal("outflow", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReservoirWaterLevel = typeof reservoirWaterLevels.$inferSelect;
export type InsertReservoirWaterLevel = typeof reservoirWaterLevels.$inferInsert;

/**
 * 雨量站基本資料表
 */
export const rainfallStations = mysqlTable("rainfall_stations", {
  id: int("id").autoincrement().primaryKey(),
  stationId: varchar("stationId", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  county: varchar("county", { length: 50 }),
  township: varchar("township", { length: 50 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  altitude: decimal("altitude", { precision: 8, scale: 2 }),
  basin: varchar("basin", { length: 100 }),
  source: varchar("source", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RainfallStation = typeof rainfallStations.$inferSelect;
export type InsertRainfallStation = typeof rainfallStations.$inferInsert;

/**
 * 雨量即時資料表
 */
export const rainfallRecords = mysqlTable("rainfall_records", {
  id: int("id").autoincrement().primaryKey(),
  stationId: int("stationId").notNull(),
  recordTime: timestamp("recordTime").notNull(),
  hourlyRainfall: decimal("hourlyRainfall", { precision: 8, scale: 2 }),
  dailyRainfall: decimal("dailyRainfall", { precision: 8, scale: 2 }),
  accumulatedRainfall: decimal("accumulatedRainfall", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RainfallRecord = typeof rainfallRecords.$inferSelect;
export type InsertRainfallRecord = typeof rainfallRecords.$inferInsert;

/**
 * 水位站基本資料表
 */
export const waterLevelStations = mysqlTable("water_level_stations", {
  id: int("id").autoincrement().primaryKey(),
  stationId: varchar("stationId", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  river: varchar("river", { length: 100 }),
  basin: varchar("basin", { length: 100 }),
  county: varchar("county", { length: 50 }),
  township: varchar("township", { length: 50 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  warningLevel1: decimal("warningLevel1", { precision: 8, scale: 2 }),
  warningLevel2: decimal("warningLevel2", { precision: 8, scale: 2 }),
  warningLevel3: decimal("warningLevel3", { precision: 8, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WaterLevelStation = typeof waterLevelStations.$inferSelect;
export type InsertWaterLevelStation = typeof waterLevelStations.$inferInsert;

/**
 * 水位即時資料表
 */
export const waterLevelRecords = mysqlTable("water_level_records", {
  id: int("id").autoincrement().primaryKey(),
  stationId: int("stationId").notNull(),
  recordTime: timestamp("recordTime").notNull(),
  waterLevel: decimal("waterLevel", { precision: 8, scale: 2 }),
  flowRate: decimal("flowRate", { precision: 10, scale: 2 }),
  warningStatus: mysqlEnum("warningStatus", ["normal", "alert", "warning", "danger"]).default("normal"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WaterLevelRecord = typeof waterLevelRecords.$inferSelect;
export type InsertWaterLevelRecord = typeof waterLevelRecords.$inferInsert;

/**
 * 灌區基本資料表
 */
export const irrigationDistricts = mysqlTable("irrigation_districts", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  managementOffice: varchar("managementOffice", { length: 100 }),
  county: varchar("county", { length: 50 }),
  area: decimal("area", { precision: 12, scale: 2 }),
  irrigatedArea: decimal("irrigatedArea", { precision: 12, scale: 2 }),
  mainCrops: text("mainCrops"),
  waterSources: text("waterSources"),
  geoJson: json("geoJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IrrigationDistrict = typeof irrigationDistricts.$inferSelect;
export type InsertIrrigationDistrict = typeof irrigationDistricts.$inferInsert;

/**
 * 灌溉設施資料表（渠道、埤塘、水井等）
 */
export const irrigationFacilities = mysqlTable("irrigation_facilities", {
  id: int("id").autoincrement().primaryKey(),
  districtId: int("districtId").notNull(),
  facilityType: mysqlEnum("facilityType", ["canal", "pond", "well", "weir", "pump_station", "other"]).notNull(),
  code: varchar("code", { length: 64 }),
  name: varchar("name", { length: 100 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  capacity: decimal("capacity", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("active"),
  properties: json("properties"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IrrigationFacility = typeof irrigationFacilities.$inferSelect;
export type InsertIrrigationFacility = typeof irrigationFacilities.$inferInsert;

/**
 * 缺水風險評估記錄表
 */
export const riskAssessments = mysqlTable("risk_assessments", {
  id: int("id").autoincrement().primaryKey(),
  districtId: int("districtId").notNull(),
  assessmentDate: timestamp("assessmentDate").notNull(),
  riskLevel: mysqlEnum("riskLevel", ["low", "moderate", "high", "critical"]).notNull(),
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }),
  waterSupply: decimal("waterSupply", { precision: 12, scale: 2 }),
  waterDemand: decimal("waterDemand", { precision: 12, scale: 2 }),
  supplyDemandRatio: decimal("supplyDemandRatio", { precision: 5, scale: 2 }),
  rainfallForecast: decimal("rainfallForecast", { precision: 8, scale: 2 }),
  reservoirStorage: decimal("reservoirStorage", { precision: 5, scale: 2 }),
  factors: json("factors"),
  recommendations: text("recommendations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertRiskAssessment = typeof riskAssessments.$inferInsert;

/**
 * 配水模擬記錄表
 */
export const waterAllocationSimulations = mysqlTable("water_allocation_simulations", {
  id: int("id").autoincrement().primaryKey(),
  districtId: int("districtId").notNull(),
  simulationDate: timestamp("simulationDate").notNull(),
  scenarioName: varchar("scenarioName", { length: 100 }),
  totalWaterAvailable: decimal("totalWaterAvailable", { precision: 12, scale: 2 }),
  totalWaterDemand: decimal("totalWaterDemand", { precision: 12, scale: 2 }),
  allocationPlan: json("allocationPlan"),
  simulationParams: json("simulationParams"),
  results: json("results"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WaterAllocationSimulation = typeof waterAllocationSimulations.$inferSelect;
export type InsertWaterAllocationSimulation = typeof waterAllocationSimulations.$inferInsert;

/**
 * 資料同步記錄表
 */
export const dataSyncLogs = mysqlTable("data_sync_logs", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 100 }).notNull(),
  syncType: varchar("syncType", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["pending", "running", "success", "failed"]).default("pending"),
  recordsProcessed: int("recordsProcessed").default(0),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DataSyncLog = typeof dataSyncLogs.$inferSelect;
export type InsertDataSyncLog = typeof dataSyncLogs.$inferInsert;
