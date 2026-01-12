import { useState, useRef, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { MapPin, Droplets, Cloud, Building2, Layers, AlertTriangle } from "lucide-react";
import { MapView as GoogleMapView } from "@/components/Map";

// 台灣中心點座標
const TAIWAN_CENTER = { lat: 23.97, lng: 120.97 };

export default function MapView() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [activeLayer, setActiveLayer] = useState<string>("reservoirs");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);

  const { data: reservoirs } = trpc.reservoir.getLatestLevels.useQuery();
  const { data: rainfallStations } = trpc.rainfall.listStations.useQuery();
  const { data: districts } = trpc.irrigationDistrict.list.useQuery();

  const getStorageColor = (percentage: number) => {
    if (percentage >= 70) return '#10b981';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];
  }, []);

  const addMarkers = useCallback((map: google.maps.Map, layer: string) => {
    clearMarkers();

    let markerData: any[] = [];

    if (layer === 'reservoirs' && reservoirs) {
      markerData = reservoirs.filter(r => r.reservoir?.latitude && r.reservoir?.longitude).map(r => ({
        id: r.reservoir?.id,
        name: r.reservoir?.name || '未知水庫',
        lat: Number(r.reservoir?.latitude),
        lng: Number(r.reservoir?.longitude),
        type: 'reservoir',
        data: r,
        color: getStorageColor(Number(r.waterLevel?.storagePercentage) || 0),
        percentage: Number(r.waterLevel?.storagePercentage) || 0
      }));
    } else if (layer === 'rainfall' && rainfallStations) {
      markerData = rainfallStations.filter(s => s.latitude && s.longitude).map(s => ({
        id: s.id,
        name: s.name,
        lat: Number(s.latitude),
        lng: Number(s.longitude),
        type: 'rainfall',
        data: s,
        color: '#06b6d4'
      }));
    } else if (layer === 'districts' && districts) {
      // 灌區管理處座標（模擬）
      const districtCoords: Record<string, { lat: number; lng: number }> = {
        '桃園管理處': { lat: 24.99, lng: 121.30 },
        '新竹管理處': { lat: 24.80, lng: 120.97 },
        '苗栗管理處': { lat: 24.56, lng: 120.82 },
        '台中管理處': { lat: 24.15, lng: 120.67 },
        '彰化管理處': { lat: 24.08, lng: 120.54 },
        '嘉南管理處': { lat: 23.30, lng: 120.31 },
        '高雄管理處': { lat: 22.63, lng: 120.30 },
        '石門管理處': { lat: 24.82, lng: 121.24 },
      };
      markerData = districts.map(d => ({
        id: d.id,
        name: d.name,
        lat: districtCoords[d.name]?.lat || 24 + Math.random() * 2,
        lng: districtCoords[d.name]?.lng || 120 + Math.random() * 2,
        type: 'district',
        data: d,
        color: '#8b5cf6'
      }));
    }

    markerData.forEach(item => {
      if (!item.lat || !item.lng || isNaN(item.lat) || isNaN(item.lng)) return;

      // 創建自定義標記內容
      const markerContent = document.createElement('div');
      markerContent.className = 'custom-marker';
      markerContent.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${item.color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
          ${item.type === 'reservoir' ? `<span style="color: white; font-size: 10px; font-weight: bold;">${Math.round(item.percentage || 0)}%</span>` : ''}
        </div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: item.lat, lng: item.lng },
        title: item.name,
        content: markerContent,
      });

      marker.addListener('click', () => {
        setSelectedItem(item);
      });

      markersRef.current.push(marker);
    });
  }, [reservoirs, rainfallStations, districts, clearMarkers]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
    addMarkers(map, activeLayer);
  }, [activeLayer, addMarkers]);

  const handleLayerChange = useCallback((layer: string) => {
    setActiveLayer(layer);
    setSelectedItem(null);
    if (mapRef.current) {
      addMarkers(mapRef.current, layer);
    }
  }, [addMarkers]);

  // 當資料更新時重新渲染標記
  const prevDataRef = useRef({ reservoirs, rainfallStations, districts });
  if (mapReady && mapRef.current && (
    prevDataRef.current.reservoirs !== reservoirs ||
    prevDataRef.current.rainfallStations !== rainfallStations ||
    prevDataRef.current.districts !== districts
  )) {
    prevDataRef.current = { reservoirs, rainfallStations, districts };
    addMarkers(mapRef.current, activeLayer);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6 text-emerald-500" />
              地理資訊視覺化
            </h1>
            <p className="text-muted-foreground">
              灌溉系統設施與水情分布地圖（Google Maps）
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Container */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">互動式地圖</CardTitle>
                <Tabs value={activeLayer} onValueChange={handleLayerChange}>
                  <TabsList>
                    <TabsTrigger value="reservoirs" className="flex items-center gap-1">
                      <Droplets className="w-4 h-4" />
                      水庫
                    </TabsTrigger>
                    <TabsTrigger value="rainfall" className="flex items-center gap-1">
                      <Cloud className="w-4 h-4" />
                      雨量站
                    </TabsTrigger>
                    <TabsTrigger value="districts" className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      灌區
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {/* Google Maps */}
              <div className="relative">
                <GoogleMapView
                  className="w-full h-[500px] rounded-lg overflow-hidden"
                  initialCenter={TAIWAN_CENTER}
                  initialZoom={8}
                  onMapReady={handleMapReady}
                />

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border shadow-lg">
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    圖例
                  </p>
                  {activeLayer === 'reservoirs' && (
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span>充足 (≥70%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span>正常 (40-70%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span>偏低 (&lt;40%)</span>
                      </div>
                    </div>
                  )}
                  {activeLayer === 'rainfall' && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-cyan-500" />
                      <span>雨量監測站</span>
                    </div>
                  )}
                  {activeLayer === 'districts' && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span>灌區管理處</span>
                    </div>
                  )}
                </div>

                {/* Stats Badge */}
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border shadow-lg">
                  <p className="text-xs text-muted-foreground">
                    {activeLayer === 'reservoirs' && `顯示 ${reservoirs?.length || 0} 座水庫`}
                    {activeLayer === 'rainfall' && `顯示 ${rainfallStations?.length || 0} 個雨量站`}
                    {activeLayer === 'districts' && `顯示 ${districts?.length || 0} 個灌區`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">詳細資訊</CardTitle>
              <CardDescription>點擊地圖上的標記查看詳情</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedItem ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${selectedItem.color}20` }}
                    >
                      {selectedItem.type === 'reservoir' && <Droplets className="w-5 h-5" style={{ color: selectedItem.color }} />}
                      {selectedItem.type === 'rainfall' && <Cloud className="w-5 h-5" style={{ color: selectedItem.color }} />}
                      {selectedItem.type === 'district' && <Building2 className="w-5 h-5" style={{ color: selectedItem.color }} />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedItem.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedItem.type === 'reservoir' && '水庫'}
                        {selectedItem.type === 'rainfall' && '雨量站'}
                        {selectedItem.type === 'district' && '灌區'}
                      </p>
                    </div>
                  </div>

                  {selectedItem.type === 'reservoir' && selectedItem.data && (
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">流域</span>
                        <span className="text-sm font-medium">{selectedItem.data.reservoir?.basin || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">縣市</span>
                        <span className="text-sm font-medium">{selectedItem.data.reservoir?.county || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">有效容量</span>
                        <span className="text-sm font-medium">
                          {selectedItem.data.reservoir?.effectiveCapacity 
                            ? `${Number(selectedItem.data.reservoir.effectiveCapacity).toLocaleString()} 萬立方公尺`
                            : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">蓄水率</span>
                        <Badge 
                          variant={selectedItem.percentage >= 70 ? 'default' : selectedItem.percentage >= 40 ? 'secondary' : 'destructive'}
                        >
                          {selectedItem.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                      {selectedItem.data.waterLevel && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">目前水位</span>
                            <span className="text-sm font-medium">
                              {selectedItem.data.waterLevel.waterLevel 
                                ? `${Number(selectedItem.data.waterLevel.waterLevel).toFixed(2)} 公尺`
                                : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">有效蓄水量</span>
                            <span className="text-sm font-medium">
                              {selectedItem.data.waterLevel.effectiveStorage 
                                ? `${Number(selectedItem.data.waterLevel.effectiveStorage).toLocaleString()} 萬立方公尺`
                                : '-'}
                            </span>
                          </div>
                        </>
                      )}
                      {selectedItem.percentage < 40 && (
                        <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg mt-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-red-500">水位偏低，請注意用水</span>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedItem.type === 'rainfall' && selectedItem.data && (
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">站點代碼</span>
                        <span className="text-sm font-medium">{selectedItem.data.stationCode || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">縣市</span>
                        <span className="text-sm font-medium">{selectedItem.data.county || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">鄉鎮</span>
                        <span className="text-sm font-medium">{selectedItem.data.township || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">海拔</span>
                        <span className="text-sm font-medium">
                          {selectedItem.data.elevation ? `${selectedItem.data.elevation} 公尺` : '-'}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedItem.type === 'district' && selectedItem.data && (
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">管理面積</span>
                        <span className="text-sm font-medium">
                          {selectedItem.data.area ? `${Number(selectedItem.data.area).toLocaleString()} 公頃` : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">主要作物</span>
                        <span className="text-sm font-medium">{selectedItem.data.mainCrops || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">水源</span>
                        <span className="text-sm font-medium">{selectedItem.data.waterSource || '-'}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      座標：{selectedItem.lat?.toFixed(4)}, {selectedItem.lng?.toFixed(4)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground">請點擊地圖上的標記</p>
                  <p className="text-sm text-muted-foreground">查看詳細資訊</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reservoirs?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">監測水庫</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rainfallStations?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">雨量監測站</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{districts?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">灌區管理處</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
