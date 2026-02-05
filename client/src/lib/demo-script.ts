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

// Sample conversation - update timestamps to match your audio
export const demoConversation: ChatMessage[] = [
  { id: 1, speaker: 'ai', text: "Hi, thank you for calling. How may I help you today?", timestamp: 0 },
  { id: 2, speaker: 'caller', text: "Hey, one of my teeth has been really hurting me for a few days and I wanted to come in and maybe get it checked.", timestamp: 4 },
  { id: 3, speaker: 'ai', text: "I'm sorry to hear that. Let's get you in for an emergency appointment. Will this be your first visit with us?", timestamp: 12 },
  { id: 4, speaker: 'caller', text: "Yes.", timestamp: 20 },
  { id: 5, speaker: 'ai', text: "All right. Let me check our schedule for you. The earliest we can see you is today at 4:30 in the evening. Does that work for you?", timestamp: 22 },
  { id: 6, speaker: 'caller', text: "Yeah, that works.", timestamp: 32 },
  { id: 7, speaker: 'ai', text: "Great, I have you down for today at 4:30 in the evening. Can I have your first name?", timestamp: 35 },
  { id: 8, speaker: 'caller', text: "Oh by the way, I have Medicaid. You take Medicaid, right?", timestamp: 42 },
  { id: 9, speaker: 'ai', text: "We actually don't accept Medicaid, but we do have a new patient emergency special for $49. Would you like to take advantage of it?", timestamp: 48 },
  { id: 10, speaker: 'caller', text: "Ok.", timestamp: 58 },
  { id: 11, speaker: 'ai', text: "Great. What's your first name and spelling?", timestamp: 60 },
  { id: 12, speaker: 'caller', text: "First name? Robert, last name Alexander.", timestamp: 64 },
  { id: 13, speaker: 'ai', text: "Thanks. What's your date of birth?", timestamp: 70 },
  { id: 14, speaker: 'caller', text: "Actually, wait, do you have anything tomorrow? I can't come in today.", timestamp: 74 },
  { id: 15, speaker: 'ai', text: "Sure thing. We have an opening tomorrow at 10 in the morning. Does that work for you?", timestamp: 80 },
  { id: 16, speaker: 'caller', text: "Yeah, let's do that. And, do you have parking?", timestamp: 88 },
  { id: 17, speaker: 'ai', text: "Yes, we have a parking lot right in front of our office. Your appointment is confirmed for tomorrow at 10 in the morning. What's your date of birth?", timestamp: 93 },
  { id: 18, speaker: 'caller', text: "July 14, 98.", timestamp: 105 },
  { id: 19, speaker: 'ai', text: "Is the number you're calling from the best number to reach you at?", timestamp: 109 },
  { id: 20, speaker: 'caller', text: "Yes.", timestamp: 115 },
  { id: 21, speaker: 'ai', text: "Great. After this call, you'll get a text with your appointment details. Is there anything else I can assist you with today?", timestamp: 117 },
  { id: 22, speaker: 'caller', text: "No, that's it. Thank you.", timestamp: 126 },
  { id: 23, speaker: 'ai', text: "Thank you for calling. Have a wonderful day.", timestamp: 129 },
];

// Status cards that appear during the conversation
export const statusCards: StatusCard[] = [
  { id: 'busy', icon: 'phone-missed', label: 'Front desk is busy', value: 'or call is after hours...', timestamp: 0, color: 'warning' },
  { id: 'pickup', icon: 'phone', label: 'AI picks up', value: '24/7...', timestamp: 2, color: 'success' },
  { id: 'request', icon: 'clipboard', label: 'Request Type', value: 'Emergency Exam', timestamp: 12, color: 'info' },
  { id: 'booking1', icon: 'calendar', label: 'Booking Time', value: 'Today, 4:30PM', timestamp: 28, color: 'default' },
  { id: 'insurance', icon: 'shield', label: 'Patient Insurance', value: 'Medicaid - Not Accepted', timestamp: 48, color: 'warning' },
  { id: 'offer', icon: 'tag', label: 'Special Offer', value: 'Emergency Special $49', timestamp: 55, color: 'success' },
  { id: 'patient', icon: 'user', label: 'Patient Information', value: 'Robert Alexander', timestamp: 68, color: 'info' },
  { id: 'booking2', icon: 'calendar-check', label: 'Updated Booking', value: 'Tomorrow, 10:00AM', timestamp: 88, color: 'success' },
  { id: 'dob', icon: 'cake', label: 'Date of Birth', value: 'July 14, 1998', timestamp: 107, color: 'info' },
  { id: 'sms', icon: 'message-square', label: 'Action', value: 'Sent SMS to patient', timestamp: 120, color: 'success' },
  { id: 'complete', icon: 'check-circle', label: 'Call Complete', value: 'Appointment Booked', timestamp: 130, color: 'success' },
];

// Total duration of the demo in seconds (update this to match your audio)
export const demoDuration = 135;
