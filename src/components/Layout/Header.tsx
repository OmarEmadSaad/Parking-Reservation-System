import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { FiWifi, FiWifiOff, FiUser, FiLogOut, FiClock } from 'react-icons/fi';

interface HeaderProps {
  title: string;
  showConnectionStatus?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showConnectionStatus = false }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const wsConnected = useSelector((state: RootState) => state.ui.wsConnected);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>

          {/* Center - Current Time */}
          <div className="hidden sm:flex items-center space-x-2 text-gray-600">
            <FiClock className="h-4 w-4" />
            <span className="text-sm font-medium">
              {currentTime.toLocaleString()}
            </span>
          </div>

          {/* Right side - Status & User */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            {showConnectionStatus && (
              <div className="flex items-center space-x-2">
                {wsConnected ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <FiWifi className="h-4 w-4" />
                    <span className="text-sm">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600">
                    <FiWifiOff className="h-4 w-4" />
                    <span className="text-sm">Disconnected</span>
                  </div>
                )}
              </div>
            )}

            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-gray-700">
                  <FiUser className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {user.role}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <FiLogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;