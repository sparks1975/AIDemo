# Aloha AI Receptionist Demo

## Overview
An interactive AI call demo widget showcasing Charlie, the AI receptionist for Aloha (chiropractor). The demo features:
- Synchronized audio playback with animated chat bubbles
- Real-time status cards showing call progress (patient info, scheduling, booking)
- Play/pause/skip controls with dark purple/violet theme
- Embeddable design for WordPress and other websites

## Current Demo Content
- **AI Receptionist:** Charlie
- **Caller:** Megan Jones (new patient)
- **Business:** Aloha (chiropractor)
- **Demo Length:** ~95 seconds

## Project Structure
```
client/
├── public/
│   └── audio/
│       └── demo-call.mp3      # Demo audio file
├── src/
│   ├── pages/
│   │   ├── demo.tsx           # Main demo player page
│   │   ├── embed.tsx          # Embeddable version for iframes
│   │   └── instructions.tsx   # Embed code instructions
│   └── lib/
│       └── demo-script.ts     # Conversation script with timestamps
```

## Routes
- `/` - Main demo page with full controls
- `/embed` - Embeddable version for iframes
- `/instructions` - Embed code and WordPress instructions

## Customizing the Demo
Edit `client/src/lib/demo-script.ts` to:
1. Update the `demoConversation` array with your transcript
2. Adjust `timestamp` values to match your audio timing
3. Modify `statusCards` to show relevant information
4. Update `demoDuration` to match your audio length

## Embedding on WordPress
1. Go to `/instructions` for copy-paste embed codes
2. Use the simple iframe embed for inline demos
3. Use the button launcher for modal-style demos

## Recent Changes
- Feb 2025: Updated with Aloha/Charlie demo, dark purple theme matching Arini.ai style
