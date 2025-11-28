import { ProductCategory, ProductBrand } from '../interfaces/product.interface';

// Mock data para desenvolvimento
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 1, name: 'Medicamento' },
  { id: 2, name: 'Equipamento' },
  { id: 3, name: 'Consumível' },
  { id: 4, name: 'Material Hospitalar' },
  { id: 5, name: 'Outros' }
];

export const PRODUCT_BRANDS: ProductBrand[] = [
  { id: 1, name: 'Johnson & Johnson' },
  { id: 2, name: 'Pfizer' },
  { id: 3, name: 'Roche' },
  { id: 4, name: 'Novartis' },
  { id: 5, name: 'Merck' },
  { id: 6, name: 'Sem Marca' }
];

export const PRODUCT_STATUS = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' }
];

export function getCategoryName(categoryId: number): string {
  const category = PRODUCT_CATEGORIES.find(cat => cat.id === categoryId);
  return category ? category.name : 'Desconhecida';
}

export function getBrandName(brandId: number): string {
  const brand = PRODUCT_BRANDS.find(b => b.id === brandId);
  return brand ? brand.name : 'Desconhecida';
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Calcular margem de lucro
export function calculateProfitMargin(cost: number, salePrice: number): number {
  if (cost === 0) return 0;
  return ((salePrice - cost) / cost) * 100;
}
