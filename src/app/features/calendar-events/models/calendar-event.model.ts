// src/app/features/calendar-events/models/calendar-event.model.ts
export interface CalendarEvent {
  id: string;
  subject: string;
  description?: string | null;
  type: number; // 1, 2, 3 ou 4
  startDate?: string | null; // formato ISO: YYYY-MM-DDTHH:mm:ss
  endDate?: string | null; // formato ISO: YYYY-MM-DDTHH:mm:ss
  allDay: boolean;
  categoryColor: string;
  displayOrder?: number; // ordem de exibição para eventos no mesmo horário
}

export interface CalendarEventFormData {
  subject: string;
  description?: string | null;
  type: number;
  startDate?: string | null;
  endDate?: string | null;
  allDay: boolean;
  categoryColor: string;
}

export interface PagedResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  data: T[];
  message: string | null;
}
