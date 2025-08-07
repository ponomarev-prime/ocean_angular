import { Component, OnInit, inject } from '@angular/core';
import { Api } from '../../services/api';
import { HttpClientModule } from '@angular/common/http';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-general-table',
  standalone: true,
  imports: [HttpClientModule, NgIf],
  templateUrl: './general-table.html',
  styleUrl: './general-table.scss'
})
export class GeneralTable implements OnInit {
  private api = inject(Api);
  org: any = null;

  ngOnInit() {
    this.api.getGeneral(1, 1).subscribe(res => {
      this.org = res.data && res.data.length ? res.data[0] : null;
    });
  }
}
