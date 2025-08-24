import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { useSandbox } from '@/contexts/SandboxContext';

interface EditableMetricCardProps {
  metric: {
    id: string;
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    urgent?: boolean;
  };
  onUpdate: (id: string, updates: any) => void;
}

const EditableMetricCard: React.FC<EditableMetricCardProps> = ({ metric, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(metric.value.toString());
  const [editChange, setEditChange] = useState(metric.change || '');

  const getIcon = (title: string) => {
    switch (title) {
      case 'Total Employees':
        return <Users className="h-4 w-4" />;
      case 'Open Positions':
        return <UserPlus className="h-4 w-4" />;
      case 'Avg Time to Hire':
        return <Clock className="h-4 w-4" />;
      case 'Employee Satisfaction':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const handleSave = () => {
    onUpdate(metric.id, {
      value: editValue,
      change: editChange
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(metric.value.toString());
    setEditChange(metric.change || '');
    setIsEditing(false);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <div className="text-muted-foreground">
            {getIcon(metric.title)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-6 w-6 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="text-2xl font-bold"
            />
            <Input
              value={editChange}
              onChange={(e) => setEditChange(e.target.value)}
              placeholder="Change description"
              className="text-xs"
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSave} className="flex-1">
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1">
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.change && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                {metric.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                <span className={metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : ''}>
                  {metric.change}
                </span>
              </div>
            )}
            {metric.urgent && (
              <Badge variant="destructive" className="mt-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const EditableMetricsPanel: React.FC = () => {
  const { metrics, updateMetric } = useSandbox();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Key Metrics (Editable)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <EditableMetricCard 
              key={metric.id} 
              metric={metric} 
              onUpdate={updateMetric}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
