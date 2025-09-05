import { store } from "../store";
import { updateZone } from "../store/slices/gateSlice";
import { addAuditLog } from "../store/slices/adminSlice";
import { setWsConnected } from "../store/slices/uiSlice";

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentGateId: string | null = null;

  connect() {
    try {
      this.ws = new WebSocket("ws://localhost:3000/api/v1/ws");

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        store.dispatch(setWsConnected(true));
        this.reconnectAttempts = 0;

        if (this.currentGateId) {
          this.subscribeToGate(this.currentGateId);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        store.dispatch(setWsConnected(false));
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        store.dispatch(setWsConnected(false));
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("WebSocket message received:", message);
          this.handleMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      this.handleReconnect();
    }
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case "zone-update":
        console.log("Zone update payload:", message.payload);
        store.dispatch(updateZone(message.payload));
        break;

      case "admin-update":
        store.dispatch(addAuditLog(message.payload));
        break;

      default:
        console.log("Unknown message type:", message.type);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  subscribeToGate(gateId: string) {
    this.currentGateId = gateId;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "subscribe",
          payload: { gateId },
        })
      );
    }
  }

  unsubscribeFromGate() {
    if (
      this.ws &&
      this.ws.readyState === WebSocket.OPEN &&
      this.currentGateId
    ) {
      this.ws.send(
        JSON.stringify({
          type: "unsubscribe",
          payload: { gateId: this.currentGateId },
        })
      );
    }
    this.currentGateId = null;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.currentGateId = null;
    store.dispatch(setWsConnected(false));
  }
}

export const wsService = new WebSocketService();
export default wsService;
