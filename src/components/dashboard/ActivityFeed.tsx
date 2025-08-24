import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  UserCheck, 
  FileText, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Save,
  X
} from 'lucide-react';
import { useSandbox } from '@/contexts/SandboxContext';

interface ActivityItem {
  id: string;
  type: 'onboarding' | 'application' | 'review' | 'training' | 'general';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
    initials: string;
  };
  status?: 'completed' | 'pending' | 'urgent';
}

const ActivityItem: React.FC<{ item: ActivityItem }> = ({ item }) => {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'onboarding':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'application':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'review':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'training':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status?: ActivityItem['status']) => {
    if (!status) return null;
    
    const variants = {
      completed: { variant: 'default' as const, text: 'Completed' },
      pending: { variant: 'secondary' as const, text: 'Pending' },
      urgent: { variant: 'destructive' as const, text: 'Urgent' }
    };
    
    const config = variants[status];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="flex items-start space-x-3 py-3">
      <div className="flex-shrink-0">
        {item.user ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={item.user.avatar} />
            <AvatarFallback className="text-xs">
              {item.user.initials}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            {getIcon(item.type)}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            {item.title}
          </p>
          {getStatusBadge(item.status)}
        </div>
        <p className="text-sm text-muted-foreground">
          {item.description}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {item.timestamp}
        </p>
      </div>
    </div>
  );
};

const AddActivityForm: React.FC<{ onAdd: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => void; onCancel: () => void }> = ({ onAdd, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ActivityItem['type']>('general');
  const [status, setStatus] = useState<ActivityItem['status']>('pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      onAdd({
        type,
        title: title.trim(),
        description: description.trim(),
        status
      });
      setTitle('');
      setDescription('');
      setType('general');
      setStatus('pending');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-muted/50 rounded-lg">
      <div className="space-y-2">
        <Input
          placeholder="Activity title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm"
        />
        <Input
          placeholder="Description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-sm"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Select value={type} onValueChange={(value: ActivityItem['type']) => setType(value)}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="application">Application</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={status} onValueChange={(value: ActivityItem['status']) => setStatus(value)}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex space-x-2">
        <Button type="submit" size="sm" className="flex-1">
          <Save className="h-3 w-3 mr-1" />
          Add Activity
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      </div>
    </form>
  );
};

export const ActivityFeed: React.FC<{ isEditMode?: boolean }> = ({ isEditMode = false }) => {
  const { activities, addActivity } = useSandbox();
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddActivity = (activityData: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...activityData,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString()
    };
    addActivity(newActivity);
    setShowAddForm(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          Recent Activity {isEditMode && <span className="text-yellow-500">(Editable)</span>}
        </CardTitle>
        {isEditMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-8 px-2"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {showAddForm && (
          <AddActivityForm
            onAdd={handleAddActivity}
            onCancel={() => setShowAddForm(false)}
          />
        )}
        {activities.map((activity) => (
          <ActivityItem key={activity.id} item={activity} />
        ))}
      </CardContent>
    </Card>
  );
};
