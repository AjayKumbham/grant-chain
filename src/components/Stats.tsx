
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Award } from "lucide-react";

export const Stats = () => {
  const stats = [
    {
      title: "Total Grants",
      value: "152",
      change: "+12% from last month",
      icon: Award,
      color: "text-blue-600",
    },
    {
      title: "Active Funders",
      value: "89",
      change: "+5% from last month",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Funds Distributed",
      value: "$2.4M",
      change: "+23% from last month",
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Success Rate",
      value: "94%",
      change: "+2% from last month",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Platform Statistics
          </h2>
          <p className="text-lg text-gray-600">
            Real-time metrics from our decentralized grant ecosystem
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`rounded-full bg-gray-100 p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
