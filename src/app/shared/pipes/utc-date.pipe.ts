import { Pipe, PipeTransform } from '@angular/core';

// Backend grava timestamps em UTC mas serializa sem fuso; marca como UTC para o DatePipe converter para hora local.
@Pipe({ name: 'utc', standalone: true })
export class UtcDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string | null | undefined {
    if (!value || /(Z|[+-]\d{2}:\d{2})$/i.test(value)) return value;
    return `${value}Z`;
  }
}
