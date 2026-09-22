import { Injectable, OnDestroy, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService implements OnDestroy {
  private readonly mobileQuery = '(max-width: 767px)';
  private readonly mediaQueryList =
    typeof window === 'undefined' ? null : window.matchMedia?.(this.mobileQuery);
  private readonly mobile = signal(this.mediaQueryList?.matches ?? false);
  private readonly handleMediaChange = (event: MediaQueryListEvent) => {
    this.mobile.set(event.matches);
  };

  readonly isMobile = this.mobile.asReadonly();

  constructor() {
    this.mediaQueryList?.addEventListener('change', this.handleMediaChange);
  }

  ngOnDestroy(): void {
    this.mediaQueryList?.removeEventListener('change', this.handleMediaChange);
  }
}
