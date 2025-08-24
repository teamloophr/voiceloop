import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  TrendingUp, 
  Edit2, 
  Save, 
  X,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { useSandbox } from '@/contexts/SandboxContext';

interface MetricFormData {
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  urgent: boolean;
}

const initialFormData: MetricFormData = {
  value: '',
  change: '',
  trend: 'neutral',
  urgent: false
};

export const EditableMetricsManager: React.FC = () => {
  const { metrics, updateMetric } = useSandbox();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MetricFormData>(initialFormData);

  const handleInputChange = (field: keyof MetricFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMetric(editingId, {
        value: formData.value,
        change: formData.change,
        trend: formData.trend,
        urgent: formData.urgent
      });
      setEditingId(null);
      setFormData(initialFormData);
    }
  };

  const handleEdit = (metric: any) => {
    setEditingId(metric.id);
    setFormData({
      value: metric.value.toString(),
      change: metric.change || '',
      trend: metric.trend || 'neutral',
      urgent: metric.urgent || false
    });
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Key Metrics Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {metrics.map((metric) => (
            <Card key={metric.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{metric.title}</h4>
                    {metric.urgent && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Urgent
                      </Badge>
                    )}
                  </div>
                  
                  {editingId === metric.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`value-${metric.id}`}>Value</Label>
                          <Input
                            id={`value-${metric.id}`}
                            value={formData.value}
                            onChange={(e) => handleInputChange('value', e.target.value)}
                            placeholder="Enter metric value"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`change-${metric.id}`}>Change Description</Label>
                          <Input
                            id={`change-${metric.id}`}
                            value={formData.change}
                            onChange={(e) => handleInputChange('change', e.target.value)}
                            placeholder="e.g., +12 this month"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`trend-${metric.id}`}>Trend</Label>
                          <Select value={formData.trend} onValueChange={(value) => handleInputChange('trend', value as any)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="up">Upward Trend</SelectItem>
                              <SelectItem value="down">Downward Trend</SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`urgent-${metric.id}`}>Mark as Urgent</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`urgent-${metric.id}`}
                              checked={formData.urgent}
                              onCheckedChange={(checked) => handleInputChange('urgent', checked)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {formData.urgent ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSubmit} className="flex-1">
                          <Save className="h-4 w-4 mr-2" />
                          Update Metric
                        </Button>
                        <Button variant="outline" onClick={handleCancel} className="flex-1">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{metric.value}</div>
                      {metric.change && (
                        <div className="flex items-center space-x-2 text-sm">
                          {getTrendIcon(metric.trend || 'neutral')}
                          <span className={getTrendColor(metric.trend || 'neutral')}>
                            {metric.change}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {editingId !== metric.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(metric)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-sm text-muted-foreground text-center">
          💡 Click the edit button on any metric to update its values. Changes will be reflected in real-time on the dashboard.
        </div>
      </CardContent>
    </Card>
  );
};
