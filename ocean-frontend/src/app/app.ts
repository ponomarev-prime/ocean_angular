import { Component } from '@angular/core';
import { GeneralTable } from './components/general-table/general-table';
import { DetailsTable } from './components/details-table/details-table';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GeneralTable, DetailsTable, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
