import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CalendarEventService } from './services/calendar-event.service';
import { CalendarEvent, EEventStatus, EVENT_STATUS_OPTIONS } from './models/calendar-event.model';

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
    FormsModule
  ],
  templateUrl: './calendar-events.component.html',
  styleUrls: ['./calendar-events.component.scss']
})
export class CalendarEventsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private calendarEventService = inject(CalendarEventService);

  selectedDate = signal<Date>(new Date());
  weekDays = signal<DayColumn[]>([]);
 
  timeSlots: TimeSlot[] = [];

  statusOptions = EVENT_STATUS_OPTIONS;
  EEventStatus = EEventStatus;
 
  showEventDialog = signal(false);
  isEditingEvent = signal(false);
  editingEventId: string | null = null;
  newEvent = {
    subject: '',
    description: '',
    type: 1,
    status: EEventStatus.Pending,
    startDate: '',
    endDate: '',
    allDay: false,
    categoryColor: '#3b82f6'
  };

  eventDate: Date = new Date();
  eventStartTime: string = '09:00';
  eventEndTime: string = '10:00';

  draggedEvent: CalendarEvent | null = null;
  dragOverEvent: CalendarEvent | null = null;

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
    this.calendarEventService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (events) => {
        this.distributeEventsToWeek(events);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private distributeEventsToWeek(events: CalendarEvent[]): void {
    const days = this.weekDays();
    days.forEach(day => day.events = []);

    events.forEach(event => {
      if (event.startDate) {
        const eventDate = this.parseLocalDate(event.startDate);
        const day = days.find(d => this.isSameDay(d.date, eventDate));
        if (day) {
          day.events.push(event);
        }
      }
    });
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
      status: EEventStatus.Pending,
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
      status: event.status ?? EEventStatus.Pending,
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
    
    return `${year}-${month}-${day}T${hourStr}:${minuteStr}:00`;
  }

  saveEvent(): void {
    if (!this.newEvent.subject.trim()) {
      return;
    }

    this.newEvent.startDate = this.combineDateAndTime(this.eventDate, this.eventStartTime);
    this.newEvent.endDate = this.combineDateAndTime(this.eventDate, this.eventEndTime);

    this.loading.set(true);

    if (this.isEditingEvent() && this.editingEventId) {   
      const updatedEvent: CalendarEvent = {
        id: this.editingEventId,
        ...this.newEvent
      };

      this.calendarEventService.update(updatedEvent).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.showEventDialog.set(false);
          this.loadEvents();
        },
        error: () => {
          this.loading.set(false);
        }
      });
    } else {
      
      this.calendarEventService.create(this.newEvent).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.showEventDialog.set(false);
          this.loadEvents();
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }
  }

  deleteEvent(event: CalendarEvent, $event: Event): void {
    $event.stopPropagation();

    this.calendarEventService.delete(event.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loadEvents();
      },
      error: () => {
      }
    });
  }

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
 
    const draggedStartDate = this.parseLocalDate(this.draggedEvent.startDate || '');
    const targetStartDate = this.parseLocalDate(targetEvent.startDate || '');

    if (!this.isSameDay(draggedStartDate, targetStartDate) ||
        draggedStartDate.getHours() !== targetStartDate.getHours()) {   
      this.dragOverEvent = null;
      this.draggedEvent = null;
      return;
    }
    
    const tempOrder = this.draggedEvent.displayOrder || 0;

    const updatedDraggedEvent: CalendarEvent = {
      ...this.draggedEvent,
      displayOrder: targetEvent.displayOrder || 0
    };

    const updatedTargetEvent: CalendarEvent = {
      ...targetEvent,
      displayOrder: tempOrder
    };
    
    this.loading.set(true);
    this.calendarEventService.update(updatedDraggedEvent).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.calendarEventService.update(updatedTargetEvent).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            this.loadEvents();
          },
          error: () => {
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.loading.set(false);
      }
    });

    this.draggedEvent = null;
    this.dragOverEvent = null;
  }

  onDrop($event: DragEvent, date: Date, time: string): void {
    $event.preventDefault();

    if (!this.draggedEvent) return;
 
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

    this.calendarEventService.update(updatedEvent).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loadEvents();
      },
      error: () => {
      }
    });

    this.draggedEvent = null;
  }

  getEventsForSlot(day: DayColumn, time: string): CalendarEvent[] {   
    const normalEvents = day.events.filter(event => {
      if (!event.startDate) return false;
      if (event.allDay) return false;
      const startDate = this.parseLocalDate(event.startDate);
      const eventHour = `${startDate.getHours().toString().padStart(2, '0')}:00`;
      return eventHour === time;
    });
  
    const allDayEvent = day.events.find(event => event.allDay);
    
    const result: CalendarEvent[] = [];
    if (allDayEvent) result.push(allDayEvent);
    result.push(...normalEvents);
    return result.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
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
    
    const cleanDate = dateString.replace('Z', '').split('+')[0].split('-').slice(0, 3).join('-') +
                      'T' + dateString.split('T')[1]?.split('+')[0].split('Z')[0];
 
    const parts = cleanDate.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (parts) {
      return new Date(
        parseInt(parts[1]), 
        parseInt(parts[2]) - 1, 
        parseInt(parts[3]), 
        parseInt(parts[4]), 
        parseInt(parts[5]), 
        parseInt(parts[6])  
      );
    }
    return new Date(dateString);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  getDialogTitle(): string {
    return this.isEditingEvent() ? 'Editar Evento' : 'Novo Evento';
  }

  isFirstSlot(day: DayColumn, hour: string): boolean {
    const allDayEvent = day.events.find(event => event.allDay);
    if (!allDayEvent) return false;
    return hour === this.timeSlots[0].hour;
  }

  isMiddleSlot(day: DayColumn, hour: string): boolean {
    const allDayEvent = day.events.find(event => event.allDay);
    if (!allDayEvent) return false;
    const firstHour = this.timeSlots[0].hour;
    const lastHour = this.timeSlots[this.timeSlots.length - 1].hour;
    return hour !== firstHour && hour !== lastHour;
  }

  isLastSlot(day: DayColumn, hour: string): boolean {
    const allDayEvent = day.events.find(event => event.allDay);
    if (!allDayEvent) return false;
    return hour === this.timeSlots[this.timeSlots.length - 1].hour;
  }
}
