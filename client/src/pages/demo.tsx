import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Phone,
  PhoneMissed,
  Clipboard,
  Calendar,
  Shield,
  Tag,
  User,
  CalendarCheck,
  Cake,
  MessageSquare,
  CheckCircle,
  Clock,
  Mail,
  Smartphone,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { demoConversation, getBadgesAtTime, demoDuration, type Badge } from '@/lib/demo-script';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  'phone-missed': PhoneMissed,
  'phone': Phone,
  'clipboard': Clipboard,
  'calendar': Calendar,
  'shield': Shield,
  'tag': Tag,
  'user': User,
  'calendar-check': CalendarCheck,
  'cake': Cake,
  'message-square': MessageSquare,
  'check-circle': CheckCircle,
  'clock': Clock,
  'mail': Mail,
  'smartphone': Smartphone,
};

const ALOHA_BLUE = '#017AFF';

function BadgeComponent({ badge }: { badge: Badge }) {
  const Icon = iconMap[badge.icon] || CheckCircle;
  
  const iconColors = {
    default: 'text-[#4D4D4D]',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    info: 'text-[#017AFF]',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white shadow-sm border border-[#D9D9D9] w-72"
      data-testid={`badge-${badge.id}`}
    >
      <div className={cn('flex-shrink-0', iconColors[badge.color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] font-medium text-[#4D4D4D] uppercase tracking-wider leading-tight">{badge.label}</span>
        <motion.span 
          key={badge.value}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-semibold text-black leading-tight truncate"
        >
          {badge.value}
        </motion.span>
      </div>
    </motion.div>
  );
}

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioActuallyPlaying, setAudioActuallyPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const addDebug = (msg: string) => {
    const timestamp = Date.now();
    console.log(`[DEBUG ${timestamp}] ${msg}`);
    setDebugLog(prev => [...prev.slice(-10), `${timestamp}: ${msg}`]);
  };

  // Audio output latency compensation - UI appears this many seconds AFTER audio time
  // This accounts for the delay between browser playing audio and sound reaching speakers
  const LATENCY_OFFSET = 1.5;
  
  // Adjusted time for UI display (audio time minus latency = what user is actually hearing)
  const displayTime = Math.max(0, currentTime - LATENCY_OFFSET);
  
  // Only show content when audio is ACTUALLY playing AND after latency offset
  const showContent = audioActuallyPlaying && currentTime >= LATENCY_OFFSET;
  
  const currentBadges = showContent ? getBadgesAtTime(displayTime) : [];
  
  const currentMessage = showContent 
    ? demoConversation.filter(m => m.timestamp <= displayTime).pop()
    : null;

  // Set up audio element
  useEffect(() => {
    const audio = new Audio('/audio/demo-call.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;

    // Audio is ready when it can play through
    const handleCanPlayThrough = () => {
      addDebug('canplaythrough - audio ready');
      setIsLoading(false);
    };

    // THIS IS THE KEY: only show UI when audio is ACTUALLY playing
    const handlePlaying = () => {
      addDebug(`playing event! currentTime=${audio.currentTime.toFixed(2)}`);
      setIsStarting(false);
      setAudioActuallyPlaying(true);
    };

    // Update time from the actual audio element
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      addDebug('ended event');
      setIsPlaying(false);
      setAudioActuallyPlaying(false);
      setIsComplete(true);
    };

    const handlePause = () => {
      addDebug('pause event');
      setAudioActuallyPlaying(false);
    };
    
    addDebug('Setting up audio element');

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);

    // Force load
    audio.load();

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (!audioRef.current || isLoading) return;

    if (isPlaying) {
      addDebug('Pausing');
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      addDebug('PLAY clicked');
      setIsStarting(true);
      audioRef.current.play().then(() => {
        addDebug('play() promise resolved');
      }).catch(err => {
        addDebug(`play() error: ${err}`);
        setIsStarting(false);
      });
      setIsPlaying(true);
    }
  }, [isPlaying, isLoading]);

  const handleSkip = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = demoDuration;
    }
    setIsPlaying(false);
    setAudioActuallyPlaying(false);
    setCurrentTime(demoDuration);
    setIsComplete(true);
  }, []);

  const handleReplay = useCallback(() => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsComplete(false);
    setIsStarting(true);
    
    audioRef.current.play().catch(err => {
      console.error('Play error:', err);
      setIsStarting(false);
    });
    setIsPlaying(true);
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Show starting state between click and content appearing (includes latency wait)
  const showStartingState = (isStarting && !audioActuallyPlaying) || (audioActuallyPlaying && !showContent);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col relative overflow-hidden">
      {/* Subtle animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 -left-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-30 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(1,122,255,0.3) 0%, transparent 70%)',
            animationDuration: '25s'
          }} 
        />
        <div 
          className="absolute bottom-0 -right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-25 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(1,122,255,0.25) 0%, transparent 70%)',
            animationDuration: '30s',
            animationDelay: '5s'
          }} 
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-15 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(1,122,255,0.2) 0%, transparent 60%)',
            animationDuration: '35s',
            animationDelay: '10s'
          }} 
        />
      </div>

      {/* Debug panel - visible on screen */}
      <div className="absolute top-4 left-4 z-40 bg-black/80 text-green-400 text-xs font-mono p-2 rounded max-w-xs max-h-40 overflow-auto">
        <div className="font-bold mb-1">DEBUG:</div>
        {debugLog.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>

      {/* Top bar */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-[#4D4D4D] hover:text-black hover:bg-white/80 rounded-full"
          onClick={toggleMute}
          data-testid="button-mute"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[#4D4D4D] hover:text-black hover:bg-white/80 rounded-full text-xs"
          asChild
          data-testid="button-embed-info"
        >
          <a href="/instructions">Embed</a>
        </Button>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-end relative z-10 px-4 pb-8">
        <div className="flex-1" />
        
        {/* Title - show when not showing content */}
        {!showContent && !isComplete && !showStartingState && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center mb-8"
          >
            <div className="relative mb-6">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: ALOHA_BLUE }}
              >
                <Phone className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-2" style={{ lineHeight: 1.2 }}>
              Hear Charlie in Action
            </h1>
            <p className="text-[#4D4D4D] text-sm">
              {isLoading ? 'Loading audio...' : 'Press play to hear an actual AI call'}
            </p>
          </motion.div>
        )}

        {/* Starting state - like Arini */}
        {showStartingState && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center text-center mb-8"
          >
            <div className="relative mb-6">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: ALOHA_BLUE }}
              >
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-2" style={{ lineHeight: 1.2 }}>
              Starting demo...
            </h1>
            <p className="text-[#4D4D4D] text-sm">
              For the full experience, ensure your volume is on.
            </p>
          </motion.div>
        )}
        
        {/* Badges - only after latency offset */}
        {showContent && !isComplete && (
          <div className="flex flex-col items-center gap-2 mb-6 px-4 min-h-[180px] justify-end">
            <AnimatePresence>
              {currentBadges.map(badge => (
                <BadgeComponent key={badge.id} badge={badge} />
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Transcript - only after latency offset */}
        {showContent && !isComplete && (
          <div className="w-full px-4 mb-6 min-h-[80px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {currentMessage && (
                <motion.p
                  key={currentMessage.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-base md:text-lg text-black text-center leading-relaxed max-w-2xl"
                  style={{ lineHeight: 1.5 }}
                >
                  {currentMessage.text}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Complete state */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center mb-8"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-200">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-black mb-2" style={{ lineHeight: 1.2 }}>
              Sound effective?
            </h2>
            <p className="text-[#4D4D4D] text-sm">
              Want to see behind the curtain?
            </p>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          {isComplete ? (
            <Button
              onClick={handleReplay}
              size="lg"
              className="rounded-full px-6 text-white border-0"
              style={{ backgroundColor: ALOHA_BLUE }}
              data-testid="button-replay"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Replay Demo
            </Button>
          ) : (
            <>
              <Button 
                size="lg" 
                onClick={handlePlay}
                disabled={isLoading || showStartingState}
                className={cn(
                  "w-14 h-14 rounded-full shadow-lg border-0 text-white transition-all",
                  (isLoading || showStartingState) && "opacity-50 cursor-not-allowed"
                )}
                style={{ backgroundColor: ALOHA_BLUE }}
                data-testid="button-play-pause"
              >
                {isLoading || showStartingState ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </Button>
              {showContent && (
                <Button 
                  variant="ghost" 
                  onClick={handleSkip}
                  className="text-[#4D4D4D] hover:text-black hover:bg-white/80 rounded-full px-6"
                  data-testid="button-skip"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip
                </Button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
