import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import {
  setCurrentGate,
  setZones,
  setUserType,
  setSubscriptionId,
  setSelectedZone,
  setCurrentTicket,
  setShowTicketModal,
  resetGateState,
} from "../store/slices/gateSlice";
import { setError, setSuccess } from "../store/slices/uiSlice";
import { masterAPI, subscriptionsAPI, ticketsAPI } from "../services/api";
import wsService from "../services/websocket";
import Layout from "../components/Layout/Layout";
import ZoneCard from "../components/Gate/ZoneCard";
import TicketModal from "../components/Gate/TicketModal";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import { FaCar } from "react-icons/fa";
import { FiUsers, FiSearch, FiArrowRight } from "react-icons/fi";

const Gate: React.FC = () => {
  const { gateId } = useParams<{ gateId: string }>();
  const dispatch = useDispatch();

  const { currentGate, zones, selectedZone, userType, subscriptionId } =
    useSelector((state: RootState) => state.gate);

  const [loading, setLoading] = React.useState(false);
  const [verifyingSubscription, setVerifyingSubscription] =
    React.useState(false);
  const [subscriptionValid, setSubscriptionValid] = React.useState(false);
  const [subscriptionData, setSubscriptionData] = React.useState<any>(null);

  useEffect(() => {
    if (gateId) {
      loadGateData();
      wsService.connect();
      wsService.subscribeToGate(gateId);
    }

    return () => {
      wsService.unsubscribeFromGate();
      dispatch(resetGateState());
    };
  }, [gateId]);

  const loadGateData = async () => {
    try {
      setLoading(true);

      const gatesResponse = await masterAPI.getGates();
      const gate = gatesResponse.data.find((g: any) => g.id === gateId);

      if (!gate) {
        dispatch(setError("Gate not found"));
        return;
      }

      dispatch(setCurrentGate(gate));

      const zonesResponse = await masterAPI.getZones(gateId);
      const mappedZones = zonesResponse.data.map((zone: any) => ({
        ...zone,
        zoneId: zone.zoneId || zone.id,
      }));
      dispatch(setZones(mappedZones));
    } catch (error: any) {
      dispatch(setError("Failed to load gate data"));
    } finally {
      setLoading(false);
    }
  };

  const verifySubscription = async () => {
    if (!subscriptionId?.trim()) {
      dispatch(setError("Please enter subscription ID"));
      return;
    }

    try {
      setVerifyingSubscription(true);
      const response = await subscriptionsAPI.getById(subscriptionId);
      const subscription = response.data;

      if (!subscription.active) {
        dispatch(setError("Subscription is not active"));
        setSubscriptionValid(false);
        return;
      }

      if (selectedZone) {
        const zone = zones.find((z) => z.zoneId === selectedZone);
        if (zone && subscription.category !== zone.categoryId) {
          dispatch(setError("Subscription not valid for this zone category"));
          setSubscriptionValid(false);
          return;
        }
      }

      setSubscriptionData(subscription);
      setSubscriptionValid(true);
      dispatch(setSuccess("Subscription verified successfully"));
    } catch (error: any) {
      dispatch(setError("Invalid subscription ID"));
      setSubscriptionValid(false);
      setSubscriptionData(null);
    } finally {
      setVerifyingSubscription(false);
    }
  };

  const handleCheckin = async () => {
    if (!selectedZone || !gateId) {
      dispatch(setError("Please select a zone"));
      return;
    }

    if (userType === "subscriber") {
      if (!subscriptionValid || !subscriptionData) {
        dispatch(setError("Please verify subscription first"));
        return;
      }

      const zone = zones.find((z) => z.zoneId === selectedZone);
      if (zone && subscriptionData.category !== zone.categoryId) {
        dispatch(setError("Subscription not valid for selected zone"));
        return;
      }
    }

    try {
      setLoading(true);

      const checkinData: any = {
        gateId,
        zoneId: selectedZone,
        type: userType,
      };

      if (userType === "subscriber") {
        checkinData.subscriptionId = subscriptionId;
      }

      const response = await ticketsAPI.checkin(checkinData);
      const { ticket, zoneState } = response.data;

      dispatch(
        setZones(
          zones.map((z) => (z.zoneId === zoneState.zoneId ? zoneState : z))
        )
      );

      dispatch(setCurrentTicket(ticket));
      dispatch(setShowTicketModal(true));
      dispatch(setSuccess("Check-in successful!"));
    } catch (error: any) {
      const message = error.response?.data?.message || "Check-in failed";
      dispatch(setError(message));
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypeChange = (type: "visitor" | "subscriber") => {
    dispatch(setUserType(type));
    dispatch(setSelectedZone(null));
    setSubscriptionValid(false);
    setSubscriptionData(null);
  };

  const getAvailableZones = () => {
    return zones.filter((zone) => {
      if (!zone.open) return false;

      if (userType === "visitor") {
        return zone.availableForVisitors > 0;
      } else {
        if (subscriptionValid && subscriptionData) {
          return (
            zone.categoryId === subscriptionData.category &&
            zone.availableForSubscribers > 0
          );
        }
        return zone.availableForSubscribers > 0;
      }
    });
  };

  if (loading && !currentGate) {
    return (
      <Layout title="Loading..." showConnectionStatus>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!currentGate) {
    return (
      <Layout title="Gate Not Found" showConnectionStatus>
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Gate not found</div>
        </div>
      </Layout>
    );
  }

  const availableZones = getAvailableZones();
  const selectedZoneData = zones.find((z) => z.zoneId === selectedZone);
  const canCheckin =
    selectedZone &&
    (userType === "visitor" ||
      (userType === "subscriber" && subscriptionValid));

  return (
    <Layout title={`Gate: ${currentGate.name}`} showConnectionStatus>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => handleUserTypeChange("visitor")}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                userType === "visitor"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <FaCar className="h-4 w-4" />
              <span>Visitor</span>
            </button>
            <button
              onClick={() => handleUserTypeChange("subscriber")}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                userType === "subscriber"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <FiUsers className="h-4 w-4" />
              <span>Subscriber</span>
            </button>
          </div>

          {userType === "subscriber" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription ID
              </label>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={subscriptionId || ""}
                    onChange={(e) =>
                      dispatch(setSubscriptionId(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter subscription ID"
                  />
                </div>
                <button
                  onClick={verifySubscription}
                  disabled={verifyingSubscription || !subscriptionId?.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {verifyingSubscription ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <FiSearch className="h-4 w-4" />
                  )}
                  <span>Verify</span>
                </button>
              </div>

              {subscriptionValid && subscriptionData && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="text-sm text-green-800">
                    ✓ Subscription verified for {subscriptionData.userName} (
                    {subscriptionData.category})
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Parking Zone
          </h2>

          {availableZones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {userType === "subscriber" && !subscriptionValid ? (
                <div>
                  <FiUsers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p>Please verify your subscription to see available zones</p>
                </div>
              ) : (
                <div>
                  <FaCar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p>No available zones for {userType}s at this time</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableZones.map((zone) => (
                <ZoneCard key={zone.zoneId} zone={zone} />
              ))}
            </div>
          )}
        </div>

        {selectedZoneData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Ready to Check-in
                </h3>
                <p className="text-gray-600">
                  Zone: {selectedZoneData.name} • Rate: $
                  {selectedZoneData.specialActive
                    ? selectedZoneData.rateSpecial
                    : selectedZoneData.rateNormal}
                  /hour
                </p>
              </div>

              <button
                onClick={handleCheckin}
                disabled={!canCheckin || loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <FiArrowRight className="h-5 w-5" />
                )}
                <span>Check In</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <TicketModal />
    </Layout>
  );
};

export default Gate;
