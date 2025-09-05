import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setError, setSuccess } from "../store/slices/uiSlice";
import { ticketsAPI, subscriptionsAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/Layout/Layout";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import {
  FiSearch,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiUser,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";

interface BreakdownItem {
  from: string;
  to: string;
  hours: number;
  rateMode: string;
  rate: number;
  amount: number;
}

interface CheckoutResult {
  ticketId: string;
  checkinAt: string;
  checkoutAt: string;
  durationHours: number;
  breakdown: BreakdownItem[];
  amount: number;
}

const Checkpoint: React.FC = () => {
  const dispatch = useDispatch();
  const { isEmployee } = useAuth();

  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(
    null
  );
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [showConvertOption, setShowConvertOption] = useState(false);

  const handleLookup = async () => {
    if (!ticketId.trim()) {
      dispatch(setError("Please enter ticket ID"));
      return;
    }

    try {
      setLoading(true);

      const ticketResponse = await ticketsAPI.getById(ticketId);
      const ticket = ticketResponse.data;

      if (ticket.subscriptionId) {
        try {
          const subResponse = await subscriptionsAPI.getById(
            ticket.subscriptionId
          );
          setSubscriptionData(subResponse.data);
        } catch (error) {
          console.warn("Could not fetch subscription data");
        }
      }

      const checkoutResponse = await ticketsAPI.checkout({
        ticketId: ticketId,
        forceConvertToVisitor: false,
      });

      setCheckoutResult(checkoutResponse.data);
      dispatch(setSuccess("Checkout completed successfully"));
    } catch (error: any) {
      const message = error.response?.data?.message || "Checkout failed";
      dispatch(setError(message));

      if (message.includes("subscription") || message.includes("mismatch")) {
        setShowConvertOption(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToVisitor = async () => {
    try {
      setLoading(true);

      const checkoutResponse = await ticketsAPI.checkout({
        ticketId: ticketId,
        forceConvertToVisitor: true,
      });

      setCheckoutResult(checkoutResponse.data);
      setShowConvertOption(false);
      dispatch(setSuccess("Converted to visitor and checkout completed"));
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Convert to visitor failed";
      dispatch(setError(message));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTicketId("");
    setCheckoutResult(null);
    setSubscriptionData(null);
    setShowConvertOption(false);
  };

  if (!isEmployee) {
    return (
      <Layout title="Checkpoint">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg">
            Access denied. Employee login required.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Checkpoint - Parking Checkout">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Scan or Enter Ticket ID
          </h2>

          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
                placeholder="Enter or scan ticket ID (e.g., t_001)"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleLookup}
              disabled={loading || !ticketId.trim()}
              className="px-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <FiSearch className="h-5 w-5" />
              )}
              <span>Lookup & Checkout</span>
            </button>
          </div>

          {checkoutResult && (
            <div className="mt-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              >
                Process Another Ticket
              </button>
            </div>
          )}
        </div>

        {subscriptionData && !checkoutResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <FiUser className="h-5 w-5 mr-2" />
              Subscriber Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-blue-700 font-medium">Name</div>
                <div className="text-blue-900">{subscriptionData.userName}</div>
              </div>
              <div>
                <div className="text-sm text-blue-700 font-medium">
                  Category
                </div>
                <div className="text-blue-900">{subscriptionData.category}</div>
              </div>
            </div>

            {subscriptionData.cars && subscriptionData.cars.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-blue-700 font-medium mb-2">
                  Registered Vehicles
                </div>
                <div className="space-y-2">
                  {subscriptionData.cars.map((car: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded-md p-3 border border-blue-200"
                    >
                      <div className="font-mono font-semibold text-gray-900">
                        {car.plate}
                      </div>
                      <div className="text-sm text-gray-600">
                        {car.brand} {car.model} • {car.color}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start space-x-2">
                    <FiAlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      Please verify the vehicle plate matches one of the
                      registered vehicles above.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showConvertOption && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
              <FiAlertTriangle className="h-5 w-5 mr-2" />
              Subscription Issue Detected
            </h3>

            <p className="text-yellow-800 mb-4">
              There seems to be an issue with the subscription (expired,
              inactive, or vehicle plate mismatch). You can convert this to a
              visitor checkout to proceed with payment.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={handleConvertToVisitor}
                disabled={loading}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <FiDollarSign className="h-4 w-4" />
                )}
                <span>Convert to Visitor</span>
              </button>

              <button
                onClick={() => setShowConvertOption(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {checkoutResult && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-green-50 border-b border-green-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <FiCheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Checkout Successful
                  </h3>
                  <p className="text-green-700">
                    Ticket {checkoutResult.ticketId} has been processed
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-gray-600 mb-1">
                    <FiClock className="h-4 w-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {checkoutResult.durationHours} hrs
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-gray-600 mb-1">
                    <FiMapPin className="h-4 w-4" />
                    <span className="text-sm">Check-in</span>
                  </div>
                  <div className="text-lg font-medium text-gray-900">
                    {new Date(checkoutResult.checkinAt).toLocaleString()}
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-gray-600 mb-1">
                    <FiDollarSign className="h-4 w-4" />
                    <span className="text-sm">Total Amount</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    ${checkoutResult.amount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Billing Breakdown
                </h4>

                <div className="space-y-3">
                  {checkoutResult.breakdown.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {item.rateMode}
                          </span>
                          <span className="text-sm text-gray-600">
                            ${item.rate}/hour
                          </span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          ${item.amount.toFixed(2)}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        {new Date(item.from).toLocaleTimeString()} -{" "}
                        {new Date(item.to).toLocaleTimeString()}
                        <span className="ml-2">({item.hours} hours)</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="flex items-center justify-between text-xl font-bold text-gray-900">
                    <span>Total Due</span>
                    <span>${checkoutResult.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Checkpoint;
