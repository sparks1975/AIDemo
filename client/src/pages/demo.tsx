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
  Headphones,
  Clock,
  Mail,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';
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
    default: 'bg-white/5 border-white/10',
    success: 'bg-emerald-500/10 border-emerald-500/30',
    warning: 'bg-amber-500/10 border-amber-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
  };

  const iconColorClasses = {
    default: 'text-white/60',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg border backdrop-blur-sm',
        colorClasses[card.color || 'default']
      )}
      data-testid={`status-card-${card.id}`}
    >
      <div className={cn('p-1.5 rounded-md bg-white/5', iconColorClasses[card.color || 'default'])}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">{card.label}</span>
        <span className="text-xs font-semibold text-white truncate">{card.value}</span>
      </div>
    </motion.div>
  );
}

function ChatBubble({ message, isLatest }: { message: ChatMessage; isLatest: boolean }) {
  const isAI = message.speaker === 'ai';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn('flex gap-2', isAI ? 'justify-start' : 'justify-end')}
      data-testid={`chat-message-${message.id}`}
    >
      {isAI && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Headphones className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed',
          isAI 
            ? 'bg-white/10 text-white rounded-tl-sm border border-white/5' 
            : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-tr-sm shadow-lg shadow-purple-500/20',
          isLatest && isAI && 'ring-1 ring-purple-400/30'
        )}
      >
        {message.text}
      </div>
      {!isAI && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
          <User className="w-3.5 h-3.5 text-white/70" />
        </div>
      )}
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
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const visibleMessages = demoConversation.filter(m => m.timestamp <= currentTime);
  const visibleCards = statusCards.filter(c => c.timestamp <= currentTime);
  const latestMessageId = visibleMessages.length > 0 ? visibleMessages[visibleMessages.length - 1].id : null;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [visibleMessages.length]);

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

  const progress = (currentTime / demoDuration) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex flex-col text-white">
      <audio ref={audioRef} src="/audio/demo-call.mp3" preload="auto" />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">AI Demo Call</h1>
            <p className="text-[10px] text-white/50">Interactive demonstration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
            onClick={toggleMute}
            data-testid="button-mute"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="text-white/70 hover:text-white hover:bg-white/10 text-xs h-8"
            data-testid="button-embed-info"
          >
            <Link href="/instructions">Embed</Link>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Status cards sidebar */}
        <aside className="lg:w-64 border-b lg:border-b-0 lg:border-r border-white/10 bg-black/20 p-3 overflow-y-auto max-h-48 lg:max-h-none">
          <h2 className="text-[10px] font-semibold text-white/40 mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Status
          </h2>
          <div className="space-y-2">
            <AnimatePresence>
              {visibleCards.map(card => (
                <StatusCardComponent key={card.id} card={card} />
              ))}
            </AnimatePresence>
            {visibleCards.length === 0 && !hasStarted && (
              <div className="text-center py-6 text-white/30 text-xs">
                Press play to start
              </div>
            )}
          </div>
        </aside>

        {/* Chat area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-black/10">
          {/* Chat messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {!hasStarted && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center px-4"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/40">
                    <Headphones className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-slate-950">
                    <Phone className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-2">Ready to Experience the Demo?</h2>
                <p className="text-white/50 text-sm max-w-sm mb-6">
                  Watch how AI handles a real call. Turn on your sound for the full experience.
                </p>
                <div className="flex items-center gap-2 text-xs text-white/40 mb-6">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>This audio has NOT been edited.</span>
                </div>
                <Button 
                  size="lg" 
                  onClick={handlePlay} 
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/30 border-0"
                  data-testid="button-start-demo"
                >
                  <Play className="w-5 h-5 mr-2" />
                  See it in Action
                </Button>
              </motion.div>
            )}

            {hasStarted && (
              <AnimatePresence>
                {visibleMessages.map(message => (
                  <ChatBubble 
                    key={message.id} 
                    message={message} 
                    isLatest={message.id === latestMessageId}
                  />
                ))}
              </AnimatePresence>
            )}

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center py-6"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 border border-emerald-500/30">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold mb-1">Demo Complete!</h3>
                <p className="text-white/50 text-xs text-center max-w-xs mb-4">
                  See how AI can handle your calls 24/7
                </p>
                <Button 
                  onClick={handleReplay} 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10 text-sm"
                  data-testid="button-replay"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                  Replay Demo
                </Button>
              </motion.div>
            )}
          </div>

          {/* Controls */}
          {hasStarted && (
            <div className="border-t border-white/10 bg-black/30 backdrop-blur-sm p-3">
              <div className="max-w-lg mx-auto">
                <div className="mb-3">
                  <Progress value={progress} className="h-1 bg-white/10" />
                  <div className="flex justify-between mt-1 text-[10px] text-white/40">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(demoDuration)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  {!isComplete ? (
                    <>
                      <Button 
                        size="lg" 
                        onClick={handlePlay}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-purple-500/30 border-0"
                        data-testid="button-play-pause"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={handleSkip}
                        className="text-white/60 hover:text-white hover:bg-white/10 text-xs"
                        data-testid="button-skip"
                      >
                        <SkipForward className="w-3.5 h-3.5 mr-1.5" />
                        Skip Demo
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="lg" 
                      onClick={handleReplay}
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-purple-500/30 border-0"
                      data-testid="button-replay-main"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
