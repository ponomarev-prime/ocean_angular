import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  getGeneral(page = 1, pageSize = 10, sort = 'id', order = 'asc', search = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('sort', sort)
      .set('order', order)
      .set('search', search);
    return this.http.get(`${this.baseUrl}/general`, { params });
  }

  getDetails(page = 1, pageSize = 10, sort = 'id', order = 'asc', search = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('sort', sort)
      .set('order', order)
      .set('search', search);
    return this.http.get(`${this.baseUrl}/details`, { params });
  }
}
