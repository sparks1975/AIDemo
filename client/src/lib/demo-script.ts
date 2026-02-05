// Demo conversation script with timing
// Each entry has a timestamp (in seconds) when it should appear

export interface ChatMessage {
  id: number;
  speaker: 'ai' | 'caller';
  text: string;
  timestamp: number; // seconds into the audio
}

export interface BadgeUpdate {
  badgeId: string;
  icon: string;
  label: string;
  value: string;
  timestamp: number;
  color?: 'default' | 'success' | 'warning' | 'info';
}

export interface Badge {
  id: string;
  icon: string;
  label: string;
  value: string;
  color: 'default' | 'success' | 'warning' | 'info';
}

// Conversation transcript synced to audio
// Exact timecodes from verified transcript
export const demoConversation: ChatMessage[] = [
  { id: 1, speaker: 'ai', text: "Hello and thanks for calling Aloha. My name is Charlie, the AI receptionist. How can I help you today?", timestamp: 0 },
  { id: 2, speaker: 'caller', text: "Hi Charlie, my name's Megan. I'm new to town and I'm looking for a new chiropractor. Are you guys accepting new patients?", timestamp: 5.742 },
  { id: 3, speaker: 'ai', text: "Yes, we are accepting new patients. I can help you schedule an appointment. May I have your last name, please?", timestamp: 13.265 },
  { id: 4, speaker: 'caller', text: "Yes, it's Jones.", timestamp: 19.462 },
  { id: 5, speaker: 'ai', text: "Thank you. That's Jones, spelled J-O-N-E-S, correct?", timestamp: 21.758 },
  { id: 6, speaker: 'caller', text: "Yeah, you got it.", timestamp: 27.234 },
  { id: 7, speaker: 'ai', text: "Great. Could you please provide your date of birth?", timestamp: 28.921 },
  { id: 8, speaker: 'caller', text: "September 22nd, 1995.", timestamp: 31.935 },
  { id: 9, speaker: 'ai', text: "Thank you. Just to confirm, your date of birth is September 22nd, 1995. Is that correct?", timestamp: 35.411 },
  { id: 10, speaker: 'caller', text: "Yes.", timestamp: 42.518 },
  { id: 11, speaker: 'ai', text: "Thank you for your patience. We can proceed with scheduling your appointment. Do you have a specific date in mind, or would you like me to look for the earliest available time?", timestamp: 46.423 },
  { id: 12, speaker: 'caller', text: "I'm usually free Thursdays and Fridays, so how about let's check this Thursday?", timestamp: 54.088 },
  { id: 13, speaker: 'ai', text: "We have some available slots for this Thursday, October 9th. Here are a few options: 9:00 in the morning, 9:15 in the morning, 9:30 in the morning. Do any of these times work for you?", timestamp: 60.627 },
  { id: 14, speaker: 'caller', text: "9:30 should work, yeah.", timestamp: 71.772 },
  { id: 15, speaker: 'ai', text: "Your appointment is successfully scheduled for Thursday, October the 9th at 9:30 in the morning. Is there anything else I can assist you with today?", timestamp: 74.932 },
  { id: 16, speaker: 'caller', text: "No, that was everything. Thank you so much.", timestamp: 86.331 },
  { id: 17, speaker: 'ai', text: "You're welcome. Have a great day and we look forward to seeing you soon. Goodbye.", timestamp: 90.229 },
];

// Badge updates - each update modifies an existing badge or creates it
// Badges are identified by badgeId - same badgeId = update existing badge
export const badgeUpdates: BadgeUpdate[] = [
  // Call status badge - appears at start
  { badgeId: 'call', icon: 'phone', label: 'Call Status', value: 'Charlie answering...', timestamp: 0, color: 'success' },
  
  // Request type - after AI confirms accepting new patients
  { badgeId: 'request', icon: 'clipboard', label: 'Request', value: 'New Patient Booking', timestamp: 13.265, color: 'info' },
  
  // Patient badge - after caller says name
  { badgeId: 'patient', icon: 'user', label: 'Patient', value: 'Collecting info...', timestamp: 19.462, color: 'default' },
  // After caller confirms spelling
  { badgeId: 'patient', icon: 'user', label: 'Patient', value: 'Megan Jones', timestamp: 27.234, color: 'info' },
  // After caller confirms DOB
  { badgeId: 'patient', icon: 'user', label: 'Patient', value: 'Megan Jones • 09/22/1995', timestamp: 42.518, color: 'success' },
  
  // Appointment badge - after AI lists slots
  { badgeId: 'appointment', icon: 'calendar', label: 'Appointment', value: 'Thu Oct 9: 9:00, 9:15, 9:30 AM', timestamp: 60.627, color: 'info' },
  // After caller picks 9:30
  { badgeId: 'appointment', icon: 'calendar', label: 'Appointment', value: 'Thu Oct 9 @ 9:30 AM', timestamp: 71.772, color: 'info' },
  // After AI confirms booking
  { badgeId: 'appointment', icon: 'calendar-check', label: 'Appointment', value: 'Booked: Thu Oct 9 @ 9:30 AM', timestamp: 74.932, color: 'success' },
  
  // Call complete
  { badgeId: 'call', icon: 'check-circle', label: 'Call Status', value: 'Complete', timestamp: 97, color: 'success' },
];

// Total duration of the demo in seconds
export const demoDuration = 97;

// Helper to get current badge states at a given time
export function getBadgesAtTime(time: number): Badge[] {
  const badgeMap = new Map<string, Badge>();
  
  // Process all updates up to current time
  for (const update of badgeUpdates) {
    if (update.timestamp <= time) {
      badgeMap.set(update.badgeId, {
        id: update.badgeId,
        icon: update.icon,
        label: update.label,
        value: update.value,
        color: update.color || 'default',
      });
    }
  }
  
  // Return badges in order they first appeared
  const orderedIds = ['call', 'request', 'patient', 'appointment'];
  return orderedIds
    .filter(id => badgeMap.has(id))
    .map(id => badgeMap.get(id)!);
}
