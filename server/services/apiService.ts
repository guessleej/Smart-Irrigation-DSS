import axios from 'axios';

/**
 * 農業資料開放平臺 API 服務
 * Base URL: https://data.moa.gov.tw
 */
export const moaApi = {
  baseUrl: 'https://data.moa.gov.tw',

  async getWeatherStations() {
    try {
      const response = await axios.get(`${this.baseUrl}/TaiwanMeteorologicalStationInformationType/`);
      return response.data;
    } catch (error) {
      console.error('[MOA API] Failed to fetch weather stations:', error);
      return null;
    }
  },

  async getRainfallStations() {
    try {
      const response = await axios.get(`${this.baseUrl}/TaiwanRainfallStationInformationType/`);
      return response.data;
    } catch (error) {
      console.error('[MOA API] Failed to fetch rainfall stations:', error);
      return null;
    }
  },

  async getAutoWeatherStations() {
    try {
      const response = await axios.get(`${this.baseUrl}/AutoWeatherStationType/`);
      return response.data;
    } catch (error) {
      console.error('[MOA API] Failed to fetch auto weather stations:', error);
      return null;
    }
  },

  async getAutoRainfallStations() {
    try {
      const response = await axios.get(`${this.baseUrl}/AutoRainfallStationType/`);
      return response.data;
    } catch (error) {
      console.error('[MOA API] Failed to fetch auto rainfall stations:', error);
      return null;
    }
  },

  async getAgriProductsTrans() {
    try {
      const response = await axios.get(`${this.baseUrl}/AgriProductsTransType/`);
      return response.data;
    } catch (error) {
      console.error('[MOA API] Failed to fetch agri products trans:', error);
      return null;
    }
  },

  async getProductCost() {
    try {
      const response = await axios.get(`${this.baseUrl}/ProductCost/`);
      return response.data;
    } catch (error) {
      console.error('[MOA API] Failed to fetch product cost:', error);
      return null;
    }
  }
};

/**
 * 農業氣象觀測網 API 服務
 * Base URL: https://weather.moa.gov.tw/api
 * 需要 API Token 認證
 */
export const weatherMoaApi = {
  baseUrl: 'https://weather.moa.gov.tw/api',
  token: process.env.WEATHER_MOA_API_TOKEN || '',

  // 取得測站基本資訊
  async getStationInfo() {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/StationInfo`, {
        params: { token: this.token },
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      console.error('[Weather MOA API] Failed to fetch station info:', error);
      return null;
    }
  },

  // 取得雨量站逐時資料
  async getPrecipitationHourly(stationIds: string[], startTime: string, endTime: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/station/precipitation/hour`,
        {
          range: { startTime, endTime },
          stationIds
        },
        {
          params: { token: this.token },
          timeout: 15000
        }
      );
      return response.data;
    } catch (error) {
      console.error('[Weather MOA API] Failed to fetch precipitation hourly:', error);
      return null;
    }
  },

  // 取得雨量站逐日資料
  async getPrecipitationDaily(stationIds: string[], startTime: string, endTime: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/station/precipitation/day`,
        {
          range: { startTime, endTime },
          stationIds
        },
        {
          params: { token: this.token },
          timeout: 15000
        }
      );
      return response.data;
    } catch (error) {
      console.error('[Weather MOA API] Failed to fetch precipitation daily:', error);
      return null;
    }
  },

  // 取得自動氣象站逐時資料
  async getAutoStationHourly(stationIds: string[], startTime: string, endTime: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/station/auto/hour`,
        {
          range: { startTime, endTime },
          stationIds
        },
        {
          params: { token: this.token },
          timeout: 15000
        }
      );
      return response.data;
    } catch (error) {
      console.error('[Weather MOA API] Failed to fetch auto station hourly:', error);
      return null;
    }
  },

  // 取得綜觀氣象站逐時資料
  async getSynopticStationHourly(stationIds: string[], startTime: string, endTime: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/station/synoptic/hour`,
        {
          range: { startTime, endTime },
          stationIds
        },
        {
          params: { token: this.token },
          timeout: 15000
        }
      );
      return response.data;
    } catch (error) {
      console.error('[Weather MOA API] Failed to fetch synoptic station hourly:', error);
      return null;
    }
  },

  // 取得氣象網格資料
  async getCubeData(params: {
    startTime: string;
    endTime: string;
    weatherType: 'precipitation' | 'temperature';
    timeScale: 'hour' | 'day' | 'month';
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/cube`,
        params,
        {
          params: { token: this.token },
          timeout: 30000
        }
      );
      return response.data;
    } catch (error) {
      console.error('[Weather MOA API] Failed to fetch cube data:', error);
      return null;
    }
  }
};

/**
 * 水利資料整合雲平台 Open API 服務
 * Base URL: https://opendata.wra.gov.tw/api/v2
 * 此為政府開放資料，無需 API Key
 */
export const wraOpenDataApi = {
  baseUrl: 'https://opendata.wra.gov.tw/api/v2',

  // API 端點 ID
  endpoints: {
    // 水庫與堰壩
    reservoirDailyOperation: '51023e88-4c76-4dbc-bbb9-470da690d539', // 水庫每日營運狀況
    reservoirWaterInfo: '2be9044c-6e44-4856-aad5-dd108c2e6679',      // 水庫水情資料
    tsengwenReservoir: '598befe9-a6fe-4126-a8cc-52ccbbecfc68',       // 曾文水庫即時水情
    mudanReservoir: '6d7ba910-b627-4844-882b-df232064db0c',          // 牡丹水庫即時水情
    shimenTurbidity: '7cd352ef-6518-4396-b2d6-61f1946a5611',         // 石門水庫濁度資料
    agongdianReservoir: 'ecc4ce8d-0942-474a-8705-53e9aaa7c4e8',      // 阿公店水庫即時水情
    
    // 水文統計
    rainfallStations: '15c166e9-800f-4a81-ba60-0ba61b6c9975',        // 水利署所屬雨量站基本資料
    groundwaterStats: 'f3ae2889-ccaf-45a3-a546-0edd8d9fd2da',        // 地下水水位年度統計
    groundwaterWells: '3e86faea-e94a-4a91-a870-852d73e83c3d',        // 地下水水位觀測井井況
    
    // 河川與排水
    realtimeWaterLevel: '73c4c3de-4045-4765-abeb-89f9f9cd5ff0',      // 即時水位資料
    riverWaterLevelStations: 'c4acc691-7416-40ca-9464-292c0c00da92', // 河川水位測站站況
    riverFlowStations: '9332bd66-0213-4380-a5d5-a43e7be49255',       // 河川流量測站站況
  },

  // 通用 API 請求方法
  async fetchData(endpointId: string, page: number = 1, size: number = 200) {
    try {
      const response = await axios.get(`${this.baseUrl}/${endpointId}`, {
        params: { page, size },
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      console.error(`[WRA OpenData API] Failed to fetch data from ${endpointId}:`, error);
      return null;
    }
  },

  // 取得水庫每日營運狀況
  async getReservoirDailyOperation(page: number = 1, size: number = 200) {
    return this.fetchData(this.endpoints.reservoirDailyOperation, page, size);
  },

  // 取得水庫水情資料
  async getReservoirWaterInfo(page: number = 1, size: number = 200) {
    return this.fetchData(this.endpoints.reservoirWaterInfo, page, size);
  },

  // 取得雨量站基本資料
  async getRainfallStations(page: number = 1, size: number = 200) {
    return this.fetchData(this.endpoints.rainfallStations, page, size);
  },

  // 取得即時水位資料
  async getRealtimeWaterLevel(page: number = 1, size: number = 200) {
    return this.fetchData(this.endpoints.realtimeWaterLevel, page, size);
  },

  // 取得河川水位測站站況
  async getRiverWaterLevelStations(page: number = 1, size: number = 200) {
    return this.fetchData(this.endpoints.riverWaterLevelStations, page, size);
  },

  // 取得所有水庫即時資料
  async getAllReservoirsRealtime() {
    try {
      const dailyData = await this.getReservoirDailyOperation(1, 200);
      if (!dailyData || !Array.isArray(dailyData)) return null;
      return this.transformReservoirData(dailyData);
    } catch (error) {
      console.error('[WRA OpenData API] Failed to fetch all reservoirs:', error);
      return null;
    }
  },

  // 取得主要水庫即時資料
  async getMajorReservoirsRealtime() {
    try {
      const dailyData = await this.getReservoirDailyOperation(1, 200);
      if (!dailyData || !Array.isArray(dailyData)) return null;

      // 主要水庫 ID
      const majorReservoirIds = [
        '10201', '10205', '20201', '20502', '30502', '30503', '30501', '20101',
        '10501', '10401', '10405', '31201', '30802', '30301', '20509', '20501',
        '10601', '30401'
      ];

      const majorReservoirs = dailyData.filter((item: any) => 
        majorReservoirIds.includes(item.reservoiridentifier)
      );

      return this.transformReservoirData(majorReservoirs);
    } catch (error) {
      console.error('[WRA OpenData API] Failed to fetch major reservoirs:', error);
      return null;
    }
  },

  // 轉換水庫資料格式
  transformReservoirData(rawData: any[]) {
    const reservoirInfo: Record<string, { basin: string; county: string; fullWaterLevel: number; effectiveCapacity: number; lat: number; lng: number }> = {
      '10201': { basin: '大漢溪', county: '桃園市', fullWaterLevel: 245, effectiveCapacity: 20913, lat: 24.8167, lng: 121.2333 },
      '10205': { basin: '北勢溪', county: '新北市', fullWaterLevel: 170, effectiveCapacity: 40600, lat: 24.9000, lng: 121.5667 },
      '20201': { basin: '大甲溪', county: '台中市', fullWaterLevel: 1400, effectiveCapacity: 17300, lat: 24.2667, lng: 121.1500 },
      '20502': { basin: '濁水溪', county: '南投縣', fullWaterLevel: 748.5, effectiveCapacity: 15400, lat: 23.8500, lng: 120.9167 },
      '30502': { basin: '曾文溪', county: '嘉義縣', fullWaterLevel: 230, effectiveCapacity: 50848, lat: 23.2500, lng: 120.5333 },
      '30503': { basin: '後堀溪', county: '台南市', fullWaterLevel: 180, effectiveCapacity: 15800, lat: 23.0833, lng: 120.4833 },
      '30501': { basin: '曾文溪', county: '台南市', fullWaterLevel: 58, effectiveCapacity: 8000, lat: 23.2000, lng: 120.3667 },
      '20101': { basin: '大安溪', county: '苗栗縣', fullWaterLevel: 300, effectiveCapacity: 12600, lat: 24.3167, lng: 120.7500 },
      '10501': { basin: '中港溪', county: '苗栗縣', fullWaterLevel: 88, effectiveCapacity: 2993, lat: 24.5833, lng: 120.9167 },
      '10401': { basin: '頭前溪', county: '新竹縣', fullWaterLevel: 141.6, effectiveCapacity: 501, lat: 24.7333, lng: 121.0500 },
      '10405': { basin: '頭前溪', county: '新竹縣', fullWaterLevel: 145, effectiveCapacity: 3380, lat: 24.7167, lng: 121.0667 },
      '31201': { basin: '四重溪', county: '屏東縣', fullWaterLevel: 141, effectiveCapacity: 2622, lat: 22.1167, lng: 120.7833 },
      '30802': { basin: '阿公店溪', county: '高雄市', fullWaterLevel: 40, effectiveCapacity: 1468, lat: 22.7833, lng: 120.3500 },
      '30301': { basin: '八掌溪', county: '嘉義縣', fullWaterLevel: 75.38, effectiveCapacity: 2459, lat: 23.4667, lng: 120.5000 },
      '20509': { basin: '北港溪', county: '雲林縣', fullWaterLevel: 211.5, effectiveCapacity: 5041, lat: 23.5833, lng: 120.6167 },
      '20501': { basin: '濁水溪', county: '南投縣', fullWaterLevel: 1005, effectiveCapacity: 2572, lat: 24.0333, lng: 121.1333 },
      '10601': { basin: '後龍溪', county: '苗栗縣', fullWaterLevel: 85, effectiveCapacity: 1242, lat: 24.5500, lng: 120.8833 },
      '30401': { basin: '白水溪', county: '台南市', fullWaterLevel: 90, effectiveCapacity: 1404, lat: 23.3500, lng: 120.4833 },
    };

    return rawData.map((item: any) => {
      const info = reservoirInfo[item.reservoiridentifier] || { basin: '', county: '', fullWaterLevel: 0, effectiveCapacity: 0, lat: 0, lng: 0 };
      const capacity = parseFloat(item.capacity) || 0;
      const effectiveCapacity = info.effectiveCapacity || capacity;
      const storagePercentage = effectiveCapacity > 0 ? (capacity / effectiveCapacity * 100) : 0;

      // 判斷水庫狀態
      let status: 'sufficient' | 'normal' | 'warning' | 'critical' = 'normal';
      if (storagePercentage >= 70) status = 'sufficient';
      else if (storagePercentage >= 40) status = 'normal';
      else if (storagePercentage >= 20) status = 'warning';
      else status = 'critical';

      return {
        stationId: item.reservoiridentifier,
        name: item.reservoirname,
        basin: info.basin,
        county: info.county,
        latitude: info.lat,
        longitude: info.lng,
        effectiveCapacity: effectiveCapacity.toString(),
        fullWaterLevel: info.fullWaterLevel.toString(),
        waterLevel: item.nwlmax || '0',
        effectiveStorage: capacity.toString(),
        storagePercentage: storagePercentage.toFixed(1),
        inflow: item.inflow || '0',
        outflow: item.outflow || '0',
        totalOutflow: item.outflowtotal || '0',
        basinRainfall: item.basinrainfall || '0',
        recordTime: item.datetime,
        status
      };
    });
  }
};

/**
 * 翡翠水庫即時水情 API
 * 台北翡翠水庫管理局提供
 */
export const feitsuiApi = {
  baseUrl: 'https://w3.feitsui.gov.tw/FeitsuiWebService/tpe',

  // 取得翡翠水庫即時水情
  async getReservoirRainHour() {
    try {
      const response = await axios.get(`${this.baseUrl}/Feitsui_Hourly.asmx/RESOIR_RAIN_HOUR`, {
        timeout: 15000
      });
      
      // 解析 XML 回應
      const xmlData = response.data;
      const timeMatch = xmlData.match(/<時間>([^<]+)<\/時間>/);
      const waterLevelMatch = xmlData.match(/<水位>([^<]+)<\/水位>/);
      const storageMatch = xmlData.match(/<有效蓄水量>([^<]+)<\/有效蓄水量>/);
      const percentageMatch = xmlData.match(/<有效蓄水量百分比>([^<]+)<\/有效蓄水量百分比>/);
      const avgRainfallMatch = xmlData.match(/<集水區平均>([^<]+)<\/集水區平均>/);

      return {
        stationId: '10205',
        name: '翡翠水庫',
        recordTime: timeMatch ? timeMatch[1] : null,
        waterLevel: waterLevelMatch ? waterLevelMatch[1] : null,
        effectiveStorage: storageMatch ? (parseFloat(storageMatch[1]) / 10000).toFixed(2) : null, // 轉換為萬噸
        storagePercentage: percentageMatch ? parseFloat(percentageMatch[1]).toFixed(1) : null,
        basinRainfall: avgRainfallMatch ? avgRainfallMatch[1] : null
      };
    } catch (error) {
      console.error('[Feitsui API] Failed to fetch reservoir data:', error);
      return null;
    }
  }
};

/**
 * 水利署防災資訊服務網 API 服務（需 API Key）
 */
export const wraApi = {
  baseUrl: 'https://fhy.wra.gov.tw/Api/Api/General/v2',
  appKey: process.env.WRA_API_KEY || '',

  getHeaders() {
    return {
      'App-Key': this.appKey,
      'Content-Type': 'application/json'
    };
  },

  async getBasins() {
    try {
      const response = await axios.get(`${this.baseUrl}/Basic/Basin`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error('[WRA API] Failed to fetch basins:', error);
      return null;
    }
  },

  async getCities() {
    try {
      const response = await axios.get(`${this.baseUrl}/Basic/City`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error('[WRA API] Failed to fetch cities:', error);
      return null;
    }
  },

  async getRainfallStations() {
    try {
      const response = await axios.get(`${this.baseUrl}/Rainfall/Station`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error('[WRA API] Failed to fetch rainfall stations:', error);
      return null;
    }
  },

  async getRainfallRealTime() {
    try {
      const response = await axios.get(`${this.baseUrl}/Rainfall/Info/RealTime`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error('[WRA API] Failed to fetch rainfall realtime:', error);
      return null;
    }
  },

  async getReservoirStations() {
    try {
      const response = await axios.get(`${this.baseUrl}/Reservoir/Station`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error('[WRA API] Failed to fetch reservoir stations:', error);
      return null;
    }
  },

  async getReservoirRealTime() {
    try {
      const response = await axios.get(`${this.baseUrl}/Reservoir/Info/RealTime`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error('[WRA API] Failed to fetch reservoir realtime:', error);
      return null;
    }
  },

  async getReservoirDaily() {
    try {
      const response = await axios.get(`${this.baseUrl}/Reservoir/Daily`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error('[WRA API] Failed to fetch reservoir daily:', error);
      return null;
    }
  },

  async getWaterLevelStations() {
    try {
      const response = await axios.get(`${this.baseUrl}/WaterLevel/Station`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error('[WRA API] Failed to fetch water level stations:', error);
      return null;
    }
  },

  async getWaterLevelRealTime() {
    try {
      const response = await axios.get(`${this.baseUrl}/WaterLevel/Info/RealTime`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error('[WRA API] Failed to fetch water level realtime:', error);
      return null;
    }
  },

  async getFloodingDisaster() {
    try {
      const response = await axios.get(`${this.baseUrl}/Disaster/Flooding`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error('[WRA API] Failed to fetch flooding disaster:', error);
      return null;
    }
  },

  async getReservoirWarning() {
    try {
      const response = await axios.get(`${this.baseUrl}/Reservoir/Warning`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error('[WRA API] Failed to fetch reservoir warning:', error);
      return null;
    }
  }
};

/**
 * 模擬資料生成器（用於開發測試）
 */
export const mockDataGenerator = {
  generateReservoirs() {
    const reservoirData = [
      { stationId: 'RES001', name: '石門水庫', basin: '大漢溪', county: '桃園市', latitude: '24.8167', longitude: '121.2333', effectiveCapacity: '20913', fullWaterLevel: '245' },
      { stationId: 'RES002', name: '曾文水庫', basin: '曾文溪', county: '嘉義縣', latitude: '23.2500', longitude: '120.5333', effectiveCapacity: '50848', fullWaterLevel: '230' },
      { stationId: 'RES003', name: '翡翠水庫', basin: '北勢溪', county: '新北市', latitude: '24.9000', longitude: '121.5667', effectiveCapacity: '40600', fullWaterLevel: '170' },
      { stationId: 'RES004', name: '德基水庫', basin: '大甲溪', county: '台中市', latitude: '24.2667', longitude: '121.1500', effectiveCapacity: '17300', fullWaterLevel: '1400' },
      { stationId: 'RES005', name: '日月潭水庫', basin: '濁水溪', county: '南投縣', latitude: '23.8500', longitude: '120.9167', effectiveCapacity: '15400', fullWaterLevel: '748.5' },
      { stationId: 'RES006', name: '南化水庫', basin: '後堀溪', county: '台南市', latitude: '23.0833', longitude: '120.4833', effectiveCapacity: '15800', fullWaterLevel: '180' },
      { stationId: 'RES007', name: '烏山頭水庫', basin: '曾文溪', county: '台南市', latitude: '23.2000', longitude: '120.3667', effectiveCapacity: '8000', fullWaterLevel: '58' },
      { stationId: 'RES008', name: '鯉魚潭水庫', basin: '大安溪', county: '苗栗縣', latitude: '24.3167', longitude: '120.7500', effectiveCapacity: '12600', fullWaterLevel: '300' }
    ];
    return reservoirData;
  },

  generateReservoirWaterLevels(reservoirId: number) {
    const now = new Date();
    const storagePercentage = Math.random() * 40 + 50;
    return {
      reservoirId,
      recordTime: now,
      waterLevel: (Math.random() * 50 + 150).toFixed(2),
      effectiveStorage: (storagePercentage * 200).toFixed(2),
      storagePercentage: storagePercentage.toFixed(2),
      inflow: (Math.random() * 100).toFixed(2),
      outflow: (Math.random() * 80).toFixed(2)
    };
  },

  generateRainfallStations() {
    const stations = [
      // 北部地區
      { stationId: 'RF001', name: '桃園氣象站', county: '桃園市', township: '桃園區', latitude: '24.9936', longitude: '121.3010', altitude: '35', basin: '南崁溪', source: '農業氣象觀測網' },
      { stationId: 'RF002', name: '新竹氣象站', county: '新竹市', township: '東區', latitude: '24.8017', longitude: '120.9714', altitude: '27', basin: '頭前溪', source: '農業氣象觀測網' },
      { stationId: 'RF003', name: '大溪雨量站', county: '桃園市', township: '大溪區', latitude: '24.8833', longitude: '121.2333', altitude: '280', basin: '大漢溪', source: '水利署' },
      { stationId: 'RF004', name: '石門雨量站', county: '桃園市', township: '龍潭區', latitude: '24.8167', longitude: '121.2500', altitude: '250', basin: '大漢溪', source: '水利署' },
      { stationId: 'RF005', name: '宜蘭氣象站', county: '宜蘭縣', township: '宜蘭市', latitude: '24.7639', longitude: '121.7528', altitude: '8', basin: '蘭陽溪', source: '農業氣象觀測網' },
      { stationId: 'RF006', name: '基隆雨量站', county: '基隆市', township: '中正區', latitude: '25.1333', longitude: '121.7333', altitude: '27', basin: '基隆河', source: '水利署' },
      // 中部地區
      { stationId: 'RF007', name: '台中氣象站', county: '台中市', township: '西區', latitude: '24.1469', longitude: '120.6839', altitude: '84', basin: '大甲溪', source: '農業氣象觀測網' },
      { stationId: 'RF008', name: '彰化氣象站', county: '彰化縣', township: '彰化市', latitude: '24.0833', longitude: '120.5333', altitude: '9', basin: '濯水溪', source: '農業氣象觀測網' },
      { stationId: 'RF009', name: '南投氣象站', county: '南投縣', township: '南投市', latitude: '23.9167', longitude: '120.6833', altitude: '358', basin: '濯水溪', source: '農業氣象觀測網' },
      { stationId: 'RF010', name: '苗栗雨量站', county: '苗栗縣', township: '苗栗市', latitude: '24.5667', longitude: '120.8167', altitude: '100', basin: '後龍溪', source: '水利署' },
      { stationId: 'RF011', name: '雲林氣象站', county: '雲林縣', township: '斗六市', latitude: '23.7167', longitude: '120.5333', altitude: '25', basin: '北港溪', source: '農業氣象觀測網' },
      // 南部地區
      { stationId: 'RF012', name: '嘉義氣象站', county: '嘉義市', township: '西區', latitude: '23.4800', longitude: '120.4500', altitude: '27', basin: '八掌溪', source: '農業氣象觀測網' },
      { stationId: 'RF013', name: '台南氣象站', county: '台南市', township: '中西區', latitude: '22.9908', longitude: '120.2133', altitude: '14', basin: '曾文溪', source: '農業氣象觀測網' },
      { stationId: 'RF014', name: '曾文水庫雨量站', county: '嘉義縣', township: '大埔鄉', latitude: '23.2500', longitude: '120.5333', altitude: '232', basin: '曾文溪', source: '水利署' },
      { stationId: 'RF015', name: '高雄氣象站', county: '高雄市', township: '前金區', latitude: '22.6273', longitude: '120.3014', altitude: '2', basin: '愛河', source: '農業氣象觀測網' },
      { stationId: 'RF016', name: '屏東氣象站', county: '屏東縣', township: '屏東市', latitude: '22.6700', longitude: '120.4867', altitude: '37', basin: '高屏溪', source: '農業氣象觀測網' },
      { stationId: 'RF017', name: '南化水庫雨量站', county: '台南市', township: '南化區', latitude: '23.0833', longitude: '120.4833', altitude: '185', basin: '後堵溪', source: '水利署' },
      // 東部地區
      { stationId: 'RF018', name: '花蓮氣象站', county: '花蓮縣', township: '花蓮市', latitude: '23.9750', longitude: '121.6000', altitude: '16', basin: '花蓮溪', source: '農業氣象觀測網' },
      { stationId: 'RF019', name: '台東氣象站', county: '台東縣', township: '台東市', latitude: '22.7583', longitude: '121.1500', altitude: '9', basin: '卑南溪', source: '農業氣象觀測網' },
      { stationId: 'RF020', name: '玉里雨量站', county: '花蓮縣', township: '玉里鎮', latitude: '23.3333', longitude: '121.3167', altitude: '50', basin: '秀姑巒溪', source: '水利署' }
    ];
    return stations;
  },

  generateRainfallRecord(stationId: number) {
    const now = new Date();
    return {
      stationId,
      recordTime: now,
      hourlyRainfall: (Math.random() * 20).toFixed(2),
      dailyRainfall: (Math.random() * 50).toFixed(2),
      accumulatedRainfall: (Math.random() * 200).toFixed(2)
    };
  },

  generateIrrigationDistricts() {
    const districts = [
      // 農田水利署各管理處完整資料（含座標）
      { code: 'ID001', name: '桃園管理處', managementOffice: '農田水利署桃園管理處', county: '桃園市', area: '25000', irrigatedArea: '18000', mainCrops: '水稻、蓬菜、茶葉', waterSources: '石門水庫、埔塘', latitude: '24.9936', longitude: '121.3010', address: '桃園市桃園區介壽路32號' },
      { code: 'ID002', name: '石門管理處', managementOffice: '農田水利署石門管理處', county: '桃園市', area: '32000', irrigatedArea: '24000', mainCrops: '水稻、茶葉、柑橘', waterSources: '石門水庫、大漢溪', latitude: '24.8200', longitude: '121.2400', address: '桃園市龍潭區中正路210號' },
      { code: 'ID003', name: '新竹管理處', managementOffice: '農田水利署新竹管理處', county: '新竹縣', area: '18000', irrigatedArea: '12000', mainCrops: '水稻、柑橘、水梨', waterSources: '寶山水庫、頭前溪', latitude: '24.8017', longitude: '120.9714', address: '新竹市東區光復路二段295號' },
      { code: 'ID004', name: '苗栗管理處', managementOffice: '農田水利署苗栗管理處', county: '苗栗縣', area: '22000', irrigatedArea: '15000', mainCrops: '水稻、草莓、芥菜', waterSources: '鯉魚潭水庫、後龍溪', latitude: '24.5667', longitude: '120.8167', address: '苗栗縣苗栗市縣府路100號' },
      { code: 'ID005', name: '台中管理處', managementOffice: '農田水利署台中管理處', county: '台中市', area: '45000', irrigatedArea: '35000', mainCrops: '水稻、蓬菜、花卉、葡萄', waterSources: '德基水庫、大甲溪', latitude: '24.1469', longitude: '120.6839', address: '台中市西區民生路163號' },
      { code: 'ID006', name: '南投管理處', managementOffice: '農田水利署南投管理處', county: '南投縣', area: '28000', irrigatedArea: '20000', mainCrops: '水稻、茶葉、筍筍', waterSources: '日月潭水庫、濯水溪', latitude: '23.9167', longitude: '120.6833', address: '南投縣南投市彰南路二段南投段600號' },
      { code: 'ID007', name: '彰化管理處', managementOffice: '農田水利署彰化管理處', county: '彰化縣', area: '55000', irrigatedArea: '42000', mainCrops: '水稻、葡萄、花椰菜', waterSources: '集集攔沙壩、濯水溪', latitude: '24.0833', longitude: '120.5333', address: '彰化縣彰化市中山路二段349號' },
      { code: 'ID008', name: '雲林管理處', managementOffice: '農田水利署雲林管理處', county: '雲林縣', area: '48000', irrigatedArea: '38000', mainCrops: '水稻、花生、大蒜', waterSources: '湖山水庫、北港溪', latitude: '23.7167', longitude: '120.5333', address: '雲林縣斗六市大同路400號' },
      { code: 'ID009', name: '嘉南管理處', managementOffice: '農田水利署嘉南管理處', county: '台南市', area: '78000', irrigatedArea: '65000', mainCrops: '水稻、甘蔗、蓮藕、玉米', waterSources: '曾文水庫、烏山頭水庫、嘉南大圳', latitude: '23.0000', longitude: '120.2200', address: '台南市新營區長榮路三段100號' },
      { code: 'ID010', name: '高雄管理處', managementOffice: '農田水利署高雄管理處', county: '高雄市', area: '35000', irrigatedArea: '28000', mainCrops: '水稻、蓬菜、芒果、香蕉', waterSources: '阿公店水庫、高屏溪', latitude: '22.6273', longitude: '120.3014', address: '高雄市鳥松區大埠路32號' },
      { code: 'ID011', name: '屏東管理處', managementOffice: '農田水利署屏東管理處', county: '屏東縣', area: '42000', irrigatedArea: '32000', mainCrops: '水稻、蓮霧、香蕉、檎檬', waterSources: '牡丹水庫、高屏溪', latitude: '22.6700', longitude: '120.4867', address: '屏東縣屏東市民生路二段60號' },
      { code: 'ID012', name: '台東管理處', managementOffice: '農田水利署台東管理處', county: '台東縣', area: '25000', irrigatedArea: '18000', mainCrops: '水稻、釋迦、鳳梨', waterSources: '卑南溪、地下水', latitude: '22.7583', longitude: '121.1500', address: '台東縣台東市中山路一段402號' },
      { code: 'ID013', name: '花蓮管理處', managementOffice: '農田水利署花蓮管理處', county: '花蓮縣', area: '30000', irrigatedArea: '22000', mainCrops: '水稻、西瓜、文旦', waterSources: '花蓮溪、秀姑巒溪', latitude: '23.9750', longitude: '121.6000', address: '花蓮縣花蓮市中山路一段433號' },
      { code: 'ID014', name: '宜蘭管理處', managementOffice: '農田水利署宜蘭管理處', county: '宜蘭縣', area: '22000', irrigatedArea: '16000', mainCrops: '水稻、三星蔥、金棗', waterSources: '蘭陽溪、宜蘭河', latitude: '24.7639', longitude: '121.7528', address: '宜蘭縣宜蘭市神農路二段117號' },
      { code: 'ID015', name: '湖口工作站', managementOffice: '農田水利署桃園管理處湖口工作站', county: '新竹縣', area: '8500', irrigatedArea: '6200', mainCrops: '水稻、蓬菜、茶葉', waterSources: '石門水庫、埔塘', latitude: '24.8983', longitude: '121.0433', address: '新竹縣湖口鄉中正路一段280號' }
    ];
    return districts;
  },

  generateIrrigationFacilities(districtId: number) {
    const facilityTypes = ['canal', 'pond', 'well', 'weir', 'pump_station'] as const;
    const facilities = [];
    
    for (let i = 0; i < 5; i++) {
      facilities.push({
        districtId,
        facilityType: facilityTypes[Math.floor(Math.random() * facilityTypes.length)],
        code: `FAC${districtId.toString().padStart(3, '0')}${(i + 1).toString().padStart(3, '0')}`,
        name: `設施 ${i + 1}`,
        latitude: String(24 + Math.random() * 2),
        longitude: String(120 + Math.random() * 2),
        capacity: String(Math.floor(Math.random() * 10000)),
        status: 'active' as const
      });
    }
    return facilities;
  },

  generateRiskAssessment(districtId: number) {
    const riskLevels = ['low', 'moderate', 'high', 'critical'] as const;
    const riskScore = Math.random() * 100;
    let riskLevel: typeof riskLevels[number];
    
    if (riskScore < 25) riskLevel = 'low';
    else if (riskScore < 50) riskLevel = 'moderate';
    else if (riskScore < 75) riskLevel = 'high';
    else riskLevel = 'critical';

    const waterSupply = Math.random() * 10000 + 5000;
    const waterDemand = Math.random() * 12000 + 4000;

    return {
      districtId,
      assessmentDate: new Date(),
      riskLevel,
      riskScore: riskScore.toFixed(2),
      waterSupply: waterSupply.toFixed(2),
      waterDemand: waterDemand.toFixed(2),
      supplyDemandRatio: (waterSupply / waterDemand).toFixed(2),
      rainfallForecast: (Math.random() * 100).toFixed(2),
      reservoirStorage: (Math.random() * 40 + 50).toFixed(2),
      factors: JSON.stringify({
        rainfall: Math.random() > 0.5 ? 'below_normal' : 'normal',
        temperature: Math.random() > 0.5 ? 'above_normal' : 'normal',
        cropStage: 'growing'
      }),
      recommendations: riskLevel === 'critical' 
        ? '建議立即啟動抗旱應變措施，調整配水計畫'
        : riskLevel === 'high'
        ? '建議加強水源調度，準備備用水源'
        : '維持正常灌溉作業'
    };
  }
};
