import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, store } from "../../store";
import { setParkingStates } from "../../store/slices/adminSlice";
import { setError } from "../../store/slices/uiSlice";
import { addAuditLog } from "../../store/slices/adminSlice";
import { adminAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import Layout from "../../components/Layout/Layout";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import {
  FiUsers,
  FiShield,
  FiMapPin,
  FiLock,
  FiUnlock,
  FiRefreshCw,
} from "react-icons/fi";
import { FaCar } from "react-icons/fa";

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();
  const { parkingStates, auditLog } = useSelector(
    (state: RootState) => state.admin
  );

  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadParkingState();
    }
  }, [isAdmin]);

  const loadParkingState = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getParkingState();
      dispatch(setParkingStates(response.data));
    } catch (error: any) {
      console.error("Error loading parking state:", error);
      dispatch(setError("Failed to load parking state"));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadParkingState();
    setRefreshing(false);
  };

  const toggleZoneOpen = async (zoneId: string, currentState: boolean) => {
    const zone = parkingStates.find((z) => z.zoneId === zoneId);
    if (!zone) {
      console.error(`Zone with ID ${zoneId} not found.`);
      dispatch(setError(`Zone with ID ${zoneId} not found.`));
      return;
    }
    try {
      await adminAPI.updateZoneOpen(zoneId, !currentState);
      dispatch(
        addAuditLog({
          adminId: store.getState().auth.user?.id || "unknown",
          action: `Toggled zone ${zoneId} to ${
            !currentState ? "open" : "closed"
          }`,
          targetType: "zone",
          targetId: zoneId,
          timestamp: new Date().toISOString(),
        })
      );
      await loadParkingState();
    } catch (error: any) {
      console.error("Error updating zone status:", error);
      dispatch(setError("Failed to update zone status"));
    }
  };

  if (!isAdmin) {
    return (
      <Layout title="Admin Dashboard">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg">
            Access denied. Admin login required.
          </div>
        </div>
      </Layout>
    );
  }

  const getTotalStats = () => {
    const total = parkingStates.reduce(
      (acc, zone) => ({
        totalSlots: acc.totalSlots + (zone.totalSlots ?? 0),
        occupied: acc.occupied + (zone.occupied ?? 0),
        reserved: acc.reserved + (zone.reserved ?? 0),
        subscribers: acc.subscribers + (zone.subscriberCount ?? 0),
      }),
      { totalSlots: 0, occupied: 0, reserved: 0, subscribers: 0 }
    );

    return {
      ...total,
      free: total.totalSlots - total.occupied,
      occupancyRate:
        total.totalSlots > 0 ? (total.occupied / total.totalSlots) * 100 : 0,
    };
  };

  const stats = getTotalStats();

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalSlots}
                </div>
                <div className="text-sm text-gray-600">Total Slots</div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FiMapPin className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.occupied}
                </div>
                <div className="text-sm text-gray-600">
                  Occupied ({stats.occupancyRate.toFixed(1)}%)
                </div>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FaCar className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.reserved}
                </div>
                <div className="text-sm text-gray-600">Reserved</div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FiShield className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.subscribers}
                </div>
                <div className="text-sm text-gray-600">Active Subscribers</div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiUsers className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Zone Management
            </h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            >
              <FiRefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Occupancy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reserved
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscribers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parkingStates.map((zone) => (
                    <tr key={zone.zoneId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {zone.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {zone.categoryId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {zone.occupied}/{zone.totalSlots}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                zone.totalSlots
                                  ? (zone.occupied / zone.totalSlots) * 100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>Visitors: {zone.availableForVisitors ?? 0}</div>
                        <div>
                          Subscribers: {zone.availableForSubscribers ?? 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {zone.reserved ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {zone.subscriberCount ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            zone.open
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {zone.open ? "Open" : "Closed"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleZoneOpen(zone.zoneId, zone.open)}
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            zone.open
                              ? "text-red-700 bg-red-100 hover:bg-red-200"
                              : "text-green-700 bg-green-100 hover:bg-green-200"
                          }`}
                        >
                          {zone.open ? (
                            <>
                              <FiLock className="h-3 w-3" />
                              <span>Close</span>
                            </>
                          ) : (
                            <>
                              <FiUnlock className="h-3 w-3" />
                              <span>Open</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {auditLog.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Admin Activities
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {auditLog.slice(0, 10).map((log, index) => (
                  <div
                    key={`${log.adminId}-${log.targetId}-${log.timestamp}-${index}`}
                    className="flex items-center space-x-3 text-sm"
                  >
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <span className="font-medium">{log.adminId}</span>
                      <span className="text-gray-600"> {log.action} </span>
                      <span className="font-medium">{log.targetId}</span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
