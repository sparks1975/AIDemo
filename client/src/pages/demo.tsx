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
  CalendarPlus,
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
  'calendar-plus': CalendarPlus,
};

const ALOHA_BLUE = '#D946EF';

function BadgeComponent({ badge }: { badge: Badge }) {
  const Icon = iconMap[badge.icon] || CheckCircle;
  
  const colorStyles = {
    default: {
      iconBg: 'rgba(142, 142, 147, 0.12)',
      iconColor: '#8E8E93',
    },
    success: {
      iconBg: 'rgba(52, 199, 89, 0.12)',
      iconColor: '#34C759',
    },
    warning: {
      iconBg: 'rgba(255, 149, 0, 0.12)',
      iconColor: '#FF9500',
    },
    info: {
      iconBg: 'rgba(1, 122, 255, 0.12)',
      iconColor: '#017AFF',
    },
  };

  const colors = colorStyles[badge.color];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 28, stiffness: 380 }}
      className="flex items-center gap-3.5 px-4 py-3 rounded-2xl w-[345px]"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 0.5px 0 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.06)',
      }}
      data-testid={`badge-${badge.id}`}
    >
      <div 
        className="flex-shrink-0 w-10 h-10 rounded-[10px] flex items-center justify-center"
        style={{ backgroundColor: colors.iconBg }}
      >
        <Icon className="w-5 h-5" style={{ color: colors.iconColor }} />
      </div>
      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <span className="text-[13px] font-medium leading-tight" style={{ color: '#86868B' }}>{badge.label}</span>
        <motion.span 
          key={badge.value}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-[15px] font-semibold leading-tight truncate" 
          style={{ color: '#1D1D1F' }}
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);

  const showContent = hasStartedOnce && (audioActuallyPlaying || (isPlaying === false && currentTime > 0 && !isComplete));
  
  const currentBadges = showContent ? getBadgesAtTime(currentTime) : [];
  
  const currentMessage = showContent 
    ? demoConversation.filter(m => m.timestamp <= currentTime).pop()
    : null;

  // Set up audio element
  useEffect(() => {
    const audio = new Audio('/audio/demo-call.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;
    let rafId: number | null = null;

    const handleCanPlayThrough = () => {
      setIsLoading(false);
    };

    const pollTime = () => {
      setCurrentTime(audio.currentTime);
      rafId = requestAnimationFrame(pollTime);
    };

    const handlePlaying = () => {
      setIsStarting(false);
      setAudioActuallyPlaying(true);
      setHasStartedOnce(true);
      if (rafId === null) {
        rafId = requestAnimationFrame(pollTime);
      }
    };

    const handlePause = () => {
      setAudioActuallyPlaying(false);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioActuallyPlaying(false);
      setIsComplete(true);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    // Force load
    audio.load();

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      audio.pause();
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (!audioRef.current || isLoading) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsStarting(true);
      audioRef.current.play().catch(err => {
        console.error('Play error:', err);
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
    setHasStartedOnce(false);
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
      {/* Subtle AI ambient glow background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(1,122,255,0.10) 0%, transparent 70%)',
            animation: 'glow-breathe 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(1,122,255,0.06) 0%, transparent 70%)',
            animation: 'glow-breathe 14s ease-in-out infinite',
            animationDelay: '4s',
          }}
        />
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
      <main className="flex-1 flex flex-col relative z-10 px-4 pb-8">
        
        {/* Center zone — badges sit vertically centered */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Title - show when not showing content */}
          {!showContent && !isComplete && !showStartingState && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center"
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

          {/* Starting state */}
          {showStartingState && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center"
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
          
          {/* Badges — vertically centered */}
          {showContent && !isComplete && (
            <div className="flex flex-col items-center gap-2 px-4">
              <AnimatePresence>
                {currentBadges.map(badge => (
                  <BadgeComponent key={badge.id} badge={badge} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Complete state */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center"
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
        </div>

        {/* Bottom zone — transcript and controls pinned near bottom */}
        <div className="flex flex-col items-center">
          {/* Transcript */}
          {showContent && !isComplete && (
            <div className="w-full px-4 mb-6 min-h-[80px] flex items-center justify-center">
              {currentMessage && (
                <p
                  key={currentMessage.id}
                  className="text-base md:text-lg text-black text-center leading-relaxed max-w-2xl"
                  style={{ lineHeight: 1.5 }}
                >
                  {currentMessage.text}
                </p>
              )}
            </div>
          )}

          {/* Debug time display */}
          {showContent && (
            <div className="mb-2 text-xs font-mono text-gray-400" data-testid="text-debug-time">
              {currentTime.toFixed(2)}s | Line {currentMessage?.id || '-'}: {currentMessage?.speaker || '-'}
            </div>
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
        </div>
      </main>
    </div>
  );
}
