import React, { useEffect, useState } from 'react';

interface CallOverlayProps {
  curName: string;
  curAvatar: string | null;
  isVideo: boolean;
  onEndCall: () => void;
}

export function CallOverlay({ curName, curAvatar, isVideo, onEndCall }: CallOverlayProps) {
  const [status, setStatus] = useState('Calling...');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Simulate answering after a few seconds
    const timer1 = setTimeout(() => setStatus('Ringing...'), 1500);
    const timer2 = setTimeout(() => {
      setStatus('Connected');
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    let interval: any;
    if (status === 'Connected') {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-between py-12 animate-[fadeIn_0.3s_ease-out]">
      {/* Header Info */}
      <div className="flex flex-col items-center mt-12 animate-[slideDown_0.4s_ease-out]">
        <h2 className="text-white text-3xl font-bold mb-2">{curName}</h2>
        <p className="text-slate-300 text-lg font-medium tracking-wide">
          {status === 'Connected' ? formatTime(duration) : status}
        </p>
      </div>

      {/* Profile Ring */}
      <div className="relative flex items-center justify-center">
        {status !== 'Connected' && (
          <>
            <div className="absolute w-[200px] h-[200px] rounded-full border border-white/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute w-[260px] h-[260px] rounded-full border border-white/10 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          </>
        )}
        <div className="relative z-10 w-32 h-32 rounded-full overflow-hidden border-4 border-slate-700 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {curAvatar ? (
             <img src={curAvatar} alt={curName} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
               {curName.charAt(0).toUpperCase()}
             </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mb-12 animate-[slideUp_0.4s_ease-out]">
        <button className="w-14 h-14 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10 shadow-lg backdrop-blur-md">
          {/* Mute Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </button>
        <button className={`w-14 h-14 rounded-full ${isVideo ? 'bg-slate-800/80 hover:bg-slate-700 border-white/10 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/30'} flex items-center justify-center transition-colors cursor-pointer border shadow-lg backdrop-blur-md`}>
          {/* Video Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isVideo ? (
              <>
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </>
            ) : (
              <>
                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </>
            )}
          </svg>
        </button>
        <button className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-transform hover:scale-105 cursor-pointer border-none" onClick={onEndCall}>
          {/* End Call Icon (Phone Down) */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(135deg)' }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
