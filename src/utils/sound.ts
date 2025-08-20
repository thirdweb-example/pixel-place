// Sound utility for playing audio effects
export function playPixelPlaceSound() {
  const audioPath = "/pixel-placed.mp3";

  try {
    // Create audio element
    const audio = new Audio(audioPath);
    audio.volume = 0.5;
    audio.preload = "auto";
    audio.play().catch((error) => {
      // Silently fail if audio can't play (e.g., user hasn't interacted with page yet)
      console.debug("Audio playback failed:", error);
    });
  } catch (error) {
    // Silently fail if audio creation failed
    console.debug("Audio creation failed:", error);
  }
}

// Alternative function that accepts a custom sound file path
export function playSound(soundPath: string, volume: number) {
  try {
    const audio = new Audio(soundPath);
    audio.volume = Math.max(0, Math.min(1, volume)); // Clamp volume between 0 and 1

    audio.play().catch((error) => {
      console.debug("Audio playback failed:", error);
    });
  } catch (error) {
    console.debug("Audio creation failed:", error);
  }
}
