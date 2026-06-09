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
    // Attempt to resume the audio context if it was suspended
    if (globalAudioCtx && globalAudioCtx.state === "suspended") {
        globalAudioCtx.resume().catch(() => { /* silent catch */ });
    }
    return globalAudioCtx;
};

/**
 * Premium Bell Tone Synthesizer
 * Uses dual oscillators (Fundamental + Harmonic) and a lowpass filter
 * to create a rich, realistic, and clear chime sound.
 */
const playBellTone = (
    ctx: AudioContext,
    freq: number,
    start: number,
    duration: number,
    volume: number = 0.5
) => {
    // Fundamental (Triangle wave gives a warm bell-like body)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(freq, start);

    // Harmonic (Sine wave, 1 octave higher for brightness and clarity)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2.01, start); // Slight detune for acoustic realism

    // Envelope for Fundamental
    gain1.gain.setValueAtTime(0, start);
    gain1.gain.linearRampToValueAtTime(volume, start + 0.02); // Fast attack
    gain1.gain.exponentialRampToValueAtTime(0.001, start + duration); // Smooth release

    // Envelope for Harmonic (decays slightly faster)
    gain2.gain.setValueAtTime(0, start);
    gain2.gain.linearRampToValueAtTime(volume * 0.4, start + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, start + (duration * 0.7));

    // Warmth Filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * 4, start); // Allow some high-end sparkle

    // Connections
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(ctx.destination);

    // Playback
    osc1.start(start);
    osc2.start(start);
    osc1.stop(start + duration + 0.1);
    osc2.stop(start + duration + 0.1);
};

/**
 * Admin Alert Chime
 * A very clear, authoritative "Ding-Dong" (B4 to E5) 
 * resembling an airport or premium hotel desk bell.
 */
export const playAdminChime = () => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        
        // Loud, clear, distinct two-tone alert
        playBellTone(ctx, 493.88, now, 0.5, 0.9); // B4 (Ding)
        playBellTone(ctx, 659.25, now + 0.35, 1.2, 0.9); // E5 (Dong - longer resonance)
    } catch (e) {
        console.warn("AudioContext playback blocked or failed:", e);
    }
};

/**
 * Customer Success Chime
 * A bright, magical, ascending major arpeggio (C5, E5, G5, C6)
 * resembling a digital "success" or "unlocked" sound.
 */
export const playCustomerChime = () => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        
        // Fast, bright ascending sparkle
        playBellTone(ctx, 523.25, now, 0.3, 0.6);        // C5
        playBellTone(ctx, 659.25, now + 0.12, 0.3, 0.6); // E5
        playBellTone(ctx, 783.99, now + 0.24, 0.3, 0.6); // G5
        playBellTone(ctx, 1046.50, now + 0.36, 1.0, 0.7); // C6 (Bright sustained finish)
    } catch (e) {
        console.warn("AudioContext playback blocked or failed:", e);
    }
};
