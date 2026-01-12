import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { moaApi, wraApi, wraOpenDataApi, feitsuiApi, weatherMoaApi, mockDataGenerator } from "./services/apiService";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: '需要管理員權限' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Dashboard 統計資料
  dashboard: router({
    getStats: publicProcedure.query(async () => {
      const stats = await db.getDashboardStats();
      return stats || {
        reservoirs: 0,
        rainfallStations: 0,
        waterLevelStations: 0,
        irrigationDistricts: 0,
        irrigationFacilities: 0
      };
    }),

    getOverview: publicProcedure.query(async () => {
      const [reservoirs, rainfallData, riskAssessments] = await Promise.all([
        db.getLatestReservoirWaterLevels(),
        db.getLatestRainfallRecords(),
        db.getLatestRiskAssessments()
      ]);

      const avgStoragePercentage = reservoirs.length > 0
        ? reservoirs.reduce((sum, r) => sum + Number(r.waterLevel?.storagePercentage || 0), 0) / reservoirs.length
        : 0;

      const totalDailyRainfall = rainfallData.reduce((sum, r) => sum + Number(r.record?.dailyRainfall || 0), 0);

      const riskDistribution = {
        low: riskAssessments.filter(r => r.assessment?.riskLevel === 'low').length,
        moderate: riskAssessments.filter(r => r.assessment?.riskLevel === 'moderate').length,
        high: riskAssessments.filter(r => r.assessment?.riskLevel === 'high').length,
        critical: riskAssessments.filter(r => r.assessment?.riskLevel === 'critical').length
      };

      return {
        avgStoragePercentage: avgStoragePercentage.toFixed(1),
        totalDailyRainfall: totalDailyRainfall.toFixed(1),
        riskDistribution,
        lastUpdated: new Date().toISOString()
      };
    }),

    // 取得即時水庫概覽（從 API）
    getRealtimeOverview: publicProcedure.query(async () => {
      try {
        // 從水利署開放資料平台取得即時水庫資料
        const reservoirData = await wraOpenDataApi.getAllReservoirsRealtime();
        
        if (!reservoirData || reservoirData.length === 0) {
          return {
            reservoirs: [],
            avgStoragePercentage: '0',
            totalInflow: '0',
            totalOutflow: '0',
            lastUpdated: new Date().toISOString(),
            source: 'no_data'
          };
        }

        // 計算統計數據
        const avgStoragePercentage = reservoirData.reduce((sum: number, r: any) => 
          sum + parseFloat(r.storagePercentage || '0'), 0) / reservoirData.length;
        
        const totalInflow = reservoirData.reduce((sum: number, r: any) => 
          sum + parseFloat(r.inflow || '0'), 0);
        
        const totalOutflow = reservoirData.reduce((sum: number, r: any) => 
          sum + parseFloat(r.outflow || '0'), 0);

        // 按蓄水率排序
        const sortedReservoirs = reservoirData.sort((a: any, b: any) => 
          parseFloat(b.storagePercentage || '0') - parseFloat(a.storagePercentage || '0')
        );

        return {
          reservoirs: sortedReservoirs,
          avgStoragePercentage: avgStoragePercentage.toFixed(1),
          totalInflow: totalInflow.toFixed(2),
          totalOutflow: totalOutflow.toFixed(2),
          lastUpdated: new Date().toISOString(),
          source: 'wra_opendata'
        };
      } catch (error) {
        console.error('[Dashboard] Failed to get realtime overview:', error);
        return {
          reservoirs: [],
          avgStoragePercentage: '0',
          totalInflow: '0',
          totalOutflow: '0',
          lastUpdated: new Date().toISOString(),
          source: 'error'
        };
      }
    }),

    getSyncLogs: protectedProcedure.query(async () => {
      return db.getRecentSyncLogs(20);
    })
  }),

  // 水庫資料
  reservoir: router({
    list: publicProcedure.query(async () => {
      return db.getAllReservoirs();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getReservoirById(input.id);
      }),

    getLatestLevels: publicProcedure.query(async () => {
      return db.getLatestReservoirWaterLevels();
    }),

    // 取得即時水庫資料（從 API）
    getRealtimeData: publicProcedure.query(async () => {
      try {
        const data = await wraOpenDataApi.getAllReservoirsRealtime();
        return {
          success: true,
          data: data || [],
          source: 'wra_opendata',
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        console.error('[Reservoir] Failed to get realtime data:', error);
        return {
          success: false,
          data: [],
          source: 'error',
          lastUpdated: new Date().toISOString()
        };
      }
    }),

    // 取得主要水庫即時資料
    getMajorReservoirs: publicProcedure.query(async () => {
      try {
        const data = await wraOpenDataApi.getMajorReservoirsRealtime();
        return {
          success: true,
          data: data || [],
          source: 'wra_opendata',
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        console.error('[Reservoir] Failed to get major reservoirs:', error);
        return {
          success: false,
          data: [],
          source: 'error',
          lastUpdated: new Date().toISOString()
        };
      }
    }),

    // 取得翡翠水庫即時資料
    getFeitsuiRealtime: publicProcedure.query(async () => {
      try {
        const data = await feitsuiApi.getReservoirRainHour();
        return {
          success: true,
          data,
          source: 'feitsui_api',
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        console.error('[Reservoir] Failed to get Feitsui data:', error);
        return {
          success: false,
          data: null,
          source: 'error',
          lastUpdated: new Date().toISOString()
        };
      }
    }),

    // 從外部 API 同步資料到資料庫
    syncFromApi: adminProcedure.mutation(async () => {
      const logId = await db.createSyncLog({
        source: 'WRA_OPENDATA',
        syncType: 'reservoir',
        status: 'running',
        startedAt: new Date()
      });

      try {
        const reservoirData = await wraOpenDataApi.getAllReservoirsRealtime();
        
        if (!reservoirData || reservoirData.length === 0) {
          console.log('[Sync] No data from API, using mock data');
          const mockData = mockDataGenerator.generateReservoirs();
          let processedCount = 0;
          
          for (const item of mockData) {
            await db.upsertReservoir({
              stationId: item.stationId,
              name: item.name,
              basin: item.basin,
              county: item.county,
              latitude: item.latitude,
              longitude: item.longitude,
              effectiveCapacity: item.effectiveCapacity,
              fullWaterLevel: item.fullWaterLevel
            });
            processedCount++;
          }

          if (logId) {
            await db.updateSyncLog(logId, {
              status: 'success',
              recordsProcessed: processedCount,
              completedAt: new Date()
            });
          }

          return { success: true, processedCount, source: 'mock' };
        }

        let processedCount = 0;
        for (const item of reservoirData) {
          await db.upsertReservoir({
            stationId: item.stationId,
            name: item.name,
            basin: item.basin,
            county: item.county,
            latitude: String(item.latitude || ''),
            longitude: String(item.longitude || ''),
            effectiveCapacity: item.effectiveCapacity,
            fullWaterLevel: item.fullWaterLevel
          });

          // 同時更新水位資料
          const reservoir = await db.getReservoirByStationId(item.stationId);
          if (reservoir) {
            await db.insertReservoirWaterLevel({
              reservoirId: reservoir.id,
              recordTime: new Date(item.recordTime),
              waterLevel: item.waterLevel,
              effectiveStorage: item.effectiveStorage,
              storagePercentage: item.storagePercentage,
              inflow: item.inflow,
              outflow: item.outflow
            });
          }
          processedCount++;
        }

        if (logId) {
          await db.updateSyncLog(logId, {
            status: 'success',
            recordsProcessed: processedCount,
            completedAt: new Date()
          });
        }

        return { success: true, processedCount, source: 'wra_opendata' };
      } catch (error) {
        if (logId) {
          await db.updateSyncLog(logId, {
            status: 'failed',
            errorMessage: String(error),
            completedAt: new Date()
          });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '同步失敗' });
      }
    })
  }),

  // 雨量資料
  rainfall: router({
    listStations: publicProcedure.query(async () => {
      return db.getAllRainfallStations();
    }),

    getLatestRecords: publicProcedure.query(async () => {
      return db.getLatestRainfallRecords();
    }),

    // 取得即時雨量資料（從 API）
    getRealtimeData: publicProcedure.query(async () => {
      try {
        const data = await wraOpenDataApi.getRainfallStations();
        return {
          success: true,
          data: data || [],
          source: 'wra_opendata',
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        console.error('[Rainfall] Failed to get realtime data:', error);
        return {
          success: false,
          data: [],
          source: 'error',
          lastUpdated: new Date().toISOString()
        };
      }
    }),

    syncFromApi: adminProcedure.mutation(async () => {
      const logId = await db.createSyncLog({
        source: 'MOA_API',
        syncType: 'rainfall',
        status: 'running',
        startedAt: new Date()
      });

      try {
        let stationData = await moaApi.getRainfallStations();
        
        if (!stationData) {
          console.log('[Sync] Using mock data for rainfall stations');
          stationData = mockDataGenerator.generateRainfallStations();
        }

        let processedCount = 0;
        for (const item of stationData) {
          await db.upsertRainfallStation({
            stationId: item.stationId || item.StationNo,
            name: item.name || item.StationName,
            county: item.county || item.County,
            township: item.township || item.Township,
            latitude: item.latitude || item.Latitude,
            longitude: item.longitude || item.Longitude,
            altitude: item.altitude || item.Altitude
          });
          processedCount++;
        }

        if (logId) {
          await db.updateSyncLog(logId, {
            status: 'success',
            recordsProcessed: processedCount,
            completedAt: new Date()
          });
        }

        return { success: true, processedCount };
      } catch (error) {
        if (logId) {
          await db.updateSyncLog(logId, {
            status: 'failed',
            errorMessage: String(error),
            completedAt: new Date()
          });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '同步失敗' });
      }
    })
  }),

  // 水位資料
  waterLevel: router({
    listStations: publicProcedure.query(async () => {
      return db.getAllWaterLevelStations();
    }),

    getLatestRecords: publicProcedure.query(async () => {
      return db.getLatestWaterLevelRecords();
    }),

    // 取得即時水位資料（從 API）
    getRealtimeData: publicProcedure.query(async () => {
      try {
        const data = await wraOpenDataApi.getRealtimeWaterLevel();
        return {
          success: true,
          data: data || [],
          source: 'wra_opendata',
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        console.error('[WaterLevel] Failed to get realtime data:', error);
        return {
          success: false,
          data: [],
          source: 'error',
          lastUpdated: new Date().toISOString()
        };
      }
    })
  }),

  // 灌區資料
  irrigationDistrict: router({
    list: publicProcedure.query(async () => {
      return db.getAllIrrigationDistricts();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getIrrigationDistrictById(input.id);
      }),

    getFacilities: publicProcedure
      .input(z.object({ districtId: z.number() }))
      .query(async ({ input }) => {
        return db.getFacilitiesByDistrict(input.districtId);
      }),

    syncFromMock: adminProcedure.mutation(async () => {
      const logId = await db.createSyncLog({
        source: 'MOCK',
        syncType: 'irrigation_district',
        status: 'running',
        startedAt: new Date()
      });

      try {
        const districts = mockDataGenerator.generateIrrigationDistricts();
        let processedCount = 0;

        for (const district of districts) {
          await db.upsertIrrigationDistrict(district);
          processedCount++;
        }

        if (logId) {
          await db.updateSyncLog(logId, {
            status: 'success',
            recordsProcessed: processedCount,
            completedAt: new Date()
          });
        }

        return { success: true, processedCount };
      } catch (error) {
        if (logId) {
          await db.updateSyncLog(logId, {
            status: 'failed',
            errorMessage: String(error),
            completedAt: new Date()
          });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '同步失敗' });
      }
    })
  }),

  // 灌溉設施
  facility: router({
    list: publicProcedure.query(async () => {
      return db.getAllFacilities();
    }),

    byDistrict: publicProcedure
      .input(z.object({ districtId: z.number() }))
      .query(async ({ input }) => {
        return db.getFacilitiesByDistrict(input.districtId);
      })
  }),

  // 風險評估
  riskAssessment: router({
    getLatest: publicProcedure.query(async () => {
      return db.getLatestRiskAssessments();
    }),

    getHistory: publicProcedure
      .input(z.object({ districtId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getRiskAssessmentHistory(input.districtId, input.limit || 30);
      }),

    calculate: protectedProcedure
      .input(z.object({ districtId: z.number() }))
      .mutation(async ({ input }) => {
        const assessment = mockDataGenerator.generateRiskAssessment(input.districtId);
        await db.insertRiskAssessment(assessment);
        return assessment;
      }),

    calculateAll: adminProcedure.mutation(async () => {
      const districts = await db.getAllIrrigationDistricts();
      const results = [];

      for (const district of districts) {
        const assessment = mockDataGenerator.generateRiskAssessment(district.id);
        await db.insertRiskAssessment(assessment);
        results.push(assessment);
      }

      return { success: true, count: results.length };
    })
  }),

  // 配水模擬
  waterAllocation: router({
    getSimulations: publicProcedure
      .input(z.object({ districtId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getSimulationsByDistrict(input.districtId, input.limit || 10);
      }),

    runSimulation: protectedProcedure
      .input(z.object({
        districtId: z.number(),
        scenarioName: z.string(),
        parameters: z.record(z.string(), z.any())
      }))
      .mutation(async ({ input }) => {
        // 使用輸入的可用水量，如果沒有則使用隨機值
        const totalWaterAvailable = input.parameters.totalWaterAvailable 
          ? Number(input.parameters.totalWaterAvailable) * 10000 // 轉換為噸
          : Math.random() * 50000 + 30000;
        const totalWaterDemand = Math.random() * 60000 + 25000;
        const allocationRatio = Math.min(totalWaterAvailable / totalWaterDemand, 1);
        const allocatedAmount = totalWaterAvailable * allocationRatio;
        const deficit = Math.max(0, totalWaterDemand - totalWaterAvailable);
        
        // 決定優先級
        let priority: 'normal' | 'restricted' | 'critical' = 'normal';
        if (allocationRatio < 0.7) {
          priority = 'critical';
        } else if (allocationRatio < 0.9) {
          priority = 'restricted';
        }

        const allocationPlan = {
          priority,
          allocationRatio: allocationRatio.toFixed(3),
          totalAvailable: (totalWaterAvailable / 10000).toFixed(2), // 轉換為萬噸
          totalDemand: (totalWaterDemand / 10000).toFixed(2),
          allocatedAmount: (allocatedAmount / 10000).toFixed(2),
          deficit: (deficit / 10000).toFixed(2)
        };

        const result = {
          districtId: input.districtId,
          scenarioName: input.scenarioName,
          simulationDate: new Date(),
          parameters: JSON.stringify(input.parameters),
          totalWaterAvailable: (totalWaterAvailable / 10000).toFixed(2),
          totalWaterDemand: (totalWaterDemand / 10000).toFixed(2),
          allocationEfficiency: allocationRatio.toFixed(2),
          allocationPlan: JSON.stringify(allocationPlan),
          results: JSON.stringify({
            allocatedWater: (allocatedAmount / 10000).toFixed(2),
            shortfall: (deficit / 10000).toFixed(2),
            recommendations: allocationRatio < 0.8 
              ? ['建議啟動節水措施', '調整灌溉時程', '優先供應高經濟作物']
              : ['維持正常配水', '監控水源變化']
          }),
          status: 'completed'
        };

        await db.insertSimulation(result);
        
        // 回傳包含 allocationPlan 物件的結果
        return {
          ...result,
          allocationPlan
        };
      })
  }),

  // 資料同步
  sync: router({
    initializeDemo: adminProcedure.mutation(async () => {
      const results = {
        reservoirs: 0,
        rainfallStations: 0,
        irrigationDistricts: 0,
        facilities: 0,
        riskAssessments: 0
      };

      // 同步水庫資料
      const reservoirs = mockDataGenerator.generateReservoirs();
      for (const r of reservoirs) {
        await db.upsertReservoir(r);
        results.reservoirs++;
      }

      // 同步雨量站
      const rainfallStations = mockDataGenerator.generateRainfallStations();
      for (const s of rainfallStations) {
        await db.upsertRainfallStation(s);
        results.rainfallStations++;
      }

      // 同步灌區
      const districts = mockDataGenerator.generateIrrigationDistricts();
      for (const d of districts) {
        const district = await db.upsertIrrigationDistrict(d);
        results.irrigationDistricts++;

        // 為每個灌區生成設施
        if (district) {
          const facilities = mockDataGenerator.generateIrrigationFacilities(district.id);
          for (const f of facilities) {
            await db.upsertFacility(f);
            results.facilities++;
          }

          // 生成風險評估
          const assessment = mockDataGenerator.generateRiskAssessment(district.id);
          await db.insertRiskAssessment(assessment);
          results.riskAssessments++;
        }
      }

      // 生成水庫水位資料
      const allReservoirs = await db.getAllReservoirs();
      for (const reservoir of allReservoirs) {
        const waterLevel = mockDataGenerator.generateReservoirWaterLevels(reservoir.id);
        await db.insertReservoirWaterLevel(waterLevel);
      }

      // 生成雨量記錄
      const allStations = await db.getAllRainfallStations();
      for (const station of allStations) {
        const record = mockDataGenerator.generateRainfallRecord(station.id);
        await db.insertRainfallRecord(record);
      }

      return { success: true, results };
    }),

    // 從即時 API 同步所有資料
    syncAllFromApi: adminProcedure.mutation(async () => {
      const results = {
        reservoirs: 0,
        success: true,
        errors: [] as string[]
      };

      try {
        // 同步水庫資料
        const reservoirData = await wraOpenDataApi.getAllReservoirsRealtime();
        if (reservoirData && reservoirData.length > 0) {
          for (const item of reservoirData) {
            try {
              await db.upsertReservoir({
                stationId: item.stationId,
                name: item.name,
                basin: item.basin,
                county: item.county,
                latitude: String(item.latitude || ''),
                longitude: String(item.longitude || ''),
                effectiveCapacity: item.effectiveCapacity,
                fullWaterLevel: item.fullWaterLevel
              });

              const reservoir = await db.getReservoirByStationId(item.stationId);
              if (reservoir) {
                await db.insertReservoirWaterLevel({
                  reservoirId: reservoir.id,
                  recordTime: new Date(item.recordTime),
                  waterLevel: item.waterLevel,
                  effectiveStorage: item.effectiveStorage,
                  storagePercentage: item.storagePercentage,
                  inflow: item.inflow,
                  outflow: item.outflow
                });
              }
              results.reservoirs++;
            } catch (e) {
              results.errors.push(`Failed to sync reservoir ${item.name}: ${e}`);
            }
          }
        }
      } catch (error) {
        results.success = false;
        results.errors.push(`Sync failed: ${error}`);
      }

      return results;
    })
  })
});

export type AppRouter = typeof appRouter;
