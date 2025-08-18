import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** Обёртка ответа API */
export interface ApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Модель /api/general */
export interface General {
  id: number;
  name: string;
  address: string;
  inn: string;
  kpp: string;
  ogrn: string;
  bank: string;
  bik: string;
  rs: string;
  ks: string;
  okpo: string;
  director: string;
  edo_id: string;
}

/** Модель /api/details (дополни при необходимости) */
export interface Detail {
  id: number;
  department: string;
  email: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getGeneral(
    page = 1,
    pageSize = 10,
    sort: 'id' | 'name' = 'id',
    order: 'asc' | 'desc' = 'asc',
    search = ''
  ): Observable<ApiResponse<General>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize))
      .set('sort', sort)
      .set('order', order)
      .set('search', search);

    return this.http.get<ApiResponse<General>>(`${this.baseUrl}/general`, { params });
  }

  getDetails(
    page = 1,
    pageSize = 10,
    sort: 'id' | 'department' | 'email' = 'id',
    order: 'asc' | 'desc' = 'asc',
    search = ''
  ): Observable<ApiResponse<Detail>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize))
      .set('sort', sort)
      .set('order', order)
      .set('search', search);

    return this.http.get<ApiResponse<Detail>>(`${this.baseUrl}/details`, { params });
  }
}
