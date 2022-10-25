export enum PARTICIPANT_TYPE {
  REMOVE,
  DECLINE,
  MAYBE,
  ACCEPT
}

export type VolunteerCalendar = {
  allDay: number;
  allowDecline: number;
  allowMaybe: number;
  calendarId: number;
  color?: string;
  contentContainerId: number;
  description?: string;
  documents?: string;
  endDate: string;
  endTime?: string;
  forceJoin: number;
  images?: string;
  isPublic: number;
  location?: string;
  maxParticipants: string;
  participantInfo: string;
  participationMode: number;
  startDate: string;
  startTime?: string;
  timeZone: string;
  title: string;
  topics?: [number];
};
