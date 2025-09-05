import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { clearMessages } from '../../store/slices/uiSlice';
import { FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const AlertMessage: React.FC = () => {
  const dispatch = useDispatch();
  const { error, success } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  const handleClose = () => {
    dispatch(clearMessages());
  };

  if (!error && !success) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-lg mb-4">
          <div className="flex items-start">
            <FiAlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={handleClose}
              className="ml-3 text-red-400 hover:text-red-600"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md shadow-lg mb-4">
          <div className="flex items-start">
            <FiCheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div className="ml-3 flex-1">
              <p className="text-sm text-green-800">{success}</p>
            </div>
            <button
              onClick={handleClose}
              className="ml-3 text-green-400 hover:text-green-600"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertMessage;