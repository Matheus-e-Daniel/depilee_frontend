export enum EEventStatus {
  Done = 0,
  Pending = 1,
  Cancelled = 2,
  Other = 3,
}

export const EVENT_STATUS_OPTIONS = [
  { label: 'Concluído', value: EEventStatus.Done },
  { label: 'Pendente', value: EEventStatus.Pending },
  { label: 'Cancelado', value: EEventStatus.Cancelled },
  { label: 'Outro', value: EEventStatus.Other },
];

export interface CalendarEvent {
  id: string;
  subject: string;
  description?: string | null;
  type: number; // 1, 2, 3 ou 4
  startDate?: string | null; 
  endDate?: string | null;
  allDay: boolean;
  categoryColor: string;
  status?: EEventStatus;
  displayOrder?: number;
}

export interface CalendarEventFormData {
  subject: string;
  description?: string | null;
  type: number;
  startDate?: string | null;
  endDate?: string | null;
  allDay: boolean;
  categoryColor: string;
  status?: EEventStatus;
}

export interface PagedResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  data: T[];
  message: string | null;
}
