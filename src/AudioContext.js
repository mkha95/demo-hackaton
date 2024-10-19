import React, { createContext, useContext, useRef, useState } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const backgroundMusicRef = useRef(new Audio('/music.mp3'));
  const dialogueRef = useRef(new Audio('/dialogue.mp3'));
  const [isDialoguePlaying, setIsDialoguePlaying] = useState(false);

  backgroundMusicRef.current.loop = true;

  const playBackgroundMusic = () => {
    backgroundMusicRef.current.play().catch(error => console.error("Background music playback failed:", error));
  };

  const pauseBackgroundMusic = () => {
    backgroundMusicRef.current.pause();
  };

  const playDialogue = () => {
    if (isDialoguePlaying) {
      dialogueRef.current.pause();
      setIsDialoguePlaying(false);
    } else {
      dialogueRef.current.play().catch(error => console.error("Dialogue playback failed:", error));
      setIsDialoguePlaying(true);
    }
  };

  dialogueRef.current.onended = () => {
    setIsDialoguePlaying(false);
  };

  return (
    <AudioContext.Provider value={{ playBackgroundMusic, pauseBackgroundMusic, playDialogue, isDialoguePlaying }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
