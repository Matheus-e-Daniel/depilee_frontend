// src/app/features/calendar-events/calendar-events.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { CalendarEventService } from './services/calendar-event.service';
import { CalendarEvent } from './models/calendar-event.model';

interface TimeSlot {
  hour: string;
  displayHour: string;
}

interface DayColumn {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar-events',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    ToastModule,
    FormsModule
  ],
  providers: [MessageService],
  templateUrl: './calendar-events.component.html',
  styleUrls: ['./calendar-events.component.scss']
})
export class CalendarEventsComponent implements OnInit {
  private calendarEventService = inject(CalendarEventService);
  private messageService = inject(MessageService);

  // Calendário e datas
  selectedDate = signal<Date>(new Date());
  weekDays = signal<DayColumn[]>([]);

  // Slots de horário (6h às 22h)
  timeSlots: TimeSlot[] = [];

  // Dialog de novo evento
  showEventDialog = signal(false);
  isEditingEvent = signal(false);
  editingEventId: string | null = null;
  newEvent = {
    subject: '',
    description: '',
    type: 1,
    startDate: '',
    endDate: '',
    allDay: false,
    categoryColor: '#3b82f6'
  };

  // Campos auxiliares para o formulário
  eventDate: Date = new Date();
  eventStartTime: string = '09:00';
  eventEndTime: string = '10:00';

  // Drag and drop
  draggedEvent: CalendarEvent | null = null;
  dragOverEvent: CalendarEvent | null = null;

  // Loading
  loading = signal(false);

  ngOnInit(): void {
    this.initTimeSlots();
    this.updateWeekView();
    this.loadEvents();
  }

  private initTimeSlots(): void {
    for (let hour = 6; hour <= 22; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      this.timeSlots.push({
        hour: `${hourStr}:00`,
        displayHour: `${hour}:00`
      });
    }
  }

  updateWeekView(): void {
    const current = this.selectedDate();
    const startOfWeek = this.getStartOfWeek(current);
    const days: DayColumn[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      days.push({
        date: date,
        dayName: this.getDayName(date),
        dayNumber: date.getDate(),
        isToday: this.isToday(date),
        events: []
      });
    }

    this.weekDays.set(days);
    this.loadEvents();
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  private getDayName(date: Date): string {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  loadEvents(): void {
    const days = this.weekDays();
    if (days.length === 0) return;

    this.loading.set(true);
    this.calendarEventService.getAll().subscribe({
      next: (events) => {
        console.log('Eventos recebidos do backend:', events);
        this.distributeEventsToWeek(events);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar eventos:', error);
        this.loading.set(false);
      }
    });
  }

  private distributeEventsToWeek(events: CalendarEvent[]): void {
    const days = this.weekDays();
    days.forEach(day => day.events = []);

    console.log('Distribuindo eventos. Semana atual:', days.map(d => d.date.toDateString()));

    events.forEach(event => {
      if (event.startDate) {
        // Parse da data mantendo o fuso horário local (sem conversão UTC)
        const eventDate = this.parseLocalDate(event.startDate);
        console.log('Evento:', event.subject, 'Data do evento:', eventDate.toDateString());

        const day = days.find(d =>
          this.isSameDay(d.date, eventDate)
        );

        if (day) {
          console.log('Evento adicionado ao dia:', day.date.toDateString());
          day.events.push(event);
        } else {
          console.log('Evento não está na semana atual');
        }
      }
    });

    console.log('Dias com eventos:', days.filter(d => d.events.length > 0));
    this.weekDays.set([...days]);
  }

  openEventDialog(date: Date, time: string): void {
    this.isEditingEvent.set(false);
    this.editingEventId = null;
    this.eventDate = new Date(date);
    this.eventStartTime = time;
    this.eventEndTime = this.calculateEndTime(time);

    const startDateTime = this.combineDateAndTime(date, time);
    const endDateTime = this.combineDateAndTime(date, this.calculateEndTime(time));

    this.newEvent = {
      subject: '',
      description: '',
      type: 1,
      startDate: startDateTime,
      endDate: endDateTime,
      allDay: false,
      categoryColor: '#3b82f6'
    };
    this.showEventDialog.set(true);
  }

  openEditEventDialog(event: CalendarEvent, $event: Event): void {
    $event.stopPropagation();
    this.isEditingEvent.set(true);
    this.editingEventId = event.id;

    const startDate = this.parseLocalDate(event.startDate || new Date().toISOString());
    const endDate = this.parseLocalDate(event.endDate || new Date().toISOString());

    this.eventDate = startDate;
    this.eventStartTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
    this.eventEndTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

    this.newEvent = {
      subject: event.subject,
      description: event.description || '',
      type: event.type,
      startDate: event.startDate || '',
      endDate: event.endDate || '',
      allDay: event.allDay,
      categoryColor: event.categoryColor || '#3b82f6'
    };

    this.showEventDialog.set(true);
  }

  private calculateEndTime(startTime: string): string {
    const [hour] = startTime.split(':').map(Number);
    const endHour = Math.min(hour + 1, 22);
    return `${endHour.toString().padStart(2, '0')}:00`;
  }

  private combineDateAndTime(date: Date, time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hourStr = hour.toString().padStart(2, '0');
    const minuteStr = (minute || 0).toString().padStart(2, '0');
    // Retorna no formato ISO sem conversão de timezone
    return `${year}-${month}-${day}T${hourStr}:${minuteStr}:00`;
  }

  saveEvent(): void {
    if (!this.newEvent.subject.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Assunto do evento é obrigatório'
      });
      return;
    }

    // Atualiza as datas com base nos campos de data e hora
    this.newEvent.startDate = this.combineDateAndTime(this.eventDate, this.eventStartTime);
    this.newEvent.endDate = this.combineDateAndTime(this.eventDate, this.eventEndTime);

    this.loading.set(true);

    if (this.isEditingEvent() && this.editingEventId) {
      // Atualizar evento existente
      const updatedEvent: CalendarEvent = {
        id: this.editingEventId,
        ...this.newEvent
      };

      this.calendarEventService.update(updatedEvent).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Evento atualizado com sucesso!'
          });
          this.showEventDialog.set(false);
          this.loadEvents();
        },
        error: (error) => {
          console.error('Erro ao atualizar evento:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao atualizar evento'
          });
          this.loading.set(false);
        }
      });
    } else {
      // Criar novo evento
      this.calendarEventService.create(this.newEvent).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Evento criado com sucesso!'
          });
          this.showEventDialog.set(false);
          this.loadEvents();
        },
        error: (error) => {
          console.error('Erro ao criar evento:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao criar evento'
          });
          this.loading.set(false);
        }
      });
    }
  }

  deleteEvent(event: CalendarEvent, $event: Event): void {
    $event.stopPropagation();

    this.calendarEventService.delete(event.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Evento excluído com sucesso!'
        });
        this.loadEvents();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao excluir evento'
        });
      }
    });
  }

  // Drag and Drop
  onDragStart(event: CalendarEvent): void {
    this.draggedEvent = event;
  }

  onDragOver($event: DragEvent): void {
    $event.preventDefault();
  }

  onEventDragOver(event: CalendarEvent, $event: DragEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.dragOverEvent = event;
  }

  onEventDrop(targetEvent: CalendarEvent, $event: DragEvent): void {
    $event.preventDefault();
    $event.stopPropagation();

    if (!this.draggedEvent || this.draggedEvent.id === targetEvent.id) {
      this.dragOverEvent = null;
      return;
    }

    // Verificar se estão no mesmo horário
    const draggedStartDate = this.parseLocalDate(this.draggedEvent.startDate || '');
    const targetStartDate = this.parseLocalDate(targetEvent.startDate || '');

    if (!this.isSameDay(draggedStartDate, targetStartDate) ||
        draggedStartDate.getHours() !== targetStartDate.getHours()) {
      // Se não estão no mesmo horário, não faz nada
      this.dragOverEvent = null;
      this.draggedEvent = null;
      return;
    }

    // Trocar apenas a ordem de exibição (displayOrder)
    const tempOrder = this.draggedEvent.displayOrder || 0;

    const updatedDraggedEvent: CalendarEvent = {
      ...this.draggedEvent,
      displayOrder: targetEvent.displayOrder || 0
    };

    const updatedTargetEvent: CalendarEvent = {
      ...targetEvent,
      displayOrder: tempOrder
    };

    // Atualizar ambos os eventos
    this.loading.set(true);
    this.calendarEventService.update(updatedDraggedEvent).subscribe({
      next: () => {
        this.calendarEventService.update(updatedTargetEvent).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Eventos reordenados'
            });
            this.loadEvents();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Falha ao reordenar eventos'
            });
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao reordenar eventos'
        });
        this.loading.set(false);
      }
    });

    this.draggedEvent = null;
    this.dragOverEvent = null;
  }

  onDrop($event: DragEvent, date: Date, time: string): void {
    $event.preventDefault();

    if (!this.draggedEvent) return;

    // Se foi dropado sobre outro evento, não fazer nada (já foi tratado em onEventDrop)
    if (this.dragOverEvent) {
      this.dragOverEvent = null;
      return;
    }

    const startDateTime = this.combineDateAndTime(date, time);
    const endDateTime = this.combineDateAndTime(date, this.calculateEndTime(time));

    const updatedEvent: CalendarEvent = {
      ...this.draggedEvent,
      startDate: startDateTime,
      endDate: endDateTime
    };

    this.calendarEventService.update(updatedEvent).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Evento movido com sucesso!'
        });
        this.loadEvents();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao atualizar evento'
        });
      }
    });

    this.draggedEvent = null;
  }

  getEventsForSlot(day: DayColumn, time: string): CalendarEvent[] {
    return day.events
      .filter(event => {
        if (!event.startDate) return false;
        const startDate = this.parseLocalDate(event.startDate);
        const eventHour = `${startDate.getHours().toString().padStart(2, '0')}:00`;
        return eventHour === time;
      })
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  previousWeek(): void {
    const current = this.selectedDate();
    current.setDate(current.getDate() - 7);
    this.selectedDate.set(new Date(current));
    this.updateWeekView();
  }

  nextWeek(): void {
    const current = this.selectedDate();
    current.setDate(current.getDate() + 7);
    this.selectedDate.set(new Date(current));
    this.updateWeekView();
  }

  goToToday(): void {
    this.selectedDate.set(new Date());
    this.updateWeekView();
  }

  onDateSelect(date: Date): void {
    this.selectedDate.set(date);
    this.updateWeekView();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getEventStyle(event: CalendarEvent): any {
    return {
      'background-color': event.categoryColor || '#3b82f6',
      'border-left': `4px solid ${this.darkenColor(event.categoryColor || '#3b82f6')}`
    };
  }

  getEventStartTime(event: CalendarEvent): string {
    if (!event.startDate) return '';
    const date = this.parseLocalDate(event.startDate);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  getEventEndTime(event: CalendarEvent): string {
    if (!event.endDate) return '';
    const date = this.parseLocalDate(event.endDate);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  /**
   * Trunca a descrição para exibir no máximo 50 caracteres
   */
  truncateDescription(description: string): string {
    if (!description) return '';
    return description.length > 30 ? description.substring(0, 30) + '...' : description;
  }

  private darkenColor(color: string): string {
    // Simples escurecimento da cor
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Parse data ISO string mantendo o fuso horário local (Brasília)
   * Evita conversão automática de UTC
   */
  private parseLocalDate(dateString: string): Date {
    // Se a string já contém informação de timezone, remove
    const cleanDate = dateString.replace('Z', '').split('+')[0].split('-').slice(0, 3).join('-') +
                      'T' + dateString.split('T')[1]?.split('+')[0].split('Z')[0];

    // Parse manual para evitar conversão de timezone
    const parts = cleanDate.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (parts) {
      return new Date(
        parseInt(parts[1]), // year
        parseInt(parts[2]) - 1, // month (0-indexed)
        parseInt(parts[3]), // day
        parseInt(parts[4]), // hour
        parseInt(parts[5]), // minute
        parseInt(parts[6])  // second
      );
    }
    return new Date(dateString);
  }

  /**
   * Verifica se duas datas são do mesmo dia
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  getDialogTitle(): string {
    return this.isEditingEvent() ? 'Editar Evento' : 'Novo Evento';
  }
}
