import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Droplets, Cloud, MapPin, AlertTriangle, Activity, 
  RefreshCw, TrendingUp, TrendingDown, Minus,
  Database, Waves, Building2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery();
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = trpc.dashboard.getOverview.useQuery();
  const { data: reservoirLevels, isLoading: reservoirLoading } = trpc.reservoir.getLatestLevels.useQuery();
  const { data: riskAssessments, isLoading: riskLoading } = trpc.riskAssessment.getLatest.useQuery();

  const seedAllMutation = trpc.sync.initializeDemo.useMutation({
    onSuccess: (data: any) => {
      toast.success(`資料初始化完成：水庫 ${data.results.reservoirs} 筆、雨量站 ${data.results.rainfallStations} 筆、灌區 ${data.results.irrigationDistricts} 筆`);
      refetchOverview();
    },
    onError: (error) => {
      toast.error(`初始化失敗：${error.message}`);
    }
  });

  const handleInitializeData = async () => {
    setIsInitializing(true);
    try {
      await seedAllMutation.mutateAsync();
    } finally {
      setIsInitializing(false);
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'moderate': return 'secondary';
      default: return 'outline';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return '嚴重';
      case 'high': return '高風險';
      case 'moderate': return '中等';
      default: return '低風險';
    }
  };

  const getStorageStatus = (percentage: number) => {
    if (percentage >= 70) return { color: 'text-emerald-500', icon: TrendingUp, label: '充足' };
    if (percentage >= 40) return { color: 'text-amber-500', icon: Minus, label: '正常' };
    return { color: 'text-red-500', icon: TrendingDown, label: '偏低' };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">決策儀表板</h1>
            <p className="text-muted-foreground">
              即時水情監測與風險評估總覽
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button 
              onClick={handleInitializeData} 
              disabled={isInitializing}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isInitializing ? 'animate-spin' : ''}`} />
              {isInitializing ? '初始化中...' : '初始化示範資料'}
            </Button>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">水庫數量</CardTitle>
              <Database className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.reservoirs || 0}</div>
              <p className="text-xs text-muted-foreground">座主要水庫</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">雨量站</CardTitle>
              <Cloud className="w-4 h-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.rainfallStations || 0}</div>
              <p className="text-xs text-muted-foreground">個監測站點</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">灌區管理處</CardTitle>
              <Building2 className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.irrigationDistricts || 0}</div>
              <p className="text-xs text-muted-foreground">個管理單位</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">平均蓄水率</CardTitle>
              <Waves className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.avgStoragePercentage || 0}%</div>
              <p className="text-xs text-muted-foreground">全台水庫平均</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reservoir Status */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                水庫蓄水狀況
              </CardTitle>
              <CardDescription>各主要水庫即時蓄水率</CardDescription>
            </CardHeader>
            <CardContent>
              {reservoirLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-2 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : reservoirLevels && reservoirLevels.length > 0 ? (
                <div className="space-y-4">
                  {reservoirLevels.slice(0, 6).map((item, index) => {
                    const percentage = Number(item.waterLevel?.storagePercentage) || 0;
                    const status = getStorageStatus(percentage);
                    const StatusIcon = status.icon;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.reservoir?.name}</span>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${status.color}`} />
                            <span className={`text-sm font-semibold ${status.color}`}>
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Droplets className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>尚無水庫資料</p>
                  <p className="text-sm">請先初始化示範資料</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                缺水風險評估
              </CardTitle>
              <CardDescription>各灌區最新風險等級</CardDescription>
            </CardHeader>
            <CardContent>
              {riskLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : riskAssessments && riskAssessments.length > 0 ? (
                <div className="space-y-3">
                  {riskAssessments.slice(0, 6).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div>
                        <p className="font-medium">{item.district?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          供需比: {Number(item.assessment?.supplyDemandRatio).toFixed(2)}
                        </p>
                      </div>
                      <Badge variant={getRiskBadgeVariant(item.assessment?.riskLevel || 'low')}>
                        {getRiskLabel(item.assessment?.riskLevel || 'low')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>尚無風險評估資料</p>
                  <p className="text-sm">請先初始化示範資料</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Risk Distribution */}
        {overview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                風險分布統計
              </CardTitle>
              <CardDescription>各風險等級灌區數量分布</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-2xl font-bold text-emerald-500">{overview.riskDistribution.low}</div>
                  <div className="text-sm text-muted-foreground">低風險</div>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="text-2xl font-bold text-amber-500">{overview.riskDistribution.moderate}</div>
                  <div className="text-sm text-muted-foreground">中等風險</div>
                </div>
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="text-2xl font-bold text-orange-500">{overview.riskDistribution.high}</div>
                  <div className="text-sm text-muted-foreground">高風險</div>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-2xl font-bold text-red-500">{overview.riskDistribution.critical}</div>
                  <div className="text-sm text-muted-foreground">嚴重</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
