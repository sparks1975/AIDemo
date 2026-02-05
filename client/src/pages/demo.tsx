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
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // Audio system latency compensation - UI waits this long before showing anything
  // This accounts for the delay between calling start() and actual sound output
  const AUDIO_LATENCY = 0.8; // 800ms buffer for audio to actually start playing
  
  // Only show content after audio has had time to actually start
  const audioHasStarted = isPlaying && currentTime > AUDIO_LATENCY;
  
  // Adjust the time for transcript/badge lookup to match what's actually playing
  // UI time is current time minus the latency buffer
  const uiTime = Math.max(0, currentTime - AUDIO_LATENCY);
  
  const currentBadges = audioHasStarted ? getBadgesAtTime(uiTime) : [];
  
  const currentMessage = audioHasStarted 
    ? demoConversation.filter(m => m.timestamp <= uiTime).pop()
    : null;

  // Load and decode audio on mount
  useEffect(() => {
    const controller = new AbortController();
    
    async function loadAndDecodeAudio() {
      try {
        // Create audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        // Create gain node for mute control
        const gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNodeRef.current = gainNode;
        
        // Fetch audio file
        const response = await fetch('/audio/demo-call.mp3', {
          signal: controller.signal
        });
        
        if (!response.ok) throw new Error('Failed to load audio');
        
        const reader = response.body?.getReader();
        const contentLength = Number(response.headers.get('Content-Length')) || 0;
        
        let receivedLength = 0;
        const chunks: Uint8Array[] = [];
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            chunks.push(value);
            receivedLength += value.length;
            
            if (contentLength > 0) {
              setLoadingProgress(Math.round((receivedLength / contentLength) * 80)); // 80% for download
            }
          }
        }
        
        // Combine chunks into array buffer
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const audioData = new Uint8Array(totalLength);
        let position = 0;
        for (const chunk of chunks) {
          audioData.set(chunk, position);
          position += chunk.length;
        }
        
        setLoadingProgress(85); // Start decoding
        
        // Decode audio data - this is the key step for instant playback
        const audioBuffer = await audioContext.decodeAudioData(audioData.buffer);
        audioBufferRef.current = audioBuffer;
        
        setLoadingProgress(100);
        setIsAudioReady(true);
        
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Audio load error:', err);
        }
      }
    }
    
    loadAndDecodeAudio();
    
    return () => {
      controller.abort();
      cancelAnimationFrame(animationFrameRef.current);
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update current time while playing
  const updateTime = useCallback(() => {
    if (!audioContextRef.current || !isPlaying) return;
    
    const elapsed = audioContextRef.current.currentTime - startTimeRef.current + pausedAtRef.current;
    setCurrentTime(elapsed);
    
    if (elapsed >= demoDuration) {
      setIsPlaying(false);
      setIsComplete(true);
      return;
    }
    
    animationFrameRef.current = requestAnimationFrame(updateTime);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying, updateTime]);

  const handlePlay = useCallback(() => {
    if (!audioContextRef.current || !audioBufferRef.current || !gainNodeRef.current || !isAudioReady) return;

    if (isPlaying) {
      // Pause
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      pausedAtRef.current = currentTime;
      setIsPlaying(false);
    } else {
      // Resume audio context if suspended (browser autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      // Create new source node (required for each play)
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(gainNodeRef.current);
      
      source.onended = () => {
        setIsPlaying(false);
        setIsComplete(true);
      };
      
      // Start playback and immediately set start time reference
      startTimeRef.current = audioContextRef.current.currentTime;
      source.start(0, pausedAtRef.current);
      sourceNodeRef.current = source;
      
      setIsPlaying(true);
    }
  }, [isPlaying, isAudioReady, currentTime]);

  const handleSkip = useCallback(() => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(demoDuration);
    setIsComplete(true);
  }, []);

  const handleReplay = useCallback(() => {
    if (!audioContextRef.current || !audioBufferRef.current || !gainNodeRef.current) return;
    
    // Stop current if playing
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch {}
    }
    
    // Reset
    pausedAtRef.current = 0;
    setCurrentTime(0);
    setIsComplete(false);
    
    // Resume context if needed
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    // Create new source
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(gainNodeRef.current);
    
    source.onended = () => {
      setIsPlaying(false);
      setIsComplete(true);
    };
    
    startTimeRef.current = audioContextRef.current.currentTime;
    source.start(0, 0);
    sourceNodeRef.current = source;
    
    setIsPlaying(true);
  }, []);

  const toggleMute = useCallback(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 1 : 0;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const isLoading = !isAudioReady;

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
        
        {/* Title - show when audio hasn't actually started */}
        {!audioHasStarted && !isComplete && (
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
              {isLoading 
                ? `Loading audio... ${loadingProgress}%` 
                : 'Press play to hear an actual AI call'}
            </p>
          </motion.div>
        )}
        
        {/* Badges - only when audio has actually started */}
        {audioHasStarted && !isComplete && (
          <div className="flex flex-col items-center gap-2 mb-6 px-4 min-h-[180px] justify-end">
            <AnimatePresence>
              {currentBadges.map(badge => (
                <BadgeComponent key={badge.id} badge={badge} />
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Transcript - only when audio has actually started */}
        {audioHasStarted && !isComplete && (
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
                disabled={!isAudioReady}
                className={cn(
                  "w-14 h-14 rounded-full shadow-lg border-0 text-white transition-all",
                  !isAudioReady && "opacity-50 cursor-not-allowed"
                )}
                style={{ backgroundColor: ALOHA_BLUE }}
                data-testid="button-play-pause"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </Button>
              {audioHasStarted && (
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
