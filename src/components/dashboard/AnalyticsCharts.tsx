import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface TrainingProgress {
  name: string;
  progress: number;
  color: string;
}

interface HiringData {
  month: string;
  hired: number;
  applied: number;
}

const TrainingProgressCard: React.FC = () => {
  const trainingData: TrainingProgress[] = [
    { name: 'Data Security Training', progress: 85, color: '#3B82F6' },
    { name: 'Leadership Development', progress: 62, color: '#10B981' },
    { name: 'New Employee Orientation', progress: 94, color: '#F59E0B' },
    { name: 'Compliance Training', progress: 78, color: '#8B5CF6' },
    { name: 'Technical Skills', progress: 71, color: '#EF4444' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Training Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trainingData.map((training, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {training.name}
              </span>
              <span className="font-medium">{training.progress}%</span>
            </div>
            <Progress 
              value={training.progress} 
              className="h-2"
              style={{
                '--progress-color': training.color
              } as React.CSSProperties}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const HiringTrendsChart: React.FC = () => {
  const hiringData: HiringData[] = [
    { month: 'Jan', hired: 12, applied: 45 },
    { month: 'Feb', hired: 8, applied: 38 },
    { month: 'Mar', hired: 15, applied: 52 },
    { month: 'Apr', hired: 10, applied: 41 },
    { month: 'May', hired: 18, applied: 58 },
    { month: 'Jun', hired: 14, applied: 47 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hiring Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hiringData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hired" fill="#3B82F6" name="Hired" />
            <Bar dataKey="applied" fill="#10B981" name="Applied" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const DepartmentDistributionChart: React.FC = () => {
  const departmentData = [
    { name: 'Engineering', value: 45, color: '#3B82F6' },
    { name: 'Sales', value: 32, color: '#10B981' },
    { name: 'Marketing', value: 28, color: '#F59E0B' },
    { name: 'HR', value: 18, color: '#8B5CF6' },
    { name: 'Finance', value: 15, color: '#EF4444' },
    { name: 'Operations', value: 12, color: '#06B6D4' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Department Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={departmentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {departmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const AnalyticsCharts: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrainingProgressCard />
        <DepartmentDistributionChart />
      </div>
      <HiringTrendsChart />
    </div>
  );
};
