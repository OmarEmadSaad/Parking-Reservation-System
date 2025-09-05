import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post("/auth/login", credentials),
};

export const masterAPI = {
  getGates: () => api.get("/master/gates"),
  getZones: (gateId?: string) =>
    api.get("/master/zones" + (gateId ? `?gateId=${gateId}` : "")),
  getCategories: () => api.get("/master/categories"),
};

export const subscriptionsAPI = {
  getById: (id: string) => api.get(`/subscriptions/${id}`),
};

export const ticketsAPI = {
  checkin: (data: {
    gateId: string;
    zoneId: string;
    type: "visitor" | "subscriber";
    subscriptionId?: string;
  }) => api.post("/tickets/checkin", data),

  checkout: (data: { ticketId: string; forceConvertToVisitor?: boolean }) =>
    api.post("/tickets/checkout", data),

  getById: (id: string) => api.get(`/tickets/${id}`),
};

export const adminAPI = {
  getParkingState: () => api.get("/admin/reports/parking-state"),

  getCategories: () => api.get("/admin/categories"),
  updateCategory: (
    id: string,
    data: Partial<{
      rateNormal: number;
      rateSpecial: number;
      name: string;
      description: string;
    }>
  ) => api.put(`/admin/categories/${id}`, data),

  updateZoneOpen: (id: string, open: boolean) =>
    api.put(`/admin/zones/${id}/open`, { open }),

  createRushHour: (data: { weekDay: number; from: string; to: string }) =>
    api.post("/admin/rush-hours", data),

  createVacation: (data: { name: string; from: string; to: string }) =>
    api.post("/admin/vacations", data),

  getUsers: () => api.get("/admin/users"),
  createUser: (data: {
    username: string;
    password: string;
    role: string;
    name: string;
  }) => api.post("/admin/users", data),

  getSubscriptions: () => api.get("/admin/subscriptions"),
};

export default api;
