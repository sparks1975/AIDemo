import { useEffect, useState } from 'react';
import DemoPage from './demo';

// This is a wrapper for embedding the demo in an iframe
// It listens for postMessage events from the parent window
export default function EmbedPage() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Listen for messages from parent window (WordPress)
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'DEMO_VISIBILITY') {
        setIsVisible(event.data.visible);
      }
      if (event.data.type === 'START_DEMO') {
        setIsVisible(true);
      }
      if (event.data.type === 'CLOSE_DEMO') {
        setIsVisible(false);
        // Notify parent that demo was closed
        window.parent.postMessage({ type: 'DEMO_CLOSED' }, '*');
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify parent that iframe is ready
    window.parent.postMessage({ type: 'DEMO_READY' }, '*');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return <DemoPage />;
}
