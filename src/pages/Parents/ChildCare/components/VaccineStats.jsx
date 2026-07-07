import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

const VaccineStats = React.memo(({ vaccineList, records }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsSmallScreen(window.innerHeight < 600);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const stats = useMemo(
    () => {
      const allVaccines = vaccineList.flatMap((group) => group.vaccines || []);
      const totalVaccines = allVaccines.length;
      const takenVaccines = allVaccines.filter((vaccine) =>
        records.some(
          (rec) =>
            rec.vaccineName === vaccine.vaccine &&
            rec.doseNumber === vaccine.dose
        )
      ).length;

      const completionRate =
        totalVaccines > 0
          ? Math.round((takenVaccines / totalVaccines) * 100)
          : 0;

      return {
        totalVaccines,
        takenVaccines,
        completionRate,
      };
    },
    [vaccineList, records]
  );

  const chartData = useMemo(
    () => [
      { name: "Completed", value: stats.takenVaccines },
      { name: "Pending", value: Math.max(stats.totalVaccines - stats.takenVaccines, 0) },
    ],
    [stats]
  );

  const chartConfig = {
    Completed: { label: "Completed", color: "var(--color-primary)" },
    Pending: { label: "Pending", color: "var(--color-accent)" },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="glass-card p-3 rounded-xl shadow-soft border border-primary text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <div className={`text-lg sm:text-xl font-bold text-primary ${isSmallScreen ? "text-base" : ""}`}>{stats.totalVaccines}</div>
        <div className={`text-xs sm:text-sm text-muted ${isSmallScreen ? "text-xs" : ""}`}>Total Vaccines</div>
      </motion.div>
      <motion.div
        className="glass-card p-3 rounded-xl shadow-soft border border-primary text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: 0.2 }}
      >
        <div className={`text-lg sm:text-xl font-bold text-primary ${isSmallScreen ? "text-base" : ""}`}>{stats.takenVaccines}</div>
        <div className={`text-xs sm:text-sm text-muted ${isSmallScreen ? "text-xs" : ""}`}>Vaccines Taken</div>
      </motion.div>
      <motion.div
        className="glass-card p-3 rounded-xl shadow-soft border border-primary"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: 0.3 }}
      >
        <div className="flex items-center justify-center">
          <div className={`w-16 h-16 ${isSmallScreen ? "w-14 h-14" : ""}`}>
            <ChartContainer config={chartConfig} className="w-full h-full bg-card">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={30}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? chartConfig.Completed.color : chartConfig.Pending.color}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent className={`text-xs bg-card text-text ${isSmallScreen ? "text-xs" : ""}`} />}
                />
              </PieChart>
            </ChartContainer>
          </div>
          <div className="ml-3">
            <div className={`text-lg sm:text-xl font-bold text-primary ${isSmallScreen ? "text-base" : ""}`}>{stats.completionRate}%</div>
            <div className={`text-xs sm:text-sm text-muted ${isSmallScreen ? "text-xs" : ""}`}>Completion Rate</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default VaccineStats;