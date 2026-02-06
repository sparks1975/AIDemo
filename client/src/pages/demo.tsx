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
import charlieLogo from '@assets/charlielogo_1770392573300.png';

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

const ALOHA_BLUE = '#017AFF';

function BadgeComponent({ badge }: { badge: Badge }) {
  const Icon = iconMap[badge.icon] || CheckCircle;
  
  const colorStyles = {
    default: {
      iconBg: 'linear-gradient(135deg, rgba(1,122,255,0.18) 0%, rgba(1,122,255,0.08) 100%)',
      iconColor: '#0A84FF',
      accentBorder: 'rgba(1,122,255,0.15)',
    },
    success: {
      iconBg: 'linear-gradient(135deg, rgba(1,122,255,0.18) 0%, rgba(1,122,255,0.08) 100%)',
      iconColor: '#0A84FF',
      accentBorder: 'rgba(1,122,255,0.15)',
    },
    warning: {
      iconBg: 'linear-gradient(135deg, rgba(1,122,255,0.18) 0%, rgba(1,122,255,0.08) 100%)',
      iconColor: '#0A84FF',
      accentBorder: 'rgba(1,122,255,0.15)',
    },
    info: {
      iconBg: 'linear-gradient(135deg, rgba(1,122,255,0.18) 0%, rgba(1,122,255,0.08) 100%)',
      iconColor: '#0A84FF',
      accentBorder: 'rgba(1,122,255,0.15)',
    },
  };

  const colors = colorStyles[badge.color];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 26, stiffness: 340 }}
      className="flex items-center gap-3.5 px-[18px] py-3.5 rounded-[18px] w-[345px]"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        boxShadow: `
          0 0 0 0.5px rgba(255,255,255,0.6),
          0 0 0 1px ${colors.accentBorder},
          0 1px 1px rgba(0,0,0,0.02),
          0 2px 4px rgba(0,0,0,0.03),
          0 4px 12px rgba(0,0,0,0.05)
        `,
      }}
      data-testid={`badge-${badge.id}`}
    >
      <div 
        className="flex-shrink-0 w-10 h-10 rounded-[11px] flex items-center justify-center"
        style={{ 
          background: colors.iconBg,
          boxShadow: `inset 0 0.5px 0.5px rgba(255,255,255,0.5), 0 0.5px 1.5px rgba(0,0,0,0.04)`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color: colors.iconColor }} />
      </div>
      <div className="flex flex-col min-w-0 flex-1 gap-[3px]">
        <span 
          className="text-[10px] font-bold uppercase leading-none inline-block self-start px-2 py-[3px] rounded-full" 
          style={{ color: '#48484A', backgroundColor: 'rgba(142,142,147,0.22)' }}
        >
          {badge.label}
        </span>
        <motion.span 
          key={badge.value}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-[15px] font-extrabold leading-snug truncate capitalize" 
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
  const [showIntro, setShowIntro] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const introTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);

  const earlyCompleteTime = 86;
  
  useEffect(() => {
    if (currentTime >= earlyCompleteTime && !isComplete && isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setAudioActuallyPlaying(false);
      setIsComplete(true);
    }
  }, [currentTime, isComplete, isPlaying]);

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
      if (introTimeoutRef.current) {
        clearTimeout(introTimeoutRef.current);
      }
      audio.pause();
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (!audioRef.current || isLoading) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (!hasStartedOnce && !showIntro) {
      setShowIntro(true);
      introTimeoutRef.current = setTimeout(() => {
        setShowIntro(false);
        setIsStarting(true);
        audioRef.current?.play().catch(err => {
          console.error('Play error:', err);
          setIsStarting(false);
        });
        setIsPlaying(true);
      }, 4000);
    } else {
      setIsStarting(true);
      audioRef.current.play().catch(err => {
        console.error('Play error:', err);
        setIsStarting(false);
      });
      setIsPlaying(true);
    }
  }, [isPlaying, isLoading, hasStartedOnce, showIntro]);

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
    if (introTimeoutRef.current) {
      clearTimeout(introTimeoutRef.current);
      introTimeoutRef.current = null;
    }
    
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsComplete(false);
    setHasStartedOnce(false);
    setShowIntro(true);
    setIsPlaying(false);
    
    introTimeoutRef.current = setTimeout(() => {
      setShowIntro(false);
      setIsStarting(true);
      audioRef.current?.play().catch(err => {
        console.error('Play error:', err);
        setIsStarting(false);
      });
      setIsPlaying(true);
    }, 4000);
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
          {!showContent && !isComplete && !showStartingState && !showIntro && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center px-6 max-w-lg"
            >
              <motion.img
                src={charlieLogo}
                alt="CharlieAI"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
                className="w-26 h-26 md:w-32 md:h-32 mb-5"
              />
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
                className="text-5xl md:text-6xl font-extrabold mb-4 whitespace-nowrap"
                style={{ 
                  lineHeight: 1.15,
                  background: 'linear-gradient(135deg, #1D1D1F 0%, #3A3A3C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}
              >
                Welcome to CharlieAI
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
                className="text-base md:text-lg leading-relaxed max-w-md"
                style={{ color: '#6E6E73' }}
              >
                Streamline scheduling, handle patient calls after-hours, and free up your staff to focus on what truly matters—patient care.
              </motion.p>
              {isLoading && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 text-sm"
                  style={{ color: '#86868B' }}
                >
                  Loading audio...
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Intro scene — sets the stage before audio starts */}
          {showIntro && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center max-w-lg px-4"
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
                className="text-3xl md:text-4xl font-semibold leading-snug"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
                  color: '#1D1D1F',
                }}
              >
                A call comes in
                <br />
                <span style={{ color: '#86868B' }}>after hours or on a holiday.</span>
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.7, ease: 'easeOut' }}
                className="text-3xl md:text-4xl font-extrabold mt-5 leading-snug"
                style={{ 
                  color: ALOHA_BLUE,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
                }}
              >
                CharlieAI answers 24/7.
              </motion.p>
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
            <div className="flex flex-col items-center gap-2.5 px-4">
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center max-w-lg px-4"
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
                className="text-3xl md:text-4xl font-semibold leading-snug"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
                  color: '#1D1D1F',
                }}
              >
                Ready to get started?
                <br />
                <span style={{ color: '#86868B' }}>Book a demo today.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.7, ease: 'easeOut' }}
                className="mt-12"
              >
                <Button
                  size="lg"
                  className="rounded-xl px-12 py-6 text-white border-0 text-lg font-semibold no-default-hover-elevate no-default-active-elevate"
                  style={{
                    background: 'linear-gradient(135deg, #5AB0FF 0%, #3A8EF6 40%, #2D7BE5 100%)',
                    boxShadow: '0 4px 15px rgba(42, 123, 229, 0.35), 0 1px 3px rgba(0, 0, 0, 0.1)',
                    minWidth: '260px',
                  }}
                  onClick={() => window.open('https://aloha.com/demo', '_blank')}
                  data-testid="button-book-demo"
                >
                  Book a Demo
                </Button>
                <button
                  onClick={handleReplay}
                  className="mt-4 text-sm font-medium flex items-center gap-1.5 mx-auto"
                  style={{ color: '#86868B' }}
                  data-testid="button-replay"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Replay Demo
                </button>
              </motion.div>
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

          {/* Debug time display — hidden, kept for future use */}
          {false && showContent && (
            <div className="mb-2 text-xs font-mono text-gray-400" data-testid="text-debug-time">
              {currentTime.toFixed(2)}s | Line {currentMessage?.id || '-'}: {currentMessage?.speaker || '-'}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4" style={{ visibility: (showIntro || isComplete) ? 'hidden' : 'visible' }}>
          {isComplete ? (
            null
          ) : (
            <>
              {hasStartedOnce && (isPlaying || showContent) ? (
                <Button 
                  size="lg" 
                  onClick={handleSkip}
                  className="rounded-full px-8 shadow-lg border-0 text-white transition-all gap-2"
                  style={{ backgroundColor: ALOHA_BLUE }}
                  data-testid="button-skip"
                >
                  <SkipForward className="w-5 h-5" />
                  Skip Demo
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  onClick={handlePlay}
                  disabled={isLoading || showStartingState}
                  className={cn(
                    "rounded-full px-8 shadow-lg border-0 text-white transition-all gap-2",
                    (isLoading || showStartingState) && "opacity-50 cursor-not-allowed"
                  )}
                  style={{ backgroundColor: ALOHA_BLUE }}
                  data-testid="button-play-pause"
                >
                  {isLoading || showStartingState ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  Play Demo
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
