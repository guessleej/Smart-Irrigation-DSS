import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Reservoirs from "./pages/Reservoirs";
import RiskAssessment from "./pages/RiskAssessment";
import WaterAllocation from "./pages/WaterAllocation";
import MapView from "./pages/MapView";
import IrrigationDistricts from "./pages/IrrigationDistricts";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/reservoirs" component={Reservoirs} />
      <Route path="/risk" component={RiskAssessment} />
      <Route path="/allocation" component={WaterAllocation} />
      <Route path="/map" component={MapView} />
      <Route path="/districts" component={IrrigationDistricts} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
