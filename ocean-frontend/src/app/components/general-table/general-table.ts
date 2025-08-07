import { Component, OnInit, inject } from '@angular/core';
import { Api } from '../../services/api';
import { HttpClientModule } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-general-table',
  standalone: true,
  imports: [HttpClientModule, NgIf, NgFor, MatTableModule],
  templateUrl: './general-table.html',
  styleUrl: './general-table.scss'
})
export class GeneralTable implements OnInit {
  private api = inject(Api);
  fields: { label: string, value: string }[] = [];

  ngOnInit() {
    this.api.getGeneral(1, 1).subscribe(res => {
      const org = res.data && res.data.length ? res.data[0] : null;
      if (org) {
        this.fields = [
          { label: 'Название', value: org.name },
          { label: 'Юридический адрес', value: org.address },
          { label: 'ИНН', value: org.inn },
          { label: 'КПП', value: org.kpp },
          { label: 'ОГРН', value: org.ogrn },
          { label: 'Банк', value: org.bank },
          { label: 'БИК', value: org.bik },
          { label: 'Р/сч', value: org.rs },
          { label: 'К/сч', value: org.ks },
          { label: 'ОКПО', value: org.okpo },
          { label: 'Генеральный директор', value: org.director },
          { label: 'Идентификатор ЭДО (Диадок)', value: org.edo_id },
        ];
      }
    });
  }
}
