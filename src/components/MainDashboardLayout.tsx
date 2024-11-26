import React from 'react';

interface MainDashboardLayoutProps {
  children: React.ReactNode;
}

export const MainDashboardLayout: React.FC<MainDashboardLayoutProps> = ({ children }) => {
  return (
    <div className="main-dashboard-layout">
      {/* You might want to add sidebar, header, etc. here */}
      <main>{children}</main>
    </div>
  );
};
