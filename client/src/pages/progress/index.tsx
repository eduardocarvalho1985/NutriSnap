import { useState, useEffect } from "react";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { getWeightLogs, getFoodLogs } from "@/lib/firebase";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addWeightLog } from "@/lib/firebase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from "recharts";
import { SlidersHorizontal, TrendingDown } from "lucide-react";
import { useLocation } from 'wouter';

type TimeRange = "7days" | "30days" | "3months";

export default function Progress() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("7days");
  const [newWeight, setNewWeight] = useState("");
  const { toast } = useToast();
	const [, setLocation] = useLocation();

  // Get date range based on selected time range
  const getDateRange = () => {
    const endDate = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "30days":
        startDate = subDays(endDate, 30);
        break;
      case "3months":
        startDate = subDays(endDate, 90);
        break;
      default:
        startDate = subDays(endDate, 7);
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Generate array of dates in the range
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  // Query weight logs
  const { data: weightLogs = [], refetch: refetchWeightLogs } = useQuery({
    queryKey: ["/api/weight-logs", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      return getWeightLogs(user.uid, 90); // Get up to 90 days of weight logs
    },
    enabled: !!user?.uid
  });

  // Query food logs for each day in the range
  const { data: foodLogsData } = useQuery({
    queryKey: ["/api/food-logs-range", user?.uid, timeRange],
    queryFn: async () => {
      if (!user?.uid) return [];

      const promises = dateRange.map(date => {
        const formattedDate = format(date, "yyyy-MM-dd");
        return getFoodLogs(user.uid, formattedDate).then(logs => ({
          date: formattedDate,
          logs
        }));
      });

      return Promise.all(promises);
    },
    enabled: !!user?.uid
  });

  // Process food logs data for chart
  const caloriesChartData = foodLogsData?.map(dayData => {
    const totalCalories = dayData.logs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const targetCalories = user?.calories || 2000;

    return {
      date: format(new Date(dayData.date), "EEE", { locale: ptBR }),
      fullDate: dayData.date,
      consumed: totalCalories,
      target: targetCalories,
      metGoal: totalCalories <= targetCalories
    };
  }) || [];

  // Process weight logs data for chart
  const weightChartData = dateRange.map(date => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const weightLog = weightLogs.find(log => log.date === formattedDate);

    return {
      date: format(date, "dd MMM", { locale: ptBR }),
      fullDate: formattedDate,
      weight: weightLog?.weight || null
    };
  }).filter(item => item.weight !== null);

  // Calculate stats
  const daysInRange = caloriesChartData.length;
  const daysOnTarget = caloriesChartData.filter(day => day.metGoal).length;
  const averageCalories = caloriesChartData.length > 0
    ? Math.round(caloriesChartData.reduce((sum, day) => sum + day.consumed, 0) / caloriesChartData.length)
    : 0;

  // Get most recent weight
  const sortedWeightLogs = [...weightLogs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const latestWeight = sortedWeightLogs.length > 0 ? sortedWeightLogs[0].weight : null;

  // Calculate weight change
  const oldestWeightInRange = weightLogs.find(log => 
    new Date(log.date) >= startDate
  );

  const weightChange = latestWeight && oldestWeightInRange 
    ? (latestWeight - oldestWeightInRange.weight).toFixed(1)
    : null;

  const weightChangeDirection = weightChange !== null
    ? parseFloat(weightChange) > 0 
      ? "up" 
      : parseFloat(weightChange) < 0 
        ? "down" 
        : "same"
    : null;

  async function handleUpdateWeight() {
    if (!user?.uid || !newWeight.trim()) return;

    try {
      const weight = parseFloat(newWeight);
      if (isNaN(weight) || weight <= 0) {
        throw new Error("Peso inválido");
      }

      await addWeightLog(user.uid, format(new Date(), "yyyy-MM-dd"), weight);
      toast({
        title: "Peso atualizado",
        description: "Seu peso foi atualizado com sucesso."
      });

      setNewWeight("");
      refetchWeightLogs();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar peso",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  return (
    <div className="app-container min-h-screen flex flex-col bg-neutral-light pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold font-heading text-secondary">Progresso</h1>
          <button className="p-1 rounded-full hover:bg-gray-100">
            <SlidersHorizontal className="h-6 w-6 text-gray-500" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-20">
        {/* Time selector tabs */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex rounded-md shadow-sm bg-gray-100" role="group">
            <Button
              variant={timeRange === "7days" ? "default" : "ghost"}
              className={`px-4 py-2 text-sm font-medium ${timeRange === "7days" ? "bg-primary text-white" : "text-gray-700"} rounded-l-md`}
              onClick={() => setTimeRange("7days")}
            >
              7 Dias
            </Button>
            <Button
              variant={timeRange === "30days" ? "default" : "ghost"}
              className={`px-4 py-2 text-sm font-medium ${timeRange === "30days" ? "bg-primary text-white" : "text-gray-700"}`}
              onClick={() => setTimeRange("30days")}
            >
              30 Dias
            </Button>
            <Button
              variant={timeRange === "3months" ? "default" : "ghost"}
              className={`px-4 py-2 text-sm font-medium ${timeRange === "3months" ? "bg-primary text-white" : "text-gray-700"} rounded-r-md`}
              onClick={() => setTimeRange("3months")}
            >
              3 Meses
            </Button>
          </div>
        </div>

        {/* Calories Chart */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Calorias</h3>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-3 h-3 rounded-full bg-primary inline-block mr-1"></span> Meta
              <span className="w-3 h-3 rounded-full bg-accent inline-block ml-3 mr-1"></span> Consumido
            </div>
          </div>

          <div className="h-60 w-full">
            {caloriesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={caloriesChartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => {
                      return [`${value} kcal`, name === "consumed" ? "Consumido" : "Meta"];
                    }}
                    labelFormatter={(label) => {
                      const item = caloriesChartData.find(item => item.date === label);
                      return item ? format(new Date(item.fullDate), "dd MMM yyyy", { locale: ptBR }) : label;
                    }}
                  />
                  <Bar 
                    dataKey="target" 
                    fill="rgba(96, 108, 56, 0.2)" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="consumed" 
                    fill="#DDA15E" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Nenhum dado disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Média diária</h4>
              <div className="flex items-end">
                <span className="text-2xl font-semibold">{averageCalories}</span>
                <span className="text-xs text-gray-500 ml-1 mb-1">kcal</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Dias na meta</h4>
              <div className="flex items-end">
                <span className="text-2xl font-semibold">{daysOnTarget}</span>
                <span className="text-xs text-gray-500 ml-1 mb-1">/ {daysInRange} dias</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weight Tracking */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Peso</h3>
              <div className="flex items-center">
                <Input
                  type="number"
                  placeholder="75.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-20 mr-2"
                  step="0.1"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-primary text-sm font-medium"
                  onClick={handleUpdateWeight}
                >
                  Atualizar
                </Button>
              </div>
            </div>

            {latestWeight && (
              <div className="flex items-center mb-4">
                <span className="text-3xl font-semibold">{latestWeight.toFixed(1)}</span>
                <span className="text-sm text-gray-500 ml-1">kg</span>

                {weightChange && weightChangeDirection !== "same" && (
                  <span className={`text-xs ml-3 flex items-center ${
                    weightChangeDirection === "down" ? "text-green-500" : "text-red-500"
                  }`}>
                    {weightChangeDirection === "down" ? (
                      <>
                        <TrendingDown className="h-3 w-3 mr-0.5" />
                        {Math.abs(parseFloat(weightChange)).toFixed(1)} kg
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        {weightChange} kg
                      </>
                    )}
                  </span>
                )}
              </div>
            )}

            <div className="h-40 w-full">
              {weightChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={weightChartData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [`${value} kg`, "Peso"]}
                      labelFormatter={(label) => {
                        const item = weightChartData.find(item => item.date === label);
                        return item ? format(new Date(item.fullDate), "dd MMM yyyy", { locale: ptBR }) : label;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#606C38" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">Nenhum dado de peso disponível</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
				<div className="px-4">
					<Button variant="outline" onClick={() => setLocation("/dashboard")}>Voltar para o Dashboard</Button>
				</div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activePage="progress" />
    </div>
  );
}