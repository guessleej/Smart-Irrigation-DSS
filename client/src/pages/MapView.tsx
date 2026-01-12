import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { MapPin, Droplets, Cloud, Building2, Layers, ZoomIn, ZoomOut, Locate } from "lucide-react";

// 台灣中心點座標
const TAIWAN_CENTER = { lat: 23.5, lng: 121 };

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<string>("reservoirs");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: reservoirs } = trpc.reservoir.getLatestLevels.useQuery();
  const { data: rainfallStations } = trpc.rainfall.listStations.useQuery();
  const { data: districts } = trpc.irrigationDistrict.list.useQuery();
  const { data: facilities } = trpc.facility.list.useQuery();

  const getStorageColor = (percentage: number) => {
    if (percentage >= 70) return '#10b981';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getMarkerData = () => {
    switch (activeLayer) {
      case 'reservoirs':
        return reservoirs?.map(r => ({
          id: r.reservoir?.id,
          name: r.reservoir?.name,
          lat: Number(r.reservoir?.latitude),
          lng: Number(r.reservoir?.longitude),
          type: 'reservoir',
          data: r,
          color: getStorageColor(Number(r.waterLevel?.storagePercentage) || 0)
        })) || [];
      case 'rainfall':
        return rainfallStations?.map(s => ({
          id: s.id,
          name: s.name,
          lat: Number(s.latitude),
          lng: Number(s.longitude),
          type: 'rainfall',
          data: s,
          color: '#06b6d4'
        })) || [];
      case 'districts':
        return districts?.map(d => ({
          id: d.id,
          name: d.name,
          lat: 24 + Math.random() * 2, // 模擬座標
          lng: 120 + Math.random() * 2,
          type: 'district',
          data: d,
          color: '#8b5cf6'
        })) || [];
      default:
        return [];
    }
  };

  const markers = getMarkerData();

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
              灌溉系統設施與水情分布地圖
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Container */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">互動式地圖</CardTitle>
                <Tabs value={activeLayer} onValueChange={setActiveLayer}>
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
              {/* Simulated Map View */}
              <div 
                ref={mapRef}
                className="relative w-full h-[500px] bg-gradient-to-br from-blue-900/20 to-emerald-900/20 rounded-lg overflow-hidden border"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
              >
                {/* Taiwan Outline (Simplified SVG) */}
                <svg 
                  viewBox="0 0 400 600" 
                  className="absolute inset-0 w-full h-full opacity-30"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    d="M200 50 Q280 100 300 200 Q320 350 280 450 Q240 530 200 550 Q160 530 120 450 Q80 350 100 200 Q120 100 200 50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-emerald-500/50"
                  />
                </svg>

                {/* Markers */}
                {markers.map((marker, index) => {
                  // 將經緯度轉換為相對位置（簡化版）
                  const x = ((marker.lng - 119) / 4) * 100;
                  const y = ((26 - marker.lat) / 5) * 100;
                  
                  return (
                    <button
                      key={marker.id || index}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 z-10"
                      style={{ 
                        left: `${Math.max(5, Math.min(95, x))}%`, 
                        top: `${Math.max(5, Math.min(95, y))}%` 
                      }}
                      onClick={() => setSelectedItem(marker)}
                    >
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"
                        style={{ backgroundColor: marker.color }}
                      />
                    </button>
                  );
                })}

                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button size="icon" variant="secondary" className="w-8 h-8">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="w-8 h-8">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="w-8 h-8">
                    <Locate className="w-4 h-4" />
                  </Button>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
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

                {/* No Data Message */}
                {markers.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-muted-foreground">尚無資料點</p>
                      <p className="text-sm text-muted-foreground">請先初始化示範資料</p>
                    </div>
                  </div>
                )}
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
                        <span className="text-sm font-medium">{selectedItem.data.reservoir?.basin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">縣市</span>
                        <span className="text-sm font-medium">{selectedItem.data.reservoir?.county}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">蓄水率</span>
                        <Badge variant={Number(selectedItem.data.waterLevel?.storagePercentage) >= 70 ? 'default' : Number(selectedItem.data.waterLevel?.storagePercentage) >= 40 ? 'secondary' : 'destructive'}>
                          {Number(selectedItem.data.waterLevel?.storagePercentage).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">水位</span>
                        <span className="text-sm font-medium">{Number(selectedItem.data.waterLevel?.waterLevel).toFixed(2)} m</span>
                      </div>
                    </div>
                  )}

                  {selectedItem.type === 'rainfall' && selectedItem.data && (
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">縣市</span>
                        <span className="text-sm font-medium">{selectedItem.data.county}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">鄉鎮</span>
                        <span className="text-sm font-medium">{selectedItem.data.township}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">海拔</span>
                        <span className="text-sm font-medium">{selectedItem.data.altitude} m</span>
                      </div>
                    </div>
                  )}

                  {selectedItem.type === 'district' && selectedItem.data && (
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">縣市</span>
                        <span className="text-sm font-medium">{selectedItem.data.county}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">面積</span>
                        <span className="text-sm font-medium">{Number(selectedItem.data.area).toLocaleString()} 公頃</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">灌溉面積</span>
                        <span className="text-sm font-medium">{Number(selectedItem.data.irrigatedArea).toLocaleString()} 公頃</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">主要作物</span>
                        <span className="text-sm font-medium">{selectedItem.data.mainCrops}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">點擊地圖標記</p>
                  <p className="text-sm text-muted-foreground">查看詳細資訊</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                水庫監測點
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reservoirs?.length || 0}</div>
              <p className="text-xs text-muted-foreground">座水庫</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Cloud className="w-4 h-4 text-cyan-500" />
                雨量監測站
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rainfallStations?.length || 0}</div>
              <p className="text-xs text-muted-foreground">個站點</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-500" />
                灌區管理處
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{districts?.length || 0}</div>
              <p className="text-xs text-muted-foreground">個單位</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
