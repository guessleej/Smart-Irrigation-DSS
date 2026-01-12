import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Droplets, MapPin, TrendingUp, TrendingDown, Minus, RefreshCw, Database, Wifi, WifiOff, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Reservoirs() {
  const [activeTab, setActiveTab] = useState("realtime");
  
  // 資料庫中的水庫資料
  const { data: reservoirs, isLoading } = trpc.reservoir.list.useQuery();
  const { data: waterLevels, isLoading: levelsLoading, refetch: refetchLevels } = trpc.reservoir.getLatestLevels.useQuery();
  
  // 即時 API 資料
  const { data: realtimeData, isLoading: realtimeLoading, refetch: refetchRealtime } = trpc.reservoir.getRealtimeData.useQuery();
  const { data: majorReservoirs, isLoading: majorLoading } = trpc.reservoir.getMajorReservoirs.useQuery();
  const { data: feitsuiData, isLoading: feitsuiLoading } = trpc.reservoir.getFeitsuiRealtime.useQuery();

  const getStorageStatus = (percentage: number) => {
    if (percentage >= 70) return { color: 'text-emerald-500', bgColor: 'bg-emerald-500', icon: TrendingUp, label: '充足', variant: 'default' as const };
    if (percentage >= 40) return { color: 'text-amber-500', bgColor: 'bg-amber-500', icon: Minus, label: '正常', variant: 'secondary' as const };
    if (percentage >= 20) return { color: 'text-orange-500', bgColor: 'bg-orange-500', icon: TrendingDown, label: '偏低', variant: 'secondary' as const };
    return { color: 'text-red-500', bgColor: 'bg-red-500', icon: TrendingDown, label: '嚴重不足', variant: 'destructive' as const };
  };

  const handleRefresh = () => {
    refetchRealtime();
    refetchLevels();
    toast.success("資料已重新整理");
  };

  const loading = isLoading || levelsLoading;
  const realtimeReservoirs = realtimeData?.data || [];

  // 計算即時統計
  const realtimeStats = {
    total: realtimeReservoirs.length,
    avgStorage: realtimeReservoirs.length > 0 
      ? (realtimeReservoirs.reduce((sum: number, r: any) => sum + parseFloat(r.storagePercentage || '0'), 0) / realtimeReservoirs.length).toFixed(1)
      : '0',
    warning: realtimeReservoirs.filter((r: any) => parseFloat(r.storagePercentage || '0') < 40).length,
    critical: realtimeReservoirs.filter((r: any) => parseFloat(r.storagePercentage || '0') < 20).length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Droplets className="w-6 h-6 text-blue-500" />
              水庫即時監測
            </h1>
            <p className="text-muted-foreground">
              全台主要水庫即時水位、蓄水量及進出水量資訊
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            重新整理
          </Button>
        </div>

        {/* Data Source Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              即時 API 資料
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              資料庫資料
            </TabsTrigger>
          </TabsList>

          {/* 即時 API 資料 */}
          <TabsContent value="realtime" className="space-y-6">
            {/* API 狀態指示 */}
            <div className="flex items-center gap-2 text-sm">
              {realtimeData?.source === 'wra_opendata' ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">已連接水利署開放資料平台</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">API 連線異常</span>
                </>
              )}
              {realtimeData?.lastUpdated && (
                <span className="text-muted-foreground">
                  · 更新時間：{new Date(realtimeData.lastUpdated).toLocaleString('zh-TW')}
                </span>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">監測水庫</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{realtimeStats.total}</div>
                  <p className="text-xs text-muted-foreground">座水庫</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">平均蓄水率</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{realtimeStats.avgStorage}%</div>
                  <p className="text-xs text-muted-foreground">全台平均</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">警戒水庫</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-500">{realtimeStats.warning}</div>
                  <p className="text-xs text-muted-foreground">蓄水率 &lt; 40%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">嚴重警戒</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">{realtimeStats.critical}</div>
                  <p className="text-xs text-muted-foreground">蓄水率 &lt; 20%</p>
                </CardContent>
              </Card>
            </div>

            {/* 翡翠水庫特別顯示 */}
            {feitsuiData?.data && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    翡翠水庫即時水情
                    <Badge variant="outline" className="ml-2">專線 API</Badge>
                  </CardTitle>
                  <CardDescription>
                    台北翡翠水庫管理局即時資料
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">水位</p>
                      <p className="text-2xl font-bold">{feitsuiData.data.waterLevel || '-'} m</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">有效蓄水量</p>
                      <p className="text-2xl font-bold">{feitsuiData.data.effectiveStorage || '-'} 萬噸</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">蓄水率</p>
                      <p className="text-2xl font-bold text-blue-600">{feitsuiData.data.storagePercentage || '-'}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">集水區雨量</p>
                      <p className="text-2xl font-bold">{feitsuiData.data.basinRainfall || '-'} mm</p>
                    </div>
                  </div>
                  {feitsuiData.data.recordTime && (
                    <p className="text-xs text-muted-foreground mt-4">
                      資料時間：{feitsuiData.data.recordTime}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reservoir Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {realtimeLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-5 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : realtimeReservoirs.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <WifiOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>無法取得即時資料，請稍後再試</p>
                  </CardContent>
                </Card>
              ) : (
                realtimeReservoirs.map((reservoir: any) => {
                  const percentage = parseFloat(reservoir.storagePercentage || '0');
                  const status = getStorageStatus(percentage);
                  const StatusIcon = status.icon;

                  return (
                    <Card key={reservoir.stationId} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{reservoir.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {reservoir.county} · {reservoir.basin}
                            </CardDescription>
                          </div>
                          <Badge variant={status.variant} className="flex items-center gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Storage Progress */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>蓄水率</span>
                            <span className={status.color}>{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-muted-foreground text-xs">水位</p>
                            <p className="font-medium">{parseFloat(reservoir.waterLevel || '0').toFixed(2)} m</p>
                          </div>
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-muted-foreground text-xs">有效蓄水量</p>
                            <p className="font-medium">{parseFloat(reservoir.effectiveStorage || '0').toFixed(0)} 萬噸</p>
                          </div>
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-muted-foreground text-xs flex items-center gap-1">
                              <ArrowUpRight className="w-3 h-3 text-green-500" />
                              進水量
                            </p>
                            <p className="font-medium">{parseFloat(reservoir.inflow || '0').toFixed(2)} m³/s</p>
                          </div>
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-muted-foreground text-xs flex items-center gap-1">
                              <ArrowDownRight className="w-3 h-3 text-blue-500" />
                              出水量
                            </p>
                            <p className="font-medium">{parseFloat(reservoir.outflow || '0').toFixed(2)} m³/s</p>
                          </div>
                        </div>

                        {/* Record Time */}
                        {reservoir.recordTime && (
                          <p className="text-xs text-muted-foreground">
                            更新：{new Date(reservoir.recordTime).toLocaleString('zh-TW')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* 資料庫資料 */}
          <TabsContent value="database" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">總監測水庫</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{reservoirs?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">座水庫</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">平均蓄水率</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {waterLevels && waterLevels.length > 0
                      ? (waterLevels.reduce((sum, w) => sum + Number(w.waterLevel?.storagePercentage || 0), 0) / waterLevels.length).toFixed(1)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">全台平均</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">警戒水庫</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-500">
                    {waterLevels?.filter(w => Number(w.waterLevel?.storagePercentage || 0) < 40).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">蓄水率低於 40%</p>
                </CardContent>
              </Card>
            </div>

            {/* Reservoir Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-5 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : waterLevels && waterLevels.length > 0 ? (
                waterLevels.map((item) => {
                  const percentage = Number(item.waterLevel?.storagePercentage || 0);
                  const status = getStorageStatus(percentage);
                  const StatusIcon = status.icon;

                  return (
                    <Card key={item.reservoir.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{item.reservoir.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.reservoir.county} · {item.reservoir.basin}
                            </CardDescription>
                          </div>
                          <Badge variant={status.variant} className="flex items-center gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>蓄水率</span>
                            <span className={status.color}>{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-muted-foreground text-xs">水位</p>
                            <p className="font-medium">{item.waterLevel?.waterLevel || '-'} m</p>
                          </div>
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-muted-foreground text-xs">有效蓄水量</p>
                            <p className="font-medium">{item.waterLevel?.effectiveStorage || '-'} 萬噸</p>
                          </div>
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-muted-foreground text-xs">進水量</p>
                            <p className="font-medium">{item.waterLevel?.inflow || '-'} m³/s</p>
                          </div>
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-muted-foreground text-xs">出水量</p>
                            <p className="font-medium">{item.waterLevel?.outflow || '-'} m³/s</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="col-span-full">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>尚無水庫資料，請先初始化示範資料</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
