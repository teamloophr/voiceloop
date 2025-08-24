import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'inactive' | 'onboarding';
  performance: number;
  ptoDays: number;
  manager: string;
}

interface Metric {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  urgent?: boolean;
  editable?: boolean;
}

interface Activity {
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

interface SandboxContextType {
  isSandboxMode: boolean;
  toggleSandboxMode: () => void;
  employees: Employee[];
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  deleteEmployee: (id: string) => void;
  metrics: Metric[];
  updateMetric: (id: string, updates: Partial<Metric>) => void;
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
}

const SandboxContext = createContext<SandboxContextType | undefined>(undefined);

export const useSandbox = () => {
  const context = useContext(SandboxContext);
  if (context === undefined) {
    throw new Error('useSandbox must be used within a SandboxProvider');
  }
  return context;
};

interface SandboxProviderProps {
  children: ReactNode;
}

export const SandboxProvider: React.FC<SandboxProviderProps> = ({ children }) => {
  const [isSandboxMode, setIsSandboxMode] = useState(false);

  // Initial sample data
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      position: 'HR Director',
      department: 'Human Resources',
      email: 'sarah.johnson@company.com',
      hireDate: '2022-03-15',
      salary: 85000,
      status: 'active',
      performance: 94,
      ptoDays: 15,
      manager: 'CEO'
    },
    {
      id: '2',
      name: 'Michael Chen',
      position: 'Senior Developer',
      department: 'Engineering',
      email: 'michael.chen@company.com',
      hireDate: '2021-08-20',
      salary: 95000,
      status: 'active',
      performance: 88,
      ptoDays: 8,
      manager: 'Engineering Manager'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      position: 'Marketing Manager',
      department: 'Marketing',
      email: 'emily.rodriguez@company.com',
      hireDate: '2022-01-10',
      salary: 78000,
      status: 'active',
      performance: 91,
      ptoDays: 12,
      manager: 'CMO'
    },
    {
      id: '4',
      name: 'David Kim',
      position: 'Sales Representative',
      department: 'Sales',
      email: 'david.kim@company.com',
      hireDate: '2023-06-01',
      salary: 65000,
      status: 'onboarding',
      performance: 75,
      ptoDays: 20,
      manager: 'Sales Manager'
    }
  ]);

  const [metrics, setMetrics] = useState<Metric[]>([
    {
      id: '1',
      title: 'Total Employees',
      value: '247',
      change: '+12 this month',
      trend: 'up',
      editable: true
    },
    {
      id: '2',
      title: 'Open Positions',
      value: '8',
      change: '3 urgent',
      urgent: true,
      editable: true
    },
    {
      id: '3',
      title: 'Avg Time to Hire',
      value: '18d',
      change: '-3 days from last month',
      trend: 'up',
      editable: true
    },
    {
      id: '4',
      title: 'Employee Satisfaction',
      value: '94%',
      change: '+2% from last quarter',
      trend: 'up',
      editable: true
    }
  ]);

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'onboarding',
      title: 'John Smith completed onboarding',
      description: 'Successfully completed all required training modules',
      timestamp: '2 hours ago',
      user: {
        name: 'John Smith',
        initials: 'JS'
      },
      status: 'completed'
    },
    {
      id: '2',
      type: 'application',
      title: 'New candidate applied',
      description: 'Senior Developer position - Sarah Johnson',
      timestamp: '4 hours ago',
      user: {
        name: 'Sarah Johnson',
        initials: 'SJ'
      },
      status: 'pending'
    },
    {
      id: '3',
      type: 'review',
      title: 'Q1 Performance reviews started',
      description: 'Performance review cycle initiated for all departments',
      timestamp: '1 day ago',
      status: 'pending'
    }
  ]);

  const toggleSandboxMode = () => {
    setIsSandboxMode(!isSandboxMode);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => 
      prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp)
    );
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee = {
      ...employee,
      id: Date.now().toString()
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const updateMetric = (id: string, updates: Partial<Metric>) => {
    setMetrics(prev => 
      prev.map(metric => metric.id === id ? { ...metric, ...updates } : metric)
    );
  };

  const addActivity = (activity: Omit<Activity, 'id'>) => {
    const newActivity = {
      ...activity,
      id: Date.now().toString()
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities(prev => 
      prev.map(activity => activity.id === id ? { ...activity, ...updates } : activity)
    );
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  };

  const value: SandboxContextType = {
    isSandboxMode,
    toggleSandboxMode,
    employees,
    updateEmployee,
    addEmployee,
    deleteEmployee,
    metrics,
    updateMetric,
    activities,
    addActivity,
    updateActivity,
    deleteActivity
  };

  return (
    <SandboxContext.Provider value={value}>
      {children}
    </SandboxContext.Provider>
  );
};
