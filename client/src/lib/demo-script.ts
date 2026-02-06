export interface ChatMessage {
  id: number;
  speaker: 'ai' | 'caller';
  text: string;
  timestamp: number;
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

export const demoConversation: ChatMessage[] = [
  { id: 1,  speaker: 'ai',     text: "Hello and thanks for calling Aloha. My name is Charlie, the AI receptionist. How can I help you today?", timestamp: 0 },
  { id: 2,  speaker: 'caller', text: "Hi Charlie, my name's Megan. I'm new to town and I'm looking for a new chiropractor. Are you guys accepting new patients?", timestamp: 6.29 },
  { id: 3,  speaker: 'ai',     text: "Yes, we are accepting new patients. I can help you schedule an appointment. May I have your last name, please?", timestamp: 14.32 },
  { id: 4,  speaker: 'caller', text: "Yes, it's Jones.", timestamp: 20.33 },
  { id: 5,  speaker: 'ai',     text: "Thank you. That's Jones, spelled J-O-N-E-S, correct?", timestamp: 22.67 },
  { id: 6,  speaker: 'caller', text: "Yeah, you got it.", timestamp: 26.95 },
  { id: 7,  speaker: 'ai',     text: "Great. Could you please provide your date of birth?", timestamp: 28.94 },
  { id: 8,  speaker: 'caller', text: "September 22nd, 1995.", timestamp: 32.47 },
  { id: 9,  speaker: 'ai',     text: "Thank you. Just to confirm, your date of birth is September 22nd, 1995. Is that correct?", timestamp: 35.62 },
  { id: 10, speaker: 'caller', text: "Yes.", timestamp: 41.72 },
  { id: 11, speaker: 'ai',     text: "Thank you for your patience. We can proceed with scheduling your appointment. Do you have a specific date in mind, or would you like me to look for the earliest available time?", timestamp: 43.36 },
  { id: 12, speaker: 'caller', text: "I'm usually free Thursdays and Fridays, so how about let's check this Thursday?", timestamp: 52.15 },
  { id: 13, speaker: 'ai',     text: "We have some available slots for this Thursday, October 9th. Here are a few options: 9:00 in the morning, 9:15 in the morning, 9:30 in the morning. Do any of these times work for you?", timestamp: 57.75 },
  { id: 14, speaker: 'caller', text: "9:30 should work, yeah.", timestamp: 69.66 },
  { id: 15, speaker: 'ai',     text: "Your appointment is successfully scheduled for Thursday, October the 9th at 9:30 in the morning. Is there anything else I can assist you with today?", timestamp: 72.21 },
  { id: 16, speaker: 'caller', text: "No, that was everything. Thank you so much.", timestamp: 80.71 },
  { id: 17, speaker: 'ai',     text: "You're welcome. Have a great day and we look forward to seeing you soon. Goodbye.", timestamp: 83.25 },
];

export const badgeUpdates: BadgeUpdate[] = [
  { badgeId: 'call', icon: 'phone', label: 'Call Status', value: 'Charlie answering...', timestamp: 0, color: 'success' },
  { badgeId: 'request', icon: 'clipboard', label: 'Request', value: 'New Patient Booking', timestamp: 14.32, color: 'info' },
  { badgeId: 'patient', icon: 'user', label: 'Patient', value: 'Collecting info...', timestamp: 20.33, color: 'default' },
  { badgeId: 'patient', icon: 'user', label: 'Patient', value: 'Megan Jones', timestamp: 26.95, color: 'info' },
  { badgeId: 'patient', icon: 'user', label: 'Patient', value: 'Megan Jones • 09/22/1995', timestamp: 41.72, color: 'success' },
  { badgeId: 'appointment', icon: 'calendar', label: 'Appointment', value: 'Thursday, October 9th', timestamp: 57.75, color: 'info' },
  { badgeId: 'appointment', icon: 'calendar', label: 'Appointment', value: 'Thu, Oct 9 @ 9:30 AM', timestamp: 69.66, color: 'info' },
  { badgeId: 'appointment', icon: 'calendar-check', label: 'Appointment', value: 'Booked: Thu, Oct 9 @ 9:30 AM', timestamp: 80.71, color: 'success' },
  { badgeId: 'call', icon: 'check-circle', label: 'Call Status', value: 'Complete', timestamp: 97, color: 'success' },
];

export const demoDuration = 97;

export function getBadgesAtTime(time: number): Badge[] {
  const badgeMap = new Map<string, Badge>();
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
  if (badgeMap.has('request') && badgeMap.has('call') && badgeMap.get('call')!.value !== 'Complete') {
    badgeMap.delete('call');
  }
  const orderedIds = ['call', 'request', 'patient', 'appointment'];
  return orderedIds
    .filter(id => badgeMap.has(id))
    .map(id => badgeMap.get(id)!);
}
