import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import {
  setShowTicketModal,
  resetGateState,
} from "../../store/slices/gateSlice";
import { FiX, FiPrinter, FiMapPin, FiClock, FiUser } from "react-icons/fi";

const TicketModal: React.FC = () => {
  const dispatch = useDispatch();
  const { currentTicket, currentGate, zones, showTicketModal } = useSelector(
    (state: RootState) => state.gate
  );

  if (!showTicketModal || !currentTicket) return null;

  const zone = zones.find((z) => z.zoneId === currentTicket.zoneId); // Updated to use zoneId
  const checkinTime = new Date(currentTicket.checkinAt);

  const handleClose = () => {
    dispatch(setShowTicketModal(false));
    dispatch(resetGateState());
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Parking Ticket
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Ticket Content */}
        <div className="p-6 print:p-0">
          <div className="text-center mb-6">
            <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
              <FiMapPin className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Check-in Successful!
            </h3>
            <div className="text-sm text-gray-600">
              Your parking slot has been reserved
            </div>
          </div>

          {/* Ticket Details */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {currentTicket.id}
                </div>
                <div className="text-sm text-gray-600">Ticket ID</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <FiUser className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-gray-600">Type</div>
                  <div className="font-medium capitalize">
                    {currentTicket.type}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <FiClock className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-gray-600">Check-in</div>
                  <div className="font-medium">
                    {checkinTime.toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <FiMapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-gray-600">Gate</div>
                  <div className="font-medium">{currentGate?.name}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <FiMapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-gray-600">Zone</div>
                  <div className="font-medium">{zone?.name}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Information */}
          {zone && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">Parking Rates</div>
                <div className="flex justify-between">
                  <span>Normal Rate: ${zone.rateNormal}/hour</span>
                  <span>Special Rate: ${zone.rateSpecial}/hour</span>
                </div>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Keep this ticket with you at all times</div>
            <div>• Present this ticket at checkout</div>
            <div>• Rates may vary during special hours</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPrinter className="h-4 w-4" />
            <span>Print</span>
          </button>

          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

        {/* Gate Animation */}
        <div className="hidden print:hidden">
          <div className="h-2 bg-green-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
