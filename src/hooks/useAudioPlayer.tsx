import { useState, useEffect, useRef } from 'react';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio('/ambient-soundscape.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    // Load user preference from localStorage
    const savedPreference = localStorage.getItem('audioEnabled');
    if (savedPreference === 'true') {
      setIsPlaying(true);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.log('Audio playback failed:', error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }

    // Save preference to localStorage
    localStorage.setItem('audioEnabled', isPlaying.toString());
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return {
    isPlaying,
    togglePlay,
    volume,
    setVolume,
  };
};
