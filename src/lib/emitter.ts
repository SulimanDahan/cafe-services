import { EventEmitter } from "events";

declare global {
 var emitter: EventEmitter | undefined;
}

export const notificationEmitter = globalThis.emitter || new EventEmitter();

if (process.env.NODE_ENV !== "production") {
 globalThis.emitter = notificationEmitter;
}
