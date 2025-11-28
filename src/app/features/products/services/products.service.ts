import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Product, ProductFormData } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'http://localhost:5000/api/products';

  // Mock data ATUALIZADO para o novo modelo
  private mockProducts: Product[] = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      description: 'Analgésico e antitérmico',
      stock: 100,
      cost: 5.50,
      salePrice: 15.90,
      brandId: 2,
      categoryId: 1,
      status: 'active',
      registrationDate: '2024-01-15T10:00:00.000Z',
      lastUpdate: '2024-01-15T10:00:00.000Z'
    },
    {
      id: 2,
      name: 'Curativo Band-Aid',
      description: 'Curativo adesivo para pequenos ferimentos',
      stock: 50,
      cost: 3.20,
      salePrice: 8.50,
      brandId: 1,
      categoryId: 3,
      status: 'active',
      registrationDate: '2024-01-10T14:30:00.000Z',
      lastUpdate: '2024-01-12T09:15:00.000Z'
    },
    {
      id: 3,
      name: 'Termômetro Digital',
      description: 'Termômetro digital infravermelho',
      stock: 15,
      cost: 45.00,
      salePrice: 89.90,
      brandId: 4,
      categoryId: 2,
      status: 'active',
      registrationDate: '2024-01-05T08:00:00.000Z',
      lastUpdate: '2024-01-05T08:00:00.000Z'
    },
    {
      id: 4,
      name: 'Máscara Descartável',
      description: 'Máscara cirúrgica descartável',
      stock: 0,
      cost: 8.00,
      salePrice: 25.00,
      brandId: 3,
      categoryId: 3,
      status: 'inactive',
      registrationDate: '2024-01-08T11:20:00.000Z',
      lastUpdate: '2024-01-20T16:45:00.000Z'
    },
  ];

  constructor(private http: HttpClient) {}

  // GET - Listar todos os produtos
  getProducts(): Observable<Product[]> {
    console.log('📦 SERVICE: Buscando lista de produtos...');

    // Em desenvolvimento, retorna mock data
    return of(this.mockProducts).pipe(delay(500));

    // Em produção, descomente:
    // return this.http.get<Product[]>(this.apiUrl);
  }

  // GET - Buscar produto por ID
  getProductById(id: number): Observable<Product> {
    console.log(`🔍 SERVICE: Buscando produto ID ${id}...`);

    const product = this.mockProducts.find(p => p.id === id);
    if (product) {
      console.log('✅ SERVICE: Produto encontrado:', product);
      return of(product).pipe(delay(300));
    } else {
      console.error(`❌ SERVICE: Produto com ID ${id} não encontrado`);
      throw new Error('Produto não encontrado');
    }

    // Em produção, descomente:
    // return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // POST - Criar novo produto
  createProduct(productData: ProductFormData): Observable<Product> {
    console.log('🚀 SERVICE: Criando novo produto...');
    console.log('📤 Dados recebidos:', productData);

    // Encontrar o próximo ID
    const nextId = this.mockProducts.length > 0
      ? Math.max(...this.mockProducts.map(p => p.id)) + 1
      : 1;

    const newProduct: Product = {
      id: nextId,
      ...productData,
      registrationDate: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };

    console.log('🆔 Novo ID gerado:', nextId);
    console.log('📝 Produto a ser criado:', newProduct);

    this.mockProducts.push(newProduct);

    console.log('✅ SERVICE: Produto criado com sucesso!');
    console.log('📊 Total de produtos agora:', this.mockProducts.length);

    return of(newProduct).pipe(delay(800));

    // Em produção, descomente:
    // return this.http.post<Product>(this.apiUrl, productData);
  }

  // PUT - Atualizar produto
  updateProduct(id: number, productData: ProductFormData): Observable<Product> {
    console.log(`✏️ SERVICE: Atualizando produto ID ${id}...`);
    console.log('📤 Dados recebidos:', productData);

    const index = this.mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      const updatedProduct: Product = {
        ...this.mockProducts[index],
        ...productData,
        lastUpdate: new Date().toISOString()
      };

      this.mockProducts[index] = updatedProduct;

      console.log('✅ SERVICE: Produto atualizado com sucesso!');
      console.log('📝 Produto atualizado:', updatedProduct);

      return of(updatedProduct).pipe(delay(800));
    } else {
      console.error(`❌ SERVICE: Produto com ID ${id} não encontrado para atualização`);
      throw new Error('Produto não encontrado');
    }

    // Em produção, descomente:
    // return this.http.put<Product>(`${this.apiUrl}/${id}`, productData);
  }

  // DELETE - Excluir produto
  deleteProduct(id: number): Observable<void> {
    console.log(`🗑️ SERVICE: Excluindo produto ID ${id}...`);

    const index = this.mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      const productName = this.mockProducts[index].name;
      this.mockProducts.splice(index, 1);

      console.log(`✅ SERVICE: Produto "${productName}" excluído com sucesso!`);
      console.log('📊 Total de produtos agora:', this.mockProducts.length);

      return of(void 0).pipe(delay(500));
    } else {
      console.error(`❌ SERVICE: Produto com ID ${id} não encontrado para exclusão`);
      throw new Error('Produto não encontrado');
    }

    // Em produção, descomente:
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // MÉTODO ADICIONAL: Buscar produtos por categoria (opcional)
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    console.log(`📂 SERVICE: Buscando produtos da categoria ID ${categoryId}...`);

    const filteredProducts = this.mockProducts.filter(
      product => product.categoryId === categoryId && product.status === 'active'
    );

    console.log(`✅ SERVICE: Encontrados ${filteredProducts.length} produtos na categoria`);

    return of(filteredProducts).pipe(delay(300));
  }

  // MÉTODO ADICIONAL: Buscar produtos por marca (opcional)
  getProductsByBrand(brandId: number): Observable<Product[]> {
    console.log(`🏷️ SERVICE: Buscando produtos da marca ID ${brandId}...`);

    const filteredProducts = this.mockProducts.filter(
      product => product.brandId === brandId && product.status === 'active'
    );

    console.log(`✅ SERVICE: Encontrados ${filteredProducts.length} produtos da marca`);

    return of(filteredProducts).pipe(delay(300));
  }
}
