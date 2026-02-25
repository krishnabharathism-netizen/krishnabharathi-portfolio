import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= KEYS ================= */

const MUSIC_KEY = "MUSIC_ENABLED";
const SOUND_KEY = "SOUND_ENABLED";

/* ================= GLOBAL SOUNDS ================= */

let backgroundSound: Audio.Sound | null = null;
let correctSound: Audio.Sound | null = null;

/* ================= INIT AUDIO ================= */

export const initAudio = async () => {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
  });
};

/* ================= SETTINGS ================= */
export const saveSoundSetting = async (value: boolean) => {
  await AsyncStorage.setItem(SOUND_KEY, JSON.stringify(value));
};

export const getMusicSetting = async () => {
  const v = await AsyncStorage.getItem(MUSIC_KEY);
  return v !== null ? JSON.parse(v) : true;
};

export const getSoundSetting = async () => {
  const v = await AsyncStorage.getItem(SOUND_KEY);
  return v !== null ? JSON.parse(v) : true;
};

/* ================= BACKGROUND MUSIC ================= */

const loadMusic = async () => {
  if (backgroundSound) return backgroundSound;

  const { sound } = await Audio.Sound.createAsync(
    require("../../assets/sound/backgroundSound.mp3"),
    {
      isLooping: true,
      shouldPlay: false,
      volume: 0.7,
    }
  );

  backgroundSound = sound;
  return sound;
};


export const stopMusic = async () => {
  if (!backgroundSound) return;

  await backgroundSound.stopAsync();
  await backgroundSound.unloadAsync();
  backgroundSound = null;
};

/* ================= SUCCESS SOUND ================= */

const loadCorrectSound = async () => {
  if (correctSound) return correctSound;

  const { sound } = await Audio.Sound.createAsync(
    require("../../assets/sound/success.wav") // ✅ NEW FILE
  );

  correctSound = sound;
  return sound;
};

export const playCorrectSound = async () => {
  const enabled = await getSoundSetting();
  if (!enabled) return;

  const sound = await loadCorrectSound();

  await sound.replayAsync(); // clean replay
};
