"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface TrendChartProps {
  data: {
    date: string;
    verifications: number;
  }[];
}

const chartConfig = {
  verifications: {
    label: "Verifications",
    color: "#023e4a",
  },
} satisfies ChartConfig;

export function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="w-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Verification Trends</h3>
          <p className="text-sm text-gray-500">Daily verification volume (Last 7 Days)</p>
        </div>

        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-brand"></span>
            Volume
          </span>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 10 }} 
                dy={10} 
              />
              <YAxis 
                hide 
              />
              <ChartTooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                content={<ChartTooltipContent hideLabel />} 
              />
              <Bar 
                dataKey="verifications" 
                fill="var(--color-verifications)" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
