import React from 'react';
import Header from './Header';
import AlertMessage from '../Common/AlertMessage';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showConnectionStatus?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showConnectionStatus = false 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={title} showConnectionStatus={showConnectionStatus} />
      <AlertMessage />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;