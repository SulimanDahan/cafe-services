/* eslint-disable @typescript-eslint/no-explicit-any */

let globalAudioCtx: AudioContext | null = null;

/**
 * Singleton getter for AudioContext to avoid hitting browser limits 
 * and properly handle suspended states due to autoplay policies.
 */
const getAudioContext = () => {
    if (typeof window === "undefined") return null;
    if (!globalAudioCtx) {
        const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            globalAudioCtx = new AudioContextClass();
        }
    }
    // Attempt to resume the audio context if it was suspended (e.g. before user interaction)
    if (globalAudioCtx && globalAudioCtx.state === "suspended") {
        globalAudioCtx.resume().catch(() => { /* silent catch */ });
    }
    return globalAudioCtx;
};

/**
 * Base tone generator helper
 */
const playTone = (
    ctx: AudioContext,
    freq: number,
    start: number,
    duration: number,
    volume: number = 0.5
) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(volume, start);
    // Smooth fade out to avoid clicks
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration);
};

/**
 * Synthesizes a beautiful harmonic chime (E5 and G5 chord) natively via Web Audio API.
 * Used for admin notifications (new orders, repeating alarms).
 */
export const playAdminChime = () => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        // Beautiful harmonic interval: E5 (659.25Hz) followed by G5 (783.99Hz)
        playTone(ctx, 659.25, now, 0.15, 0.8);
        playTone(ctx, 783.99, now + 0.08, 0.3, 0.8);
    } catch (e) {
        console.warn("AudioContext playback blocked or failed:", e);
    }
};

/**
 * Synthesizes a cheerful ascending arpeggio (C5, E5, G5) natively via Web Audio API.
 * Used for customer notifications (order accepted).
 */
export const playCustomerChime = () => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        // Cheerful ascending arpeggio (C5, E5, G5)
        playTone(ctx, 523.25, now, 0.15, 0.5);
        playTone(ctx, 659.25, now + 0.1, 0.15, 0.5);
        playTone(ctx, 783.99, now + 0.2, 0.3, 0.5);
    } catch (e) {
        console.warn("AudioContext playback blocked or failed:", e);
    }
};
