import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Droplets, Cloud, MapPin, BarChart3, AlertTriangle, Activity, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  const features = [
    {
      icon: Droplets,
      title: "水庫即時監測",
      description: "整合全台主要水庫即時水位、蓄水量及進出水量資訊",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Cloud,
      title: "氣象資料整合",
      description: "串接農業氣象與雨量站資料，提供降雨情勢分析",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    },
    {
      icon: MapPin,
      title: "3D GIS 視覺化",
      description: "三維地理資訊系統展示灌溉設施與水情分布",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      icon: AlertTriangle,
      title: "風險評估模型",
      description: "灌溉缺水風險評估，結合水資源供需模擬分析",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    {
      icon: Activity,
      title: "動態配水模擬",
      description: "模擬不同情境下的配水策略，支援決策規劃",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: BarChart3,
      title: "決策儀表板",
      description: "整合各項資訊的視覺化儀表板，快速掌握水情",
      color: "text-rose-500",
      bgColor: "bg-rose-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">農業水資源智慧決策支援系統</h1>
              <p className="text-xs text-white/60">Agricultural Water Resource Decision Support System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-white/80">歡迎，{user?.name || '使用者'}</span>
                <Link href="/dashboard">
                  <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
                    進入系統
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
                  登入系統
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDI0MzgiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2di00aC00djRoNHptMC02di00aC00djRoNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              智慧灌溉
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {" "}決策支援
              </span>
            </h2>
            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              整合農業資料開放平臺與水利署防災資訊服務網，提供即時水情監測、
              風險評估與配水模擬功能，協助灌溉管理者做出最佳決策。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25">
                  開始使用
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/map">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  查看地圖
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative">
        <div className="container">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-3">系統功能</h3>
            <p className="text-white/60">全方位的農業水資源管理解決方案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-white/60">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-white/10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "8+", label: "主要水庫" },
              { value: "6+", label: "雨量監測站" },
              { value: "8+", label: "灌區管理處" },
              { value: "24/7", label: "即時監測" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              <span className="text-white/60 text-sm">農業水資源智慧決策支援系統</span>
            </div>
            <div className="text-white/40 text-sm">
              © 2025 農業部農田水利署. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
