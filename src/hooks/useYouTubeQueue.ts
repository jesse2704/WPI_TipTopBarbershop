import { useState, useEffect, useCallback } from "react";

export interface VideoQueueItem {
  id: string;
  videoId: string;
  title: string;
  addedAt: string;
}

interface YouTubeState {
  queue: VideoQueueItem[];
  currentVideo: VideoQueueItem | null;
}

const STORAGE_KEY = "tiptop_youtube";
const CHANNEL_NAME = "tiptop_youtube_channel";

function loadState(): YouTubeState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data
      ? JSON.parse(data)
      : { queue: [], currentVideo: null };
  } catch {
    return { queue: [], currentVideo: null };
  }
}

function saveState(state: YouTubeState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useYouTubeQueue() {
  const [state, setState] = useState<YouTubeState>(loadState);

  // Listen for cross-tab updates via BroadcastChannel and storage events
  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "youtube_update") {
        setState(event.data.state);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          setState(JSON.parse(event.newValue));
        } catch {
          // ignore parse errors
        }
      }
    };

    channel.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
      channel.close();
    };
  }, []);

  const broadcast = useCallback((newState: YouTubeState) => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: "youtube_update", state: newState });
    channel.close();
  }, []);

  const addToQueue = useCallback(
    (videoId: string, title: string) => {
      setState((prev) => {
        const newItem: VideoQueueItem = {
          id: crypto.randomUUID(),
          videoId,
          title,
          addedAt: new Date().toISOString(),
        };

        const newState: YouTubeState = {
          ...prev,
          queue: [...prev.queue, newItem],
          currentVideo: prev.currentVideo ?? newItem,
        };

        saveState(newState);
        broadcast(newState);
        return newState;
      });
    },
    [broadcast]
  );

  const playNext = useCallback(() => {
    setState((prev) => {
      const currentIdx = prev.currentVideo
        ? prev.queue.findIndex((v) => v.id === prev.currentVideo!.id)
        : -1;

      const nextIdx = currentIdx + 1;
      const nextVideo = nextIdx < prev.queue.length ? prev.queue[nextIdx] : null;

      const newState: YouTubeState = {
        ...prev,
        currentVideo: nextVideo,
      };

      saveState(newState);
      broadcast(newState);
      return newState;
    });
  }, [broadcast]);

  const removeFromQueue = useCallback(
    (id: string) => {
      setState((prev) => {
        const newQueue = prev.queue.filter((v) => v.id !== id);
        const newCurrent =
          prev.currentVideo?.id === id
            ? newQueue.length > 0
              ? newQueue[0]
              : null
            : prev.currentVideo;

        const newState: YouTubeState = {
          queue: newQueue,
          currentVideo: newCurrent,
        };

        saveState(newState);
        broadcast(newState);
        return newState;
      });
    },
    [broadcast]
  );

  const skipTo = useCallback(
    (id: string) => {
      setState((prev) => {
        const video = prev.queue.find((v) => v.id === id);
        if (!video) return prev;

        const newState: YouTubeState = {
          ...prev,
          currentVideo: video,
        };

        saveState(newState);
        broadcast(newState);
        return newState;
      });
    },
    [broadcast]
  );

  return {
    queue: state.queue,
    currentVideo: state.currentVideo,
    addToQueue,
    playNext,
    removeFromQueue,
    skipTo,
  };
}
