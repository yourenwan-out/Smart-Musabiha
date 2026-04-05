import { Capacitor, registerPlugin } from '@capacitor/core';

export const AudioMute = registerPlugin<any>('AudioMute');

export const isNativePlatform = () => Capacitor.isNativePlatform();

export const muteAudio = async () => {
  if (isNativePlatform()) {
    try {
      await AudioMute.mute();
    } catch (e) {
      console.error('Failed to mute audio:', e);
    }
  }
};

export const unmuteAudio = async () => {
  if (isNativePlatform()) {
    try {
      await AudioMute.unmute();
    } catch (e) {
      console.error('Failed to unmute audio:', e);
    }
  }
};
