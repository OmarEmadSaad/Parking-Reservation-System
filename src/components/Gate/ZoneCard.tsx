import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { setSelectedZone } from "../../store/slices/gateSlice";
import { FiUsers, FiClock, FiLock, FiUnlock } from "react-icons/fi";

interface Zone {
  zoneId: string;
  name: string;
  categoryId: string;
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
  specialActive?: boolean;
}

interface ZoneCardProps {
  zone: Zone;
}

const ZoneCard: React.FC<ZoneCardProps> = ({ zone }) => {
  const dispatch = useDispatch();
  const { selectedZone, userType } = useSelector(
    (state: RootState) => state.gate
  );

  const isSelected = selectedZone === zone.zoneId;
  const isDisabled =
    !zone.open ||
    (userType === "visitor" && zone.availableForVisitors <= 0) ||
    (userType === "subscriber" && zone.availableForSubscribers <= 0);

  const currentRate = zone.specialActive ? zone.rateSpecial : zone.rateNormal;
  const availableSlots =
    userType === "visitor"
      ? zone.availableForVisitors
      : zone.availableForSubscribers;

  const handleSelect = () => {
    if (!isDisabled) {
      dispatch(setSelectedZone(isSelected ? null : zone.zoneId));
    }
  };

  const getOccupancyColor = () => {
    const percentage = (zone.occupied / zone.totalSlots) * 100;
    if (percentage >= 90) return "text-red-600 bg-red-50";
    if (percentage >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
        ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-lg"
            : "border-gray-200 bg-white hover:border-gray-300"
        }
        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      onClick={handleSelect}
    >
      <div className="absolute top-3 right-3 flex items-center space-x-2">
        {zone.open ? (
          <FiUnlock className="h-4 w-4 text-green-500" />
        ) : (
          <FiLock className="h-4 w-4 text-red-500" />
        )}
        {zone.specialActive && (
          <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
            Special Rate
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-16">
        {zone.name}
      </h3>

      <div
        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium mb-3 ${getOccupancyColor()}`}
      >
        <FiUsers className="h-4 w-4" />
        <span>
          {zone.occupied}/{zone.totalSlots} occupied
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {availableSlots}
          </div>
          <div className="text-sm text-gray-600">
            Available for {userType === "visitor" ? "Visitors" : "Subscribers"}
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">${currentRate}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center">
            <FiClock className="h-3 w-3 mr-1" />
            per hour
          </div>
        </div>
      </div>

      {zone.reserved > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            <strong>{zone.reserved}</strong> slots reserved for subscribers
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Normal: ${zone.rateNormal}/hr</span>
          <span>Special: ${zone.rateSpecial}/hr</span>
        </div>
      </div>

      {isDisabled && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
          <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-600">
            {!zone.open ? "Closed" : "No Available Slots"}
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneCard;
