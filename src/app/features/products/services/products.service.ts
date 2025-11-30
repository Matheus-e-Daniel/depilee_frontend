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

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      })
    };
  }

  constructor(private http: HttpClient) {
    console.log('🔧 ProductsService: Inicializado');
    console.log('🌐 API URL:', this.apiUrl);
  }

  // GET - Listar todos os produtos
  getProducts(): Observable<Product[]> {
    console.log('🌐 ProductsService: Buscando produtos...');

    return this.http.get<Product[]>(this.apiUrl, this.getHttpOptions()).pipe(
      tap(products => {
        console.log('✅ ProductsService: Produtos carregados com sucesso!');
        console.log(`📦 Total de produtos: ${products.length}`);
      }),
      catchError(error => {
        console.error('❌ ProductsService: Erro ao carregar produtos:', error);
        return this.handleError(error);
      })
    );
  }

  // GET - Buscar produto por ID
  getProductById(id: number): Observable<Product> {
    console.log(`🔍 ProductsService: Buscando produto ID ${id}...`);
    const url = `${this.apiUrl}/${id}`;

    return this.http.get<Product>(url, this.getHttpOptions()).pipe(
      tap(product => {
        console.log('✅ ProductsService: Produto encontrado:', product);
      }),
      catchError(error => {
        console.error(`❌ ProductsService: Erro ao buscar produto ${id}:`, error);
        return this.handleError(error);
      })
    );
  }

  // POST - Criar novo produto COM STATUS
  createProduct(productData: ProductFormData): Observable<Product> {
    console.log('🚀 ProductsService: Criando novo produto...');

    const apiPayload = {
      createdByUser: productData.createdByUser,
      updatedByUser: productData.updatedByUser,
      name: productData.name,
      description: productData.description || '',
      stock: Number(productData.stock),
      cost: Number(productData.cost),
      salePrice: Number(productData.salePrice),
      brandId: productData.brandId || 0,
      categoryId: productData.categoryId || 0,
      status: productData.status
    };

    console.log('📤 PAYLOAD COMPLETO enviado para API:');
    console.log('=========================================');
    console.log(JSON.stringify(apiPayload, null, 2));
    console.log('=========================================');

    return this.http.post<Product>(this.apiUrl, apiPayload, this.getHttpOptions()).pipe(
      tap(product => {
        console.log('✅ ProductsService: Produto criado com sucesso!');
        console.log('📝 Produto retornado:', product);
      }),
      catchError(error => {
        console.error('❌ ProductsService: Erro ao criar produto:', error);

        if (error.status === 400) {
          console.error('🔍 DETALHES DO ERRO 400:');
          console.error('Request rejeitado:', error.error);
          console.error('Payload enviado:', apiPayload);
        }

        return this.handleError(error);
      })
    );
  }

  // PUT - Atualizar produto COM STATUS
  updateProduct(id: number, productData: ProductFormData): Observable<Product> {
    console.log(`✏️ ProductsService: Atualizando produto ID ${id}...`);
    const url = `${this.apiUrl}/${id}`;

    const apiPayload = {
      updatedByUser: productData.updatedByUser,
      name: productData.name,
      description: productData.description || '',
      stock: Number(productData.stock),
      cost: Number(productData.cost),
      salePrice: Number(productData.salePrice),
      brandId: productData.brandId || 0,
      categoryId: productData.categoryId || 0,
      status: productData.status
    };

    console.log('📤 PAYLOAD COMPLETO para atualização:');
    console.log('=========================================');
    console.log(JSON.stringify(apiPayload, null, 2));
    console.log('=========================================');

    return this.http.put<Product>(url, apiPayload, this.getHttpOptions()).pipe(
      tap(product => {
        console.log('✅ ProductsService: Produto atualizado com sucesso!');
        console.log('📝 Produto retornado:', product);
      }),
      catchError(error => {
        console.error(`❌ ProductsService: Erro ao atualizar produto ${id}:`, error);
        return this.handleError(error);
      })
    );
  }

  // DELETE - Excluir produto
  deleteProduct(id: number): Observable<void> {
    console.log(`🗑️ ProductsService: Excluindo produto ID ${id}...`);
    const url = `${this.apiUrl}/${id}`;

    return this.http.delete<void>(url, this.getHttpOptions()).pipe(
      tap(() => {
        console.log(`✅ ProductsService: Produto ${id} excluído com sucesso!`);
      }),
      catchError(error => {
        console.error(`❌ ProductsService: Erro ao excluir produto ${id}:`, error);
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

    console.error('💥 ERRO DETALHADO ProductsService:', {
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
        return 'Erro de conexão: Não foi possível conectar à API.';
      case 400:
        return 'Erro 400: Requisição inválida. Verifique os dados enviados.';
      case 401:
        return 'Erro 401: Não autorizado. Faça login novamente.';
      case 403:
        return 'Erro 403: Acesso negado. Sem permissão.';
      case 404:
        return 'Erro 404: Recurso não encontrado.';
      case 500:
        return 'Erro 500: Erro interno do servidor.';
      default:
        return `Erro ${error.status}: ${error.message || 'Erro desconhecido'}`;
    }
  }
}
