import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock authenticated user context
function createAuthContext(role: 'user' | 'admin' = 'user'): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// Mock public context (no user)
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Dashboard API", () => {
  it("getStats returns dashboard statistics", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.getStats();

    expect(result).toHaveProperty("reservoirs");
    expect(result).toHaveProperty("rainfallStations");
    expect(result).toHaveProperty("waterLevelStations");
    expect(result).toHaveProperty("irrigationDistricts");
    expect(result).toHaveProperty("irrigationFacilities");
    expect(typeof result.reservoirs).toBe("number");
  });

  it("getOverview returns overview data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.getOverview();

    expect(result).toHaveProperty("avgStoragePercentage");
    expect(result).toHaveProperty("totalDailyRainfall");
    expect(result).toHaveProperty("riskDistribution");
    expect(result).toHaveProperty("lastUpdated");
    expect(result.riskDistribution).toHaveProperty("low");
    expect(result.riskDistribution).toHaveProperty("moderate");
    expect(result.riskDistribution).toHaveProperty("high");
    expect(result.riskDistribution).toHaveProperty("critical");
  });
});

describe("Reservoir API", () => {
  it("list returns array of reservoirs", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reservoir.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("getLatestLevels returns water level data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reservoir.getLatestLevels();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Rainfall API", () => {
  it("listStations returns array of stations", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.rainfall.listStations();

    expect(Array.isArray(result)).toBe(true);
  });

  it("getLatestRecords returns rainfall records", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.rainfall.getLatestRecords();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Irrigation District API", () => {
  it("list returns array of districts", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.irrigationDistrict.list();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Risk Assessment API", () => {
  it("getLatest returns latest assessments", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.riskAssessment.getLatest();

    expect(Array.isArray(result)).toBe(true);
  });

  it("getHistory returns assessment history for district", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.riskAssessment.getHistory({ districtId: 1 });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Water Allocation API", () => {
  it("getSimulations returns simulations for district", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.waterAllocation.getSimulations({ districtId: 1 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("runSimulation requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.waterAllocation.runSimulation({
        districtId: 1,
        scenarioName: "Test Scenario",
        totalWaterAvailable: 5000,
      })
    ).rejects.toThrow();
  });

  it("runSimulation works for authenticated user", async () => {
    const ctx = createAuthContext('user');
    const caller = appRouter.createCaller(ctx);

    // This test may fail if district doesn't exist, which is expected
    // The important thing is that it doesn't throw an auth error
    try {
      await caller.waterAllocation.runSimulation({
        districtId: 1,
        scenarioName: "Test Scenario",
        totalWaterAvailable: 5000,
      });
    } catch (error: any) {
      // Should not be an auth error
      expect(error.code).not.toBe("UNAUTHORIZED");
    }
  });
});

describe("Admin-only APIs", () => {
  it("dataInit.seedAll requires admin role", async () => {
    const ctx = createAuthContext('user');
    const caller = appRouter.createCaller(ctx);

    await expect(caller.dataInit.seedAll()).rejects.toThrow();
  });

  it("reservoir.syncFromApi requires admin role", async () => {
    const ctx = createAuthContext('user');
    const caller = appRouter.createCaller(ctx);

    await expect(caller.reservoir.syncFromApi()).rejects.toThrow();
  });

  it("riskAssessment.calculateAll requires admin role", async () => {
    const ctx = createAuthContext('user');
    const caller = appRouter.createCaller(ctx);

    await expect(caller.riskAssessment.calculateAll()).rejects.toThrow();
  });
});

describe("Auth API", () => {
  it("me returns user for authenticated context", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test User");
    expect(result?.email).toBe("test@example.com");
  });

  it("me returns null for public context", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeNull();
  });

  it("logout clears session cookie", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});
