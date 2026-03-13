import { useState } from "react";
import { useYouTubeQueue } from "../hooks/useYouTubeQueue";
import { useLanguage } from "../context/LanguageContext";

const headingFont = { fontFamily: "'Roboto Condensed', 'Arial Narrow', sans-serif" };
const accentFont = { fontFamily: "'Lora', serif" };

function extractVideoId(input: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }

  // If it looks like a raw video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) {
    return input.trim();
  }

  return null;
}

export default function RemoteControlPage() {
  const { queue, currentVideo, addToQueue, removeFromQueue, skipTo } =
    useYouTubeQueue();
  const { txt } = useLanguage();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError(txt("Voer een geldige YouTube-URL of video-ID in.", "Please enter a valid YouTube URL or video ID."));
      return;
    }

    const videoTitle = title.trim() || `${txt("Video", "Video")} ${queue.length + 1}`;
    addToQueue(videoId, videoTitle);
    setUrl("");
    setTitle("");
    setSuccess(txt("Toegevoegd aan wachtrij!", "Added to queue!"));
    setTimeout(() => setSuccess(""), 2000);
  };

  const upcomingVideos = currentVideo
    ? queue.filter(
        (v) =>
          queue.indexOf(v) >
          queue.findIndex((q) => q.id === currentVideo.id)
      )
    : queue;

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-slate-grey/40 bg-deep-black text-vintage-cream placeholder-slate-grey/50 focus:outline-none focus:ring-2 focus:ring-antique-gold focus:border-antique-gold transition-colors";

  return (
    <div className="min-h-screen brand-page text-vintage-cream">
      {/* Header */}
      <header className="border-b border-[#2A2A2A] px-4 py-6 text-center bg-[#111111]/60 backdrop-blur-sm">
        <h1 className="text-2xl font-bold tracking-wider" style={headingFont}>
          TIP TOP{" "}
          <span className="text-antique-gold">MUSIC</span>
        </h1>
        <p className="text-vintage-cream/50 text-sm mt-1" style={accentFont}>
          {txt("Voeg je favoriete tracks toe aan de barbershop-playlist", "Add your favourite tunes to the barbershop playlist")}
        </p>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Add Video Form */}
        <form
          onSubmit={handleSubmit}
          className="brand-card rounded-xl p-5 space-y-4"
        >
          <h2 className="text-lg font-bold text-antique-gold" style={headingFont}>
            {txt("Voeg Een Video Toe", "Add a Video")}
          </h2>

          <input
            type="url"
            placeholder={txt("Plak YouTube-URL...", "Paste YouTube URL...")}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className={inputClass}
          />

          <input
            type="text"
            placeholder={txt("Titel (optioneel)", "Title (optional)")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />

          {error && <p className="text-red-400 text-sm" style={accentFont}>{error}</p>}
          {success && <p className="text-green-400 text-sm" style={accentFont}>{success}</p>}

          <button
            type="submit"
            className="w-full py-3 px-6 bg-antique-gold hover:bg-amber-500 text-deep-black font-bold rounded-lg transition-colors"
            style={headingFont}
          >
            {txt("Toevoegen Aan Wachtrij", "Add to Queue")}
          </button>
        </form>

        {/* Now Playing */}
        {currentVideo && (
          <div className="bg-antique-gold/10 border border-antique-gold/40 rounded-xl p-5">
            <p className="text-xs text-antique-gold uppercase tracking-wider mb-2" style={headingFont}>
              {txt("Nu Speelt", "Now Playing")}
            </p>
            <p className="text-lg font-bold" style={headingFont}>
              {currentVideo.title}
            </p>
            <div className="mt-3 rounded-lg overflow-hidden aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=0`}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              />
            </div>
          </div>
        )}

        {/* Queue */}
        <div>
          <h2 className="text-lg font-bold text-antique-gold mb-3" style={headingFont}>
            {txt("Wachtrij", "Queue")} ({upcomingVideos.length})
          </h2>

          {upcomingVideos.length === 0 ? (
            <div className="bg-slate-grey/10 border border-slate-grey/20 rounded-xl p-6 text-center">
              <p className="text-slate-grey">
                {txt("Er staan nog geen video's in de wachtrij. Voeg er hierboven een toe!", "No videos in queue. Add one above!")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingVideos.map((video, idx) => (
                <div
                  key={video.id}
                  className="flex items-center gap-3 bg-slate-grey/10 border border-slate-grey/20 rounded-lg p-3"
                >
                  <span className="text-slate-grey text-sm min-w-[24px]" style={headingFont}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={headingFont}>{video.title}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => skipTo(video.id)}
                      className="text-antique-gold hover:text-amber-400 text-xs px-2 py-1 border border-antique-gold/30 rounded transition-colors"
                      title={txt("Speel Nu", "Play now")}
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => removeFromQueue(video.id)}
                      className="text-red-400 hover:text-red-300 text-xs px-2 py-1 border border-red-400/30 rounded transition-colors"
                      title={txt("Verwijder", "Remove")}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
