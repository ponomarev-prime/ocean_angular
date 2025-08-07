import { Component, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { CaptchaComponent } from './components/captcha/captcha';
import { GeneralTable } from './components/general-table/general-table';
import { DetailsTable } from './components/details-table/details-table';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, CaptchaComponent, GeneralTable, DetailsTable],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ocean development');
  isCaptchaPassed = signal(false);

  onCaptchaSuccess() {
    this.isCaptchaPassed.set(true);
  }
}
