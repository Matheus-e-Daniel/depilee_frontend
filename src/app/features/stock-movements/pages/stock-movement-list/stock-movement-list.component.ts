import { UtcDatePipe } from '../../../../shared/pipes/utc-date.pipe';
import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { StockMovementService } from '../../services/stock-movement.service';
import { StockMovement, EStockMovementType } from '../../models/stock-movement.model';
import { ProductService } from '../../../products/services/product.service';
import { Product } from '../../../products/models/product.model';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';

@Component({
  selector: 'app-stock-movement-list',
  standalone: true,
  imports: [UtcDatePipe, 
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    InputTextModule
  ],
  templateUrl: './stock-movement-list.component.html',
  styleUrls: ['./stock-movement-list.component.scss']
})
export class StockMovementListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private stockMovementService = inject(StockMovementService);
  private productService = inject(ProductService);
  private errorModalService = inject(ErrorModalService);

  readonly EStockMovementType = EStockMovementType;

  movements = signal<StockMovement[]>([]);
  products = signal<Product[]>([]);
  loading = signal(true);
  searchTerm = signal('');

  filteredMovements = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) return this.movements();

    return this.movements().filter(m =>
      this.getProductName(m).toLowerCase().includes(search) ||
      (m.reason || '').toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    this.loadProducts();
    this.loadMovements();
  }

  private loadProducts(): void {
    this.productService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => this.products.set(response.data),
      error: (err) => this.errorModalService.show(err.error?.message || 'Falha ao carregar produtos')
    });
  }

  loadMovements(): void {
    this.loading.set(true);
    this.stockMovementService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.movements.set(response.data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status !== 404) {
          this.errorModalService.show(err.error?.message || 'Falha ao carregar movimentações de estoque');
        }
      }
    });
  }

  getProductName(movement: StockMovement): string {
    return this.products().find(p => p.id === movement.productId)?.name || `Produto #${movement.productId}`;
  }

  getTypeLabel(type: EStockMovementType): string {
    const labels: Record<EStockMovementType, string> = {
      [EStockMovementType.Entry]: 'Entrada',
      [EStockMovementType.Exit]: 'Saída',
      [EStockMovementType.Adjustment]: 'Ajuste',
      [EStockMovementType.Transfer]: 'Transferência',
      [EStockMovementType.Other]: 'Outro'
    };
    return labels[type] ?? 'Desconhecido';
  }

  getTypeSeverity(type: EStockMovementType): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const severities: Record<EStockMovementType, 'success' | 'info' | 'warning' | 'danger' | 'secondary'> = {
      [EStockMovementType.Entry]: 'success',
      [EStockMovementType.Exit]: 'danger',
      [EStockMovementType.Adjustment]: 'warning',
      [EStockMovementType.Transfer]: 'info',
      [EStockMovementType.Other]: 'secondary'
    };
    return severities[type] ?? 'secondary';
  }
}
