# 農業氣象觀測網 API 資訊

## API 基本資訊
- Base URL: https://weather.moa.gov.tw/api
- 認證方式: API Token (query parameter)

## 主要 API 端點

### 1. 雨量觀測站逐時資料
- **端點**: POST /v1/station/precipitation/hour
- **說明**: 提供全臺雨量觀測站的逐時氣象觀測資料，觀測時間為整點
- **請求格式**:
```json
{
  "range": {
    "startTime": "2024-04-01T00:00",
    "endTime": "2024-04-01T23:00"
  },
  "stationIds": ["C11230"]
}
```
- **回應格式**:
```json
[
  {
    "stationId": "C0A520",
    "weather": [
      {
        "obsTime": "2024-03-07T11:10:00+08:00",
        "precipitation": "0.1",
        "updateTime": "2024-03-07T11:10:00+08:00"
      }
    ]
  }
]
```

### 2. 自動氣象站逐時資料
- **端點**: POST /v1/station/auto/hour
- **說明**: 提供全臺自動氣象站的逐時氣象觀測資料

### 3. 綜觀氣象站逐時資料
- **端點**: POST /v1/station/synoptic/hour
- **說明**: 提供全臺綜觀氣象站(含農業氣象站)的逐時氣象觀測資料

### 4. 測站基本資訊
- **端點**: GET /v1/StationInfo
- **說明**: 提供所有測站的基本資訊

### 5. 氣象網格資料
- **端點**: POST /v1/cube
- **說明**: 提供全臺雨量及溫度的氣象網格資料

### 6. 氣象網格預報
- **端點**: POST /v1/cube/forecast
- **說明**: 提供全臺逐時氣象網格預報資料

## 注意事項
- 需要 API Token 才能存取資料
- 時間格式使用 ISO 8601
- 可指定特定測站或查詢全部測站
