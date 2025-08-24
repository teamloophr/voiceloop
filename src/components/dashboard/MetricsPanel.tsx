import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useSandbox } from '@/contexts/SandboxContext';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  urgent?: boolean;
  isEditMode?: boolean;
  onUpdate?: (newValue: string) => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend = 'neutral',
  urgent = false,
  isEditMode = false,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  return (
    <Card className="hover:shadow-md transition-shadow relative">
      {isEditMode && (
        <div className="absolute top-2 right-2">
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-6 w-6 p-0 hover:bg-yellow-100"
            >
              <Edit3 className="h-3 w-3 text-yellow-600" />
            </Button>
          ) : (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-6 w-6 p-0 hover:bg-green-100"
              >
                <Save className="h-3 w-3 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-6 w-6 p-0 hover:bg-red-100"
              >
                <X className="h-3 w-3 text-red-600" />
              </Button>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="text-lg sm:text-2xl font-bold h-8 sm:h-10"
            />
            <div className="text-xs text-muted-foreground">
              Press ✓ to save, ✗ to cancel
            </div>
          </div>
        ) : (
          <>
            <div className="text-lg sm:text-2xl font-bold">{value}</div>
            {change && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                {trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : ''}>
                  {change}
                </span>
              </div>
            )}
            {urgent && (
              <Badge variant="destructive" className="mt-2 text-xs">
                <AlertTriangle className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                Urgent
              </Badge>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const MetricsPanel: React.FC<{ isEditMode?: boolean }> = ({ isEditMode = false }) => {
  const { metrics, employees, updateMetric } = useSandbox();
  
  // Calculate real-time metrics from employee data
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const onboardingEmployees = employees.filter(emp => emp.status === 'onboarding').length;
  const avgPerformance = employees.length > 0 
    ? Math.round(employees.reduce((sum, emp) => sum + emp.performance, 0) / employees.length)
    : 0;

  const handleMetricUpdate = (metricName: string, newValue: string) => {
    // For now, we'll just log the update since the metrics are calculated from employee data
    // In a real application, you might want to store these as separate metrics
    console.log(`Updated ${metricName} to ${newValue}`);
    
    // You could also update the employee data to reflect the new metric
    // For example, if updating total employees, you might add/remove employees
    // If updating performance, you might adjust individual employee performance scores
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">
          Key Metrics {isEditMode && <span className="text-yellow-500">(Editable)</span>}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard 
            title="Total Employees"
            value={totalEmployees.toString()}
            change={`${activeEmployees} active, ${onboardingEmployees} onboarding`}
            icon={<Users className="h-4 w-4" />}
            trend="up"
            isEditMode={isEditMode}
            onUpdate={(value) => handleMetricUpdate('totalEmployees', value)}
          />
          <MetricCard 
            title="Open Positions"
            value={onboardingEmployees.toString()}
            change={onboardingEmployees > 0 ? `${onboardingEmployees} urgent` : "All filled"}
            icon={<UserPlus className="h-4 w-4" />}
            urgent={onboardingEmployees > 0}
            isEditMode={isEditMode}
            onUpdate={(value) => handleMetricUpdate('openPositions', value)}
          />
          <MetricCard 
            title="Avg Performance"
            value={`${avgPerformance}%`}
            change={avgPerformance >= 85 ? "High performing team" : "Room for improvement"}
            icon={<TrendingUp className="h-4 w-4" />}
            trend={avgPerformance >= 85 ? "up" : "neutral"}
            isEditMode={isEditMode}
            onUpdate={(value) => handleMetricUpdate('avgPerformance', value)}
          />
          <MetricCard 
            title="Employee Satisfaction"
            value={`${avgPerformance}%`}
            change={`Based on ${totalEmployees} employee reviews`}
            icon={<CheckCircle className="h-4 w-4" />}
            trend={avgPerformance >= 85 ? "up" : "neutral"}
            isEditMode={isEditMode}
            onUpdate={(value) => handleMetricUpdate('employeeSatisfaction', value)}
          />
        </div>
      </div>
    </div>
  );
};
