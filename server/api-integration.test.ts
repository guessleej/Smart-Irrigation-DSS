import { describe, expect, it, vi, beforeEach } from "vitest";
import { wraOpenDataApi, feitsuiApi, mockDataGenerator } from "./services/apiService";

describe("API Integration Tests", () => {
  describe("wraOpenDataApi", () => {
    it("should have correct base URL", () => {
      expect(wraOpenDataApi.baseUrl).toBe("https://opendata.wra.gov.tw/api/v2");
    });

    it("should have correct endpoint IDs", () => {
      expect(wraOpenDataApi.endpoints.reservoirDailyOperation).toBe("51023e88-4c76-4dbc-bbb9-470da690d539");
      expect(wraOpenDataApi.endpoints.reservoirWaterInfo).toBe("2be9044c-6e44-4856-aad5-dd108c2e6679");
      expect(wraOpenDataApi.endpoints.tsengwenReservoir).toBe("598befe9-a6fe-4126-a8cc-52ccbbecfc68");
    });

    it("should transform reservoir data correctly", () => {
      const rawData = [
        {
          reservoiridentifier: "10201",
          reservoirname: "石門水庫",
          capacity: "15000",
          nwlmax: "240",
          inflow: "50",
          outflow: "30",
          outflowtotal: "80",
          basinrainfall: "10",
          datetime: "2024-01-12T10:00:00"
        }
      ];

      const transformed = wraOpenDataApi.transformReservoirData(rawData);
      
      expect(transformed).toHaveLength(1);
      expect(transformed[0]).toMatchObject({
        stationId: "10201",
        name: "石門水庫",
        basin: "大漢溪",
        county: "桃園市"
      });
      expect(parseFloat(transformed[0].storagePercentage)).toBeGreaterThan(0);
    });

    it("should calculate storage percentage correctly", () => {
      const rawData = [
        {
          reservoiridentifier: "10201",
          reservoirname: "石門水庫",
          capacity: "10456.5", // 約 50% of 20913
          datetime: "2024-01-12T10:00:00"
        }
      ];

      const transformed = wraOpenDataApi.transformReservoirData(rawData);
      const percentage = parseFloat(transformed[0].storagePercentage);
      
      expect(percentage).toBeCloseTo(50, 0);
    });

    it("should determine correct status based on storage percentage", () => {
      const testCases = [
        { capacity: "18000", expectedStatus: "sufficient" }, // ~86%
        { capacity: "10000", expectedStatus: "normal" },     // ~48%
        { capacity: "5000", expectedStatus: "warning" },     // ~24%
        { capacity: "2000", expectedStatus: "critical" }     // ~10%
      ];

      testCases.forEach(({ capacity, expectedStatus }) => {
        const rawData = [{
          reservoiridentifier: "10201",
          reservoirname: "石門水庫",
          capacity,
          datetime: "2024-01-12T10:00:00"
        }];

        const transformed = wraOpenDataApi.transformReservoirData(rawData);
        expect(transformed[0].status).toBe(expectedStatus);
      });
    });
  });

  describe("feitsuiApi", () => {
    it("should have correct base URL", () => {
      expect(feitsuiApi.baseUrl).toBe("https://w3.feitsui.gov.tw/FeitsuiWebService/tpe");
    });
  });

  describe("mockDataGenerator", () => {
    it("should generate valid reservoir data", () => {
      const reservoirs = mockDataGenerator.generateReservoirs();
      
      expect(reservoirs).toHaveLength(8);
      expect(reservoirs[0]).toHaveProperty("stationId");
      expect(reservoirs[0]).toHaveProperty("name");
      expect(reservoirs[0]).toHaveProperty("basin");
      expect(reservoirs[0]).toHaveProperty("county");
      expect(reservoirs[0]).toHaveProperty("latitude");
      expect(reservoirs[0]).toHaveProperty("longitude");
      expect(reservoirs[0]).toHaveProperty("effectiveCapacity");
      expect(reservoirs[0]).toHaveProperty("fullWaterLevel");
    });

    it("should generate valid reservoir water levels", () => {
      const waterLevel = mockDataGenerator.generateReservoirWaterLevels(1);
      
      expect(waterLevel).toHaveProperty("reservoirId", 1);
      expect(waterLevel).toHaveProperty("recordTime");
      expect(waterLevel).toHaveProperty("waterLevel");
      expect(waterLevel).toHaveProperty("effectiveStorage");
      expect(waterLevel).toHaveProperty("storagePercentage");
      expect(waterLevel).toHaveProperty("inflow");
      expect(waterLevel).toHaveProperty("outflow");
      
      const percentage = parseFloat(waterLevel.storagePercentage);
      expect(percentage).toBeGreaterThanOrEqual(50);
      expect(percentage).toBeLessThanOrEqual(90);
    });

    it("should generate valid rainfall stations", () => {
      const stations = mockDataGenerator.generateRainfallStations();
      
      expect(stations).toHaveLength(6);
      expect(stations[0]).toHaveProperty("stationId");
      expect(stations[0]).toHaveProperty("name");
      expect(stations[0]).toHaveProperty("county");
      expect(stations[0]).toHaveProperty("township");
      expect(stations[0]).toHaveProperty("latitude");
      expect(stations[0]).toHaveProperty("longitude");
      expect(stations[0]).toHaveProperty("altitude");
    });

    it("should generate valid rainfall records", () => {
      const record = mockDataGenerator.generateRainfallRecord(1);
      
      expect(record).toHaveProperty("stationId", 1);
      expect(record).toHaveProperty("recordTime");
      expect(record).toHaveProperty("hourlyRainfall");
      expect(record).toHaveProperty("dailyRainfall");
      expect(record).toHaveProperty("accumulatedRainfall");
    });

    it("should generate valid irrigation districts", () => {
      const districts = mockDataGenerator.generateIrrigationDistricts();
      
      expect(districts).toHaveLength(8);
      expect(districts[0]).toHaveProperty("code");
      expect(districts[0]).toHaveProperty("name");
      expect(districts[0]).toHaveProperty("managementOffice");
      expect(districts[0]).toHaveProperty("county");
      expect(districts[0]).toHaveProperty("area");
      expect(districts[0]).toHaveProperty("irrigatedArea");
      expect(districts[0]).toHaveProperty("mainCrops");
    });

    it("should generate valid irrigation facilities", () => {
      const facilities = mockDataGenerator.generateIrrigationFacilities(1);
      
      expect(facilities).toHaveLength(5);
      expect(facilities[0]).toHaveProperty("districtId", 1);
      expect(facilities[0]).toHaveProperty("facilityType");
      expect(facilities[0]).toHaveProperty("code");
      expect(facilities[0]).toHaveProperty("name");
      expect(facilities[0]).toHaveProperty("latitude");
      expect(facilities[0]).toHaveProperty("longitude");
      expect(facilities[0]).toHaveProperty("capacity");
      expect(facilities[0]).toHaveProperty("status", "active");
      
      const validTypes = ["canal", "pond", "well", "weir", "pump_station"];
      expect(validTypes).toContain(facilities[0].facilityType);
    });

    it("should generate valid risk assessments", () => {
      const assessment = mockDataGenerator.generateRiskAssessment(1);
      
      expect(assessment).toHaveProperty("districtId", 1);
      expect(assessment).toHaveProperty("assessmentDate");
      expect(assessment).toHaveProperty("riskLevel");
      expect(assessment).toHaveProperty("riskScore");
      expect(assessment).toHaveProperty("waterSupply");
      expect(assessment).toHaveProperty("waterDemand");
      expect(assessment).toHaveProperty("supplyDemandRatio");
      expect(assessment).toHaveProperty("rainfallForecast");
      expect(assessment).toHaveProperty("reservoirStorage");
      expect(assessment).toHaveProperty("factors");
      expect(assessment).toHaveProperty("recommendations");
      
      const validRiskLevels = ["low", "moderate", "high", "critical"];
      expect(validRiskLevels).toContain(assessment.riskLevel);
    });

    it("should generate appropriate recommendations based on risk level", () => {
      // Run multiple times to test different risk levels
      const assessments = Array.from({ length: 20 }, () => 
        mockDataGenerator.generateRiskAssessment(1)
      );
      
      assessments.forEach(assessment => {
        if (assessment.riskLevel === "critical") {
          expect(assessment.recommendations).toContain("抗旱應變");
        } else if (assessment.riskLevel === "high") {
          expect(assessment.recommendations).toContain("水源調度");
        } else {
          expect(assessment.recommendations).toContain("正常");
        }
      });
    });
  });
});

describe("Data Transformation", () => {
  it("should handle empty reservoir data", () => {
    const transformed = wraOpenDataApi.transformReservoirData([]);
    expect(transformed).toEqual([]);
  });

  it("should handle missing fields gracefully", () => {
    const rawData = [
      {
        reservoiridentifier: "99999",
        reservoirname: "測試水庫",
        datetime: "2024-01-12T10:00:00"
        // Missing capacity, inflow, outflow, etc.
      }
    ];

    const transformed = wraOpenDataApi.transformReservoirData(rawData);
    
    expect(transformed).toHaveLength(1);
    expect(transformed[0].name).toBe("測試水庫");
    expect(transformed[0].effectiveStorage).toBe("0");
    expect(transformed[0].storagePercentage).toBe("0.0");
  });

  it("should handle unknown reservoir IDs", () => {
    const rawData = [
      {
        reservoiridentifier: "UNKNOWN",
        reservoirname: "未知水庫",
        capacity: "1000",
        datetime: "2024-01-12T10:00:00"
      }
    ];

    const transformed = wraOpenDataApi.transformReservoirData(rawData);
    
    expect(transformed).toHaveLength(1);
    expect(transformed[0].basin).toBe("");
    expect(transformed[0].county).toBe("");
  });
});
