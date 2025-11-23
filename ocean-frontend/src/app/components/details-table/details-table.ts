import { Component, OnInit, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { HttpClientModule } from '@angular/common/http';
import { Api } from '../../services/api';

@Component({
  selector: 'app-details-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, HttpClientModule],
  templateUrl: './details-table.html',
  styleUrl: './details-table.scss'
})
export class DetailsTable implements OnInit {
  private api = inject(Api);
  displayedColumns: string[] = ['department', 'email', 'name'];
  dataSource: any[] = [];
  total = 0;
  pageSize = 10;
  pageIndex = 0;
  sort: 'id' | 'department' | 'email' = 'department';
  order: 'asc' | 'desc' = 'asc';
  search = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getDetails(this.pageIndex + 1, this.pageSize, this.sort, this.order, this.search).subscribe(res => {
      this.dataSource = res.data;
      this.total = res.total;
    });
  }

  onPaginate(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }


  onSort(event: any) {
    this.sort = event.active as 'id' | 'department' | 'email';
    this.order = (event.direction || 'asc') as 'asc' | 'desc';
    this.loadData();
  }
}
