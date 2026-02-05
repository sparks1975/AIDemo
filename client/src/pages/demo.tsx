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
  Headphones
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
};

function StatusCardComponent({ card }: { card: StatusCard }) {
  const Icon = iconMap[card.icon] || CheckCircle;
  
  const colorClasses = {
    default: 'bg-card border-card-border',
    success: 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-500/20',
    warning: 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/20',
    info: 'bg-blue-500/10 border-blue-500/30 dark:bg-blue-500/20',
  };

  const iconColorClasses = {
    default: 'text-muted-foreground',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm',
        colorClasses[card.color || 'default']
      )}
      data-testid={`status-card-${card.id}`}
    >
      <div className={cn('p-2 rounded-md bg-background/50', iconColorClasses[card.color || 'default'])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.label}</span>
        <span className="text-sm font-semibold truncate">{card.value}</span>
      </div>
    </motion.div>
  );
}

function ChatBubble({ message, isLatest }: { message: ChatMessage; isLatest: boolean }) {
  const isAI = message.speaker === 'ai';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn('flex gap-3', isAI ? 'justify-start' : 'justify-end')}
      data-testid={`chat-message-${message.id}`}
    >
      {isAI && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <Headphones className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isAI 
            ? 'bg-card border border-card-border rounded-tl-sm' 
            : 'bg-primary text-primary-foreground rounded-tr-sm',
          isLatest && 'ring-2 ring-primary/20'
        )}
      >
        {message.text}
      </div>
      {!isAI && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
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

  // Get visible messages and cards based on current time
  const visibleMessages = demoConversation.filter(m => m.timestamp <= currentTime);
  const visibleCards = statusCards.filter(c => c.timestamp <= currentTime);
  const latestMessageId = visibleMessages.length > 0 ? visibleMessages[visibleMessages.length - 1].id : null;

  // Auto-scroll chat to bottom when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [visibleMessages.length]);

  // Update current time while playing
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Hidden audio element */}
      <audio ref={audioRef} src="/audio/demo-call.mp3" preload="auto" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Phone className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">AI Demo Call</h1>
            <p className="text-xs text-muted-foreground">Interactive demonstration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMute}
            data-testid="button-mute"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Button variant="outline" size="sm" asChild data-testid="button-embed-info">
            <Link href="/instructions">Embed This Demo</Link>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Status cards sidebar */}
        <aside className="lg:w-80 border-b lg:border-b-0 lg:border-r bg-muted/30 p-4 overflow-y-auto">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            Live Call Status
          </h2>
          <div className="space-y-3">
            <AnimatePresence>
              {visibleCards.map(card => (
                <StatusCardComponent key={card.id} card={card} />
              ))}
            </AnimatePresence>
            {visibleCards.length === 0 && !hasStarted && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Press play to start the demo
              </div>
            )}
          </div>
        </aside>

        {/* Chat area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Chat messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {!hasStarted && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-6">
                  <Headphones className="w-10 h-10 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Ready to Experience the Demo?</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  Watch how the AI handles a real appointment booking call. 
                  Turn on your sound for the full experience.
                </p>
                <Button size="lg" onClick={handlePlay} data-testid="button-start-demo">
                  <Play className="w-5 h-5 mr-2" />
                  Start Demo
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
                className="flex flex-col items-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Demo Complete!</h3>
                <p className="text-muted-foreground text-sm text-center max-w-md mb-4">
                  See how AI can handle your calls 24/7, book appointments, 
                  and provide exceptional customer service.
                </p>
                <Button onClick={handleReplay} variant="outline" data-testid="button-replay">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Watch Again
                </Button>
              </motion.div>
            )}
          </div>

          {/* Controls */}
          {hasStarted && (
            <div className="border-t bg-background/80 backdrop-blur-sm p-4">
              <div className="max-w-2xl mx-auto">
                {/* Progress bar */}
                <div className="mb-4">
                  <Progress value={progress} className="h-1" />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(demoDuration)}</span>
                  </div>
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-center gap-4">
                  {!isComplete ? (
                    <>
                      <Button 
                        size="lg" 
                        onClick={handlePlay}
                        className="w-14 h-14 rounded-full"
                        data-testid="button-play-pause"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleSkip}
                        data-testid="button-skip"
                      >
                        <SkipForward className="w-4 h-4 mr-2" />
                        Skip Demo
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="lg" 
                      onClick={handleReplay}
                      className="w-14 h-14 rounded-full"
                      data-testid="button-replay-main"
                    >
                      <RotateCcw className="w-6 h-6" />
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
