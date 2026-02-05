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
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { demoConversation, statusCards, demoDuration, type ChatMessage, type StatusCard } from '@/lib/demo-script';
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

function StatusCardComponent({ card }: { card: StatusCard }) {
  const Icon = iconMap[card.icon] || CheckCircle;
  
  const colorClasses = {
    default: 'bg-slate-800/80 border-slate-700/50',
    success: 'bg-slate-800/80 border-emerald-500/40',
    warning: 'bg-slate-800/80 border-amber-500/40',
    info: 'bg-slate-800/80 border-violet-500/40',
  };

  const iconColorClasses = {
    default: 'text-slate-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    info: 'text-violet-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-md shadow-lg',
        colorClasses[card.color || 'default']
      )}
      data-testid={`status-card-${card.id}`}
    >
      <div className={cn('flex-shrink-0', iconColorClasses[card.color || 'default'])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide leading-tight">{card.label}</span>
        <span className="text-xs font-semibold text-white leading-tight">{card.value}</span>
      </div>
    </motion.div>
  );
}

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const visibleCards = statusCards.filter(c => c.timestamp <= currentTime);
  
  const currentMessage = demoConversation
    .filter(m => m.timestamp <= currentTime)
    .pop();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsComplete(true);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!hasStarted) {
      setHasStarted(true);
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying, hasStarted]);

  const handleSkip = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
    setCurrentTime(demoDuration);
    setIsComplete(true);
    setHasStarted(true);
  }, []);

  const handleReplay = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
    setCurrentTime(0);
    setIsPlaying(true);
    setIsComplete(false);
    setHasStarted(true);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 flex flex-col relative overflow-hidden">
      <audio ref={audioRef} src="/audio/demo-call.mp3" preload="auto" />
      
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* Mute button - top right */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full"
          onClick={toggleMute}
          data-testid="button-mute"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full text-xs"
          asChild
          data-testid="button-embed-info"
        >
          <a href="/instructions">Embed</a>
        </Button>
      </div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
        
        {/* Pre-start state */}
        {!hasStarted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center max-w-lg"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/40">
                <Phone className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-slate-900 shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Hear Charlie in Action
            </h1>
            <p className="text-slate-400 mb-2">
              For the full experience, ensure your volume is on.
            </p>
            <p className="text-sm text-violet-400 mb-8 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              This audio has NOT been edited.
            </p>
            
            <Button 
              size="lg" 
              onClick={handlePlay}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-lg px-8 py-6 rounded-full shadow-xl shadow-purple-500/30 border-0"
              data-testid="button-start-demo"
            >
              <Play className="w-6 h-6 mr-2" />
              See it in Action
            </Button>
          </motion.div>
        )}

        {/* Playing state */}
        {hasStarted && !isComplete && (
          <div className="flex flex-col items-center justify-end flex-1 w-full max-w-3xl mx-auto pb-8">
            {/* Spacer to push content down */}
            <div className="flex-1" />
            
            {/* Status cards - centered, horizontal wrap */}
            <div className="flex flex-wrap justify-center gap-2 mb-6 px-4">
              <AnimatePresence>
                {visibleCards.slice(-6).map(card => (
                  <StatusCardComponent key={card.id} card={card} />
                ))}
              </AnimatePresence>
            </div>
            
            {/* Current transcript line - centered at bottom, smaller text */}
            <div className="w-full px-4 mb-6 min-h-[80px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {currentMessage && (
                  <motion.p
                    key={currentMessage.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-base md:text-lg text-white/90 text-center leading-relaxed max-w-2xl"
                  >
                    {currentMessage.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Button 
                size="lg" 
                onClick={handlePlay}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-xl shadow-purple-500/30 border-0"
                data-testid="button-play-pause"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleSkip}
                className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full px-6"
                data-testid="button-skip"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip Demo
              </Button>
            </div>
          </div>
        )}

        {/* Complete state */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Sound effective?
            </h2>
            <p className="text-slate-400 mb-8">
              Want to see behind the curtain?
            </p>
            <div className="flex gap-4">
              <Button
                onClick={handleReplay}
                variant="outline"
                className="border-slate-700 text-white hover:bg-slate-800 rounded-full px-6"
                data-testid="button-replay"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Replay Demo
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
