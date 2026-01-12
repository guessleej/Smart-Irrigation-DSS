import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, RefreshCw, TrendingUp, TrendingDown, Droplets, Thermometer } from "lucide-react";
import { toast } from "sonner";

export default function RiskAssessment() {
  const { user } = useAuth();
  const { data: assessments, isLoading, refetch } = trpc.riskAssessment.getLatest.useQuery();
  const { data: districts } = trpc.irrigationDistrict.list.useQuery();

  const calculateAllMutation = trpc.riskAssessment.calculateAll.useMutation({
    onSuccess: (data) => {
      toast.success(`已完成 ${data.count} 個灌區的風險評估`);
      refetch();
    },
    onError: (error) => {
      toast.error(`評估失敗：${error.message}`);
    }
  });

  const getRiskConfig = (level: string) => {
    switch (level) {
      case 'critical':
        return { 
          color: 'text-red-500', 
          bgColor: 'bg-red-500/10', 
          borderColor: 'border-red-500/30',
          label: '嚴重', 
          variant: 'destructive' as const,
          description: '建議立即啟動抗旱應變措施'
        };
      case 'high':
        return { 
          color: 'text-orange-500', 
          bgColor: 'bg-orange-500/10', 
          borderColor: 'border-orange-500/30',
          label: '高風險', 
          variant: 'destructive' as const,
          description: '建議加強水源調度'
        };
      case 'moderate':
        return { 
          color: 'text-amber-500', 
          bgColor: 'bg-amber-500/10', 
          borderColor: 'border-amber-500/30',
          label: '中等', 
          variant: 'secondary' as const,
          description: '持續監控水情變化'
        };
      default:
        return { 
          color: 'text-emerald-500', 
          bgColor: 'bg-emerald-500/10', 
          borderColor: 'border-emerald-500/30',
          label: '低風險', 
          variant: 'outline' as const,
          description: '維持正常灌溉作業'
        };
    }
  };

  const riskStats = {
    critical: assessments?.filter(a => a.assessment?.riskLevel === 'critical').length || 0,
    high: assessments?.filter(a => a.assessment?.riskLevel === 'high').length || 0,
    moderate: assessments?.filter(a => a.assessment?.riskLevel === 'moderate').length || 0,
    low: assessments?.filter(a => a.assessment?.riskLevel === 'low').length || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              缺水風險評估
            </h1>
            <p className="text-muted-foreground">
              各灌區缺水風險等級與供需分析
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button 
              onClick={() => calculateAllMutation.mutate()}
              disabled={calculateAllMutation.isPending}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${calculateAllMutation.isPending ? 'animate-spin' : ''}`} />
              重新評估全部
            </Button>
          )}
        </div>

        {/* Risk Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600">低風險</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-500">{riskStats.low}</div>
              <p className="text-xs text-muted-foreground">個灌區</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-600">中等風險</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{riskStats.moderate}</div>
              <p className="text-xs text-muted-foreground">個灌區</p>
            </CardContent>
          </Card>
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">高風險</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{riskStats.high}</div>
              <p className="text-xs text-muted-foreground">個灌區</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">嚴重</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{riskStats.critical}</div>
              <p className="text-xs text-muted-foreground">個灌區</p>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : assessments && assessments.length > 0 ? (
            assessments.map((item, index) => {
              const riskConfig = getRiskConfig(item.assessment?.riskLevel || 'low');
              const supplyDemandRatio = Number(item.assessment?.supplyDemandRatio) || 0;
              const riskScore = Number(item.assessment?.riskScore) || 0;
              const reservoirStorage = Number(item.assessment?.reservoirStorage) || 0;
              
              return (
                <Card key={index} className={`${riskConfig.bgColor} ${riskConfig.borderColor} border`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{item.district?.name}</CardTitle>
                        <CardDescription>{item.district?.county}</CardDescription>
                      </div>
                      <Badge variant={riskConfig.variant} className="text-sm">
                        {riskConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Risk Score */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">風險指數</span>
                        <span className={`font-bold ${riskConfig.color}`}>{riskScore.toFixed(1)}</span>
                      </div>
                      <Progress value={riskScore} className="h-2" />
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          供需比
                        </p>
                        <p className={`text-sm font-semibold ${supplyDemandRatio < 0.8 ? 'text-red-500' : supplyDemandRatio < 1 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {supplyDemandRatio.toFixed(2)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Droplets className="w-3 h-3" />
                          水庫蓄水
                        </p>
                        <p className="text-sm font-semibold">{reservoirStorage.toFixed(1)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">供水量</p>
                        <p className="text-sm font-semibold">
                          {Number(item.assessment?.waterSupply).toFixed(0)} 萬噸
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">需水量</p>
                        <p className="text-sm font-semibold">
                          {Number(item.assessment?.waterDemand).toFixed(0)} 萬噸
                        </p>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">建議措施</p>
                      <p className="text-sm">{item.assessment?.recommendations || riskConfig.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">尚無風險評估資料</h3>
                <p className="text-muted-foreground mb-4">請先在儀表板初始化示範資料</p>
                {user?.role === 'admin' && (
                  <Button onClick={() => calculateAllMutation.mutate()} disabled={calculateAllMutation.isPending}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${calculateAllMutation.isPending ? 'animate-spin' : ''}`} />
                    執行風險評估
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
