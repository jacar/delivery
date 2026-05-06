
const isSoundEnabled = () => {
  return localStorage.getItem('sound_enabled') !== 'false';
};

export const playNotificationSound = () => {
  if (!isSoundEnabled()) return;
  try {
    const audio = new Audio(`${import.meta.env.BASE_URL}alerta.mp3`);
    audio.play().catch(error => {
      // Browsers often block sounds if the user hasn't interacted with the page yet
      if (error.name === 'NotAllowedError') {
        console.warn("Audio playback was blocked. Please interact with the page to enable sounds.");
      } else {
        console.error("Error playing notification sound:", error);
      }
    });
  } catch (err) {
    console.error("Failed to initialize audio:", err);
  }
};

export const playChatSound = () => {
  if (!isSoundEnabled()) return;
  try {
    const audio = new Audio(`${import.meta.env.BASE_URL}chat.mp3`);
    audio.play().catch(error => {
      if (error.name === 'NotAllowedError') {
        console.warn("Chat audio playback was blocked. Please interact with the page.");
      } else {
        console.error("Error playing chat sound:", error);
      }
    });
  } catch (err) {
    console.error("Failed to initialize chat audio:", err);
  }
};
