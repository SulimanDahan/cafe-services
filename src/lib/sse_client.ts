"use client";

import { NOTIFICATION_STREAM_API_ROUTE } from "@/config/api_routes";

class SharedSSEClient {
    private source: EventSource | null = null;
    private listeners: Map<string, Set<(e: MessageEvent) => void>> = new Map();
    private connectionCount = 0;

    connect() {
        this.connectionCount++;
        if (this.source) return;

        this.source = new EventSource(NOTIFICATION_STREAM_API_ROUTE);

        this.source.onerror = (err) => {
            console.warn("Shared SSE Connection lost. Retrying...", err);
        };

        const events = [
            "new-reservation",
            "new-order",
            "order-deleted",
            "initial-notifications",
            "new-notification",
            "new-report",
            "pending-status"
        ];

        events.forEach(eventName => {
            this.source?.addEventListener(eventName, (event: MessageEvent) => {
                const callbacks = this.listeners.get(eventName);
                if (callbacks) {
                    callbacks.forEach(cb => cb(event));
                }
            });
        });
    }

    addEventListener(eventName: string, callback: (e: MessageEvent) => void) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName)!.add(callback);
    }

    removeEventListener(eventName: string, callback: (e: MessageEvent) => void) {
        const callbacks = this.listeners.get(eventName);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }

    disconnect() {
        this.connectionCount--;
        if (this.connectionCount <= 0 && this.source) {
            this.source.close();
            this.source = null;
            this.connectionCount = 0;
        }
    }
}

export const sharedSSE = new SharedSSEClient();
