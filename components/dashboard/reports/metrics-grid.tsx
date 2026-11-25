import { TrendingUp, CheckCircle, FileText, AlertTriangle } from "lucide-react";

interface MetricsGridProps {
  analytics: {
    metrics: {
      complianceScore: number;
      totalJobs: number;
      pendingReviews: number;
      failureRate: number;
    };
  } | undefined;
}

export function MetricsGrid({ analytics }: MetricsGridProps) {
  const isLoading = analytics === undefined;
  
  const stats = [
    {
      label: "Compliance Score",
      value: isLoading || !analytics ? "--" : `${analytics.metrics.complianceScore}%`,
      trend: "+4% from last period",
      icon: <CheckCircle className="text-green-500" size={20} />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      isScore: true
    },
    {
      label: "Total Verifications",
      value: isLoading || !analytics ? "--" : analytics.metrics.totalJobs.toLocaleString(),
      trend: "Verification Volume",
      icon: <FileText className="text-blue-600" size={20} />,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Failure Rate",
      value: isLoading || !analytics ? "--" : `${analytics.metrics.failureRate}%`,
      trend: analytics?.metrics && analytics.metrics.failureRate > 15 ? "Requires Attention" : "Within Range",
      icon: analytics?.metrics && analytics.metrics.failureRate > 15 ? <AlertTriangle className="text-red-500" size={20} /> : <TrendingUp className="text-amber-500" size={20} />,
      color: analytics?.metrics && analytics.metrics.failureRate > 15 ? "text-red-600" : "text-amber-600",
      bgColor: analytics?.metrics && analytics.metrics.failureRate > 15 ? "bg-red-50" : "bg-amber-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between group"
        >
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight tabular-nums">{stat.value}</h3>
            <p className={`text-[10px] font-bold ${stat.color} uppercase tracking-wider`}>
               {stat.trend}
            </p>
          </div>

          {stat.isScore ? (
            <div className="w-16 h-16 rounded-full border-[6px] border-green-500 border-t-gray-100 flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
          ) : (
            <div className={`w-12 h-12 ${stat.bgColor} ${stat.color} rounded-md flex items-center justify-center shrink-0`}>
              {stat.icon}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
