import { Component, Output, EventEmitter, AfterViewInit, NgZone } from '@angular/core';

@Component({
  selector: 'app-captcha',
  standalone: true,
  templateUrl: './captcha.html',
  styleUrl: './captcha.scss',
  imports: []
})
export class CaptchaComponent implements AfterViewInit {
  @Output() success = new EventEmitter<void>();

  public sitekey = 'ysc1_DTC4szjWG6sQdMaDkGa86BVIehtJZxJidgonM5iP00ff5599';

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    // Проверяем появление токена в input внутри контейнера
    const observer = new MutationObserver(() => {
      const input = document.querySelector('#captcha-container input[name="smart-token"]') as HTMLInputElement;
      if (input && input.value) {
        observer.disconnect();
        // Можно отправить токен на backend для проверки, но для MVP сразу считаем успешным
        this.zone.run(() => this.success.emit());
      }
    });
    const container = document.getElementById('captcha-container');
    if (container) {
      observer.observe(container, { childList: true, subtree: true, attributes: true });
    }
  }
}
