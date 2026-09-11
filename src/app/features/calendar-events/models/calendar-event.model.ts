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

export const CATEGORY_COLOR_OPTIONS = [
  { label: 'Vermelho', value: '#ef4444' },
  { label: 'Laranja', value: '#f97316' },
  { label: 'Âmbar', value: '#f59e0b' },
  { label: 'Amarelo', value: '#eab308' },
  { label: 'Verde', value: '#10b981' },
  { label: 'Esmeralda', value: '#14b8a6' },
  { label: 'Azul', value: '#3b82f6' },
  { label: 'Índigo', value: '#6366f1' },
  { label: 'Roxo', value: '#8b5cf6' },
  { label: 'Rosa', value: '#ec4899' },
  { label: 'Cinza', value: '#64748b' },
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
  targetUserId?: number | null;
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
  targetUserId?: number | null;
}
