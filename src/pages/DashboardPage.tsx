import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

const DashboardPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Teamloop Dashboard - HR Management';
  }, []);

  return <DashboardLayout />;
};

export default DashboardPage;
