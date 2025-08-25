import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Users,
  Building,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useSandbox } from '@/contexts/SandboxContext';
import ResumeUpload from './ResumeUpload';

interface EmployeeFormData {
  name: string;
  position: string;
  department: string;
  email: string;
  hireDate: string;
  salary: string;
  status: 'active' | 'inactive' | 'onboarding';
  performance: string;
  ptoDays: string;
  manager: string;
}

const initialFormData: EmployeeFormData = {
  name: '',
  position: '',
  department: '',
  email: '',
  hireDate: '',
  salary: '',
  status: 'active',
  performance: '',
  ptoDays: '',
  manager: ''
};

export const EditableEmployeeManager: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useSandbox();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (editingId) {
      // Update existing employee
      updateEmployee(editingId, {
        ...formData,
        salary: parseFloat(formData.salary) || 0,
        performance: parseFloat(formData.performance) || 0,
        ptoDays: parseInt(formData.ptoDays) || 0
      });
      setEditingId(null);
    } else {
      // Add new employee
      addEmployee({
        ...formData,
        salary: parseFloat(formData.salary) || 0,
        performance: parseFloat(formData.performance) || 0,
        ptoDays: parseInt(formData.ptoDays) || 0
      });
    }
    setFormData(initialFormData);
    setIsAdding(false);
  };

  const handleEdit = (employee: any) => {
    setEditingId(employee.id);
    setFormData({
      name: employee.name,
      position: employee.position,
      department: employee.department,
      email: employee.email,
      hireDate: employee.hireDate,
      salary: employee.salary.toString(),
      status: employee.status,
      performance: employee.performance.toString(),
      ptoDays: employee.ptoDays.toString(),
      manager: employee.manager
    });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsAdding(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      onboarding: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Employee Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add/Edit Form */}
        {isAdding && (
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">
              {editingId ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Enter position"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  placeholder="Enter salary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="performance">Performance Score</Label>
                <Input
                  id="performance"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.performance}
                  onChange={(e) => handleInputChange('performance', e.target.value)}
                  placeholder="0-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ptoDays">PTO Days Remaining</Label>
                <Input
                  id="ptoDays"
                  type="number"
                  min="0"
                  value={formData.ptoDays}
                  onChange={(e) => handleInputChange('ptoDays', e.target.value)}
                  placeholder="Enter PTO days"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => handleInputChange('manager', e.target.value)}
                  placeholder="Enter manager name"
                />
              </div>
            </div>
            
            {/* Resume Upload Section */}
            {editingId && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <ResumeUpload
                  employeeId={editingId}
                  employeeName={formData.name}
                  onResumeUploaded={(resume) => {
                    console.log('Resume uploaded:', resume);
                    // Here you can integrate with your backend to associate resumes with employees
                  }}
                />
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update Employee' : 'Add Employee'}
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Add Employee Button */}
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Employee
          </Button>
        )}

        {/* Employee List */}
        <div className="space-y-4">
          <h3 className="font-semibold">Current Employees ({employees.length})</h3>
          <div className="grid gap-4">
            {employees.map((employee) => (
              <Card key={employee.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{employee.name}</h4>
                      {getStatusBadge(employee.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {employee.position}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {employee.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {employee.hireDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${employee.salary.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {employee.performance}%
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {employee.ptoDays} PTO days
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(employee)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteEmployee(employee.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
