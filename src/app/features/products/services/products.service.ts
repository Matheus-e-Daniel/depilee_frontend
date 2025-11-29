import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Product, ProductFormData } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'http://localhost:5093/v1/products';

  // Headers específicos para a API
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }),
      withCredentials: false
    };
  }

  constructor(private http: HttpClient) {}

  // GET - Listar todos os produtos
  getProducts(): Observable<Product[]> {
    console.log('🌐 API: Buscando produtos...');

    return this.http.get<Product[]>(this.apiUrl, this.getHttpOptions()).pipe(
      tap(products => {
        console.log('✅ API: Produtos carregados com sucesso!');
        console.log(`📦 Total de produtos: ${products.length}`);
      }),
      catchError(error => {
        console.error('❌ API: Erro ao carregar produtos:', error);
        return this.handleError(error);
      })
    );
  }

  // GET - Buscar produto por ID
  getProductById(id: number): Observable<Product> {
    console.log(`🔍 API: Buscando produto ID ${id}...`);
    const url = `${this.apiUrl}/${id}`;

    return this.http.get<Product>(url, this.getHttpOptions()).pipe(
      tap(product => {
        console.log('✅ API: Produto encontrado:', product);
      }),
      catchError(error => {
        console.error(`❌ API: Erro ao buscar produto ${id}:`, error);
        return this.handleError(error);
      })
    );
  }

  // POST - Criar novo produto COM FORMATO CORRETO
  createProduct(productData: ProductFormData): Observable<Product> {
    console.log('🚀 API: Criando novo produto...');

    // 👇 FORMATO EXATO que a API espera (baseado no seu curl)
    const apiPayload = {
      createdByUser: productData.createdByUser || 'system', // 👈 Campo obrigatório
      updatedByUser: productData.updatedByUser || 'system', // 👈 Campo obrigatório
      name: productData.name,
      description: productData.description || '',
      stock: productData.stock,
      cost: productData.cost,
      salePrice: productData.salePrice,
      brandId: productData.brandId || 0,
      categoryId: productData.categoryId || 0
    };

    console.log('📤 Payload enviado para API:', JSON.stringify(apiPayload, null, 2));

    return this.http.post<Product>(this.apiUrl, apiPayload, this.getHttpOptions()).pipe(
      tap(product => {
        console.log('✅ API: Produto criado com sucesso!');
        console.log('📝 Produto retornado:', product);
      }),
      catchError(error => {
        console.error('❌ API: Erro ao criar produto:', error);
        return this.handleError(error);
      })
    );
  }

  // PUT - Atualizar produto COM FORMATO CORRETO
  updateProduct(id: number, productData: ProductFormData): Observable<Product> {
    console.log(`✏️ API: Atualizando produto ID ${id}...`);
    const url = `${this.apiUrl}/${id}`;

    // 👇 FORMATO EXATO para atualização
    const apiPayload = {
      updatedByUser: productData.updatedByUser || 'system', // 👈 Campo obrigatório
      name: productData.name,
      description: productData.description || '',
      stock: productData.stock,
      cost: productData.cost,
      salePrice: productData.salePrice,
      brandId: productData.brandId || 0,
      categoryId: productData.categoryId || 0
    };

    console.log('📤 Payload enviado para API:', JSON.stringify(apiPayload, null, 2));

    return this.http.put<Product>(url, apiPayload, this.getHttpOptions()).pipe(
      tap(product => {
        console.log('✅ API: Produto atualizado com sucesso!');
        console.log('📝 Produto retornado:', product);
      }),
      catchError(error => {
        console.error(`❌ API: Erro ao atualizar produto ${id}:`, error);
        return this.handleError(error);
      })
    );
  }

  // DELETE - Excluir produto
  deleteProduct(id: number): Observable<void> {
    console.log(`🗑️ API: Excluindo produto ID ${id}...`);
    const url = `${this.apiUrl}/${id}`;

    return this.http.delete<void>(url, this.getHttpOptions()).pipe(
      tap(() => {
        console.log(`✅ API: Produto ${id} excluído com sucesso!`);
      }),
      catchError(error => {
        console.error(`❌ API: Erro ao excluir produto ${id}:`, error);
        return this.handleError(error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro desconhecido!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = this.getServerErrorMessage(error);
    }

    console.error('💥 ERRO DETALHADO:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: errorMessage,
      error: error.error
    });

    return throwError(() => new Error(errorMessage));
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Erro de CORS: Não foi possível conectar à API.';
      case 400:
        return 'Erro 400: Requisição inválida. Verifique os dados enviados.';
      case 401:
        return 'Erro 401: Não autorizado.';
      case 404:
        return 'Erro 404: Recurso não encontrado.';
      case 500:
        return 'Erro 500: Erro interno do servidor.';
      default:
        return `Erro ${error.status}: ${error.message || 'Erro desconhecido'}`;
    }
  }
}
