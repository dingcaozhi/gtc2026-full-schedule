export interface Session {
  session_id: string;
  title: string;
  time: string;
  date: string;
  speakers: string[];
  language: string;
  format: string;
  level: string;
  topic: string;
  sub_topic: string;
  description: string;
  additional_times?: { date: string; time: string }[];
}

export interface DayData {
  date: string;
  dayName: string;
  sessions: Session[];
}
