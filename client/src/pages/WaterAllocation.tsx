import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Activity, Play, History, AlertCircle, CheckCircle2, Droplets, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function WaterAllocation() {
  const { user } = useAuth();
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [scenarioName, setScenarioName] = useState("");
  const [waterAvailable, setWaterAvailable] = useState("");
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const { data: districts } = trpc.irrigationDistrict.list.useQuery();
  const { data: simulations, refetch: refetchSimulations } = trpc.waterAllocation.getSimulations.useQuery(
    { districtId: Number(selectedDistrict), limit: 5 },
    { enabled: !!selectedDistrict }
  );

  const deleteSimulationMutation = trpc.waterAllocation.deleteSimulation.useMutation({
    onSuccess: () => {
      toast.success("已刪除模擬記錄");
      refetchSimulations();
    },
    onError: (error) => {
      toast.error(`刪除失敗：${error.message}`);
    }
  });

  const handleDeleteSimulation = (id: number) => {
    deleteSimulationMutation.mutate({ id });
  };

  const runSimulationMutation = trpc.waterAllocation.runSimulation.useMutation({
    onSuccess: (data) => {
      toast.success("模擬完成");
      setSimulationResult(data);
      refetchSimulations();
    },
    onError: (error) => {
      toast.error(`模擬失敗：${error.message}`);
    }
  });

  const handleRunSimulation = () => {
    if (!selectedDistrict || !scenarioName || !waterAvailable) {
      toast.error("請填寫所有必要欄位");
      return;
    }

    runSimulationMutation.mutate({
      districtId: Number(selectedDistrict),
      scenarioName,
      parameters: {
        totalWaterAvailable: Number(waterAvailable)
      }
    });
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { color: 'text-red-500', bgColor: 'bg-red-500/10', label: '緊急限水', variant: 'destructive' as const };
      case 'restricted':
        return { color: 'text-amber-500', bgColor: 'bg-amber-500/10', label: '限制供水', variant: 'secondary' as const };
      default:
        return { color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', label: '正常供水', variant: 'outline' as const };
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-500" />
            動態配水模擬
          </h1>
          <p className="text-muted-foreground">
            模擬不同情境下的配水策略，支援灌溉決策規劃
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulation Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">模擬參數設定</CardTitle>
              <CardDescription>設定配水模擬的基本參數</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="district">選擇灌區</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇灌區" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts?.map((district) => (
                      <SelectItem key={district.id} value={String(district.id)}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scenario">情境名稱</Label>
                <Input
                  id="scenario"
                  placeholder="例：乾旱情境模擬"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="water">可用水量（萬噸）</Label>
                <Input
                  id="water"
                  type="number"
                  placeholder="例：5000"
                  value={waterAvailable}
                  onChange={(e) => setWaterAvailable(e.target.value)}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleRunSimulation}
                disabled={runSimulationMutation.isPending || !user}
              >
                <Play className="w-4 h-4 mr-2" />
                {runSimulationMutation.isPending ? '模擬中...' : '執行模擬'}
              </Button>

              {!user && (
                <p className="text-xs text-muted-foreground text-center">
                  請先登入以執行模擬
                </p>
              )}
            </CardContent>
          </Card>

          {/* Simulation Result */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">模擬結果</CardTitle>
              <CardDescription>配水策略分析與建議</CardDescription>
            </CardHeader>
            <CardContent>
              {simulationResult ? (
                <div className="space-y-6">
                  {/* Result Summary */}
                  <div className={`p-4 rounded-lg ${getPriorityConfig(simulationResult.allocationPlan.priority).bgColor}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">配水策略</h3>
                      <Badge variant={getPriorityConfig(simulationResult.allocationPlan.priority).variant}>
                        {getPriorityConfig(simulationResult.allocationPlan.priority).label}
                      </Badge>
                    </div>
                    
                    {/* Allocation Ratio */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>配水比例</span>
                        <span className="font-bold">
                          {(Number(simulationResult.allocationPlan.allocationRatio) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={Number(simulationResult.allocationPlan.allocationRatio) * 100} 
                        className="h-3"
                      />
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">可用水量</p>
                        <p className="text-lg font-bold">
                          {Number(simulationResult.allocationPlan.totalAvailable).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">萬噸</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">需水量</p>
                        <p className="text-lg font-bold">
                          {Number(simulationResult.allocationPlan.totalDemand).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">萬噸</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">配水量</p>
                        <p className="text-lg font-bold text-emerald-500">
                          {Number(simulationResult.allocationPlan.allocatedAmount).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">萬噸</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">缺水量</p>
                        <p className="text-lg font-bold text-red-500">
                          {Number(simulationResult.allocationPlan.deficit).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">萬噸</p>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">建議措施</h4>
                    {Number(simulationResult.allocationPlan.allocationRatio) < 0.7 ? (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-500">緊急限水措施</p>
                          <p className="text-sm text-muted-foreground">
                            建議立即啟動抗旱應變機制，優先保障民生用水，農業用水實施輪灌或停灌措施。
                          </p>
                        </div>
                      </div>
                    ) : Number(simulationResult.allocationPlan.allocationRatio) < 0.9 ? (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-500">限制供水措施</p>
                          <p className="text-sm text-muted-foreground">
                            建議加強水源調度，實施分區輪灌，並準備備用水源以因應後續可能的缺水情況。
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-emerald-500">正常供水</p>
                          <p className="text-sm text-muted-foreground">
                            水資源供應充足，可維持正常灌溉作業，建議持續監控水情變化。
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">尚無模擬結果</h3>
                  <p className="text-muted-foreground">設定參數後執行模擬以查看結果</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* History */}
        {selectedDistrict && simulations && simulations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                歷史模擬記錄
              </CardTitle>
              <CardDescription>該灌區最近的配水模擬記錄</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {simulations.map((sim, index) => {
                  const plan = typeof sim.allocationPlan === 'string' 
                    ? JSON.parse(sim.allocationPlan) 
                    : sim.allocationPlan;
                  const priorityConfig = getPriorityConfig(plan?.priority || 'normal');
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <Droplets className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium">{sim.scenarioName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sim.simulationDate).toLocaleString('zh-TW')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {Number(sim.totalWaterAvailable).toLocaleString()} / {Number(sim.totalWaterDemand).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">可用/需求（萬噸）</p>
                        </div>
                        <Badge variant={priorityConfig.variant}>
                          {priorityConfig.label}
                        </Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-red-500"
                              disabled={!user}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>確認刪除</AlertDialogTitle>
                              <AlertDialogDescription>
                                您確定要刪除「{sim.scenarioName}」這筆模擬記錄嗎？此操作無法復原。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSimulation(sim.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                刪除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
