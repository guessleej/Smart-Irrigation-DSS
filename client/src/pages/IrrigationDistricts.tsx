import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Building2, MapPin, Droplets, Wheat, Users } from "lucide-react";

export default function IrrigationDistricts() {
  const { data: districts, isLoading } = trpc.irrigationDistrict.list.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-500" />
            灌區管理
          </h1>
          <p className="text-muted-foreground">
            全台灌區管理處基本資訊與灌溉面積統計
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">灌區總數</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{districts?.length || 0}</div>
              <p className="text-xs text-muted-foreground">個管理處</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">總面積</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {districts?.reduce((sum, d) => sum + Number(d.area || 0), 0).toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">公頃</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">灌溉面積</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {districts?.reduce((sum, d) => sum + Number(d.irrigatedArea || 0), 0).toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">公頃</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">平均灌溉率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {districts && districts.length > 0
                  ? ((districts.reduce((sum, d) => sum + Number(d.irrigatedArea || 0), 0) / 
                      districts.reduce((sum, d) => sum + Number(d.area || 0), 0)) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">灌溉面積/總面積</p>
            </CardContent>
          </Card>
        </div>

        {/* District Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
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
          ) : districts && districts.length > 0 ? (
            districts.map((district) => {
              const irrigationRate = Number(district.area) > 0 
                ? (Number(district.irrigatedArea) / Number(district.area)) * 100 
                : 0;
              
              return (
                <Card key={district.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{district.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {district.county}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{district.code}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Area Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">總面積</p>
                        <p className="text-sm font-semibold">
                          {Number(district.area).toLocaleString()} 公頃
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">灌溉面積</p>
                        <p className="text-sm font-semibold">
                          {Number(district.irrigatedArea).toLocaleString()} 公頃
                        </p>
                      </div>
                    </div>

                    {/* Irrigation Rate */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Droplets className="w-3 h-3" />
                          灌溉率
                        </span>
                        <span className="font-semibold">{irrigationRate.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${Math.min(irrigationRate, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Main Crops */}
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Wheat className="w-3 h-3" />
                        主要作物
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {district.mainCrops?.split('、').map((crop, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {crop}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Management Office */}
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        管理單位
                      </p>
                      <p className="text-sm">{district.managementOffice}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">尚無灌區資料</h3>
                <p className="text-muted-foreground">請先在儀表板初始化示範資料</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
