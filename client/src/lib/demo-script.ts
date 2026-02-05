// Demo conversation script with timing
// Each entry has a timestamp (in seconds) when it should appear

export interface ChatMessage {
  id: number;
  speaker: 'ai' | 'caller';
  text: string;
  timestamp: number; // seconds into the audio
}

export interface StatusCard {
  id: string;
  icon: string;
  label: string;
  value: string;
  timestamp: number; // when to show this card
  color?: 'default' | 'success' | 'warning' | 'info';
}

// Conversation transcript synced to your audio
export const demoConversation: ChatMessage[] = [
  { id: 1, speaker: 'ai', text: "Hello and thanks for calling Aloha, my name is Charlie, the AI receptionist. How can I help you today?", timestamp: 0 },
  { id: 2, speaker: 'caller', text: "Hi Charlie, my name's Megan, I am new to town and I'm looking for a new chiropractor. Are you guys accepting new patients?", timestamp: 8 },
  { id: 3, speaker: 'ai', text: "Yes, we are accepting new patients. I can help you schedule an appointment. May I have your last name, please?", timestamp: 15 },
  { id: 4, speaker: 'caller', text: "Yeah, it's Jones.", timestamp: 21 },
  { id: 5, speaker: 'ai', text: "Thank you. That's Jones, spelled J-O-N-E-S, correct?", timestamp: 23 },
  { id: 6, speaker: 'caller', text: "Yeah, you got it.", timestamp: 28 },
  { id: 7, speaker: 'ai', text: "Great. Could you please provide your date of birth?", timestamp: 29 },
  { id: 8, speaker: 'caller', text: "September 22nd, 1995.", timestamp: 31 },
  { id: 9, speaker: 'ai', text: "Thank you. Just to confirm, your date of birth is September 22nd, 1995. Is that correct?", timestamp: 34 },
  { id: 10, speaker: 'caller', text: "Yes.", timestamp: 40 },
  { id: 11, speaker: 'ai', text: "Thank you for your patience. We can proceed with scheduling your appointment. Do you have a specific date in mind, or would you like me to look for the earliest available time?", timestamp: 41 },
  { id: 12, speaker: 'caller', text: "I'm usually free Thursdays and Fridays. So, how about let's check this Thursday?", timestamp: 52 },
  { id: 13, speaker: 'ai', text: "We have some available slots for this Thursday, October 9th. Here are a few options: 9:00 in the morning, 9:15 in the morning, 9:30 in the morning. Do any of these times work for you?", timestamp: 60 },
  { id: 14, speaker: 'caller', text: "9:30 should work, yeah.", timestamp: 72 },
  { id: 15, speaker: 'ai', text: "Your appointment is successfully scheduled for Thursday, October the 9th at 9:30 in the morning. Is there anything else I can assist you with today?", timestamp: 75 },
  { id: 16, speaker: 'caller', text: "No, that was everything. Thank you so much.", timestamp: 85 },
  { id: 17, speaker: 'ai', text: "You're welcome. Have a great day and we look forward to seeing you soon. Goodbye.", timestamp: 89 },
];

// Status cards that appear during the conversation
export const statusCards: StatusCard[] = [
  { id: 'pickup', icon: 'phone', label: 'AI Receptionist', value: 'Charlie answering...', timestamp: 0, color: 'success' },
  { id: 'request', icon: 'clipboard', label: 'Request Type', value: 'New Patient Booking', timestamp: 10, color: 'info' },
  { id: 'patient', icon: 'user', label: 'Patient Name', value: 'Megan Jones', timestamp: 23, color: 'info' },
  { id: 'dob', icon: 'cake', label: 'Date of Birth', value: 'Sept 22, 1995', timestamp: 34, color: 'info' },
  { id: 'scheduling', icon: 'calendar', label: 'Checking Schedule', value: 'Thursday availability...', timestamp: 55, color: 'default' },
  { id: 'slots', icon: 'clock', label: 'Available Times', value: '9:00, 9:15, 9:30 AM', timestamp: 62, color: 'info' },
  { id: 'booking', icon: 'calendar-check', label: 'Appointment Booked', value: 'Thu, Oct 9 @ 9:30 AM', timestamp: 75, color: 'success' },
  { id: 'complete', icon: 'check-circle', label: 'Call Complete', value: 'New patient scheduled', timestamp: 89, color: 'success' },
];

// Total duration of the demo in seconds
export const demoDuration = 95;
