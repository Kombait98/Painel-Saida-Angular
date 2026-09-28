import { Pipe, PipeTransform, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: false
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private timer: any;
  constructor(private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone) {}

  transform(value: number): string {
    this.removeTimer();
    const d = new Date(value);
    const now = new Date();
    const seconds = Math.round(Math.abs((now.getTime() - d.getTime()) / 1000));
    
    const timeToUpdate = seconds < 60 ? 5000 : 30000;
    
    this.timer = this.ngZone.runOutsideAngular(() => {
      if (typeof window !== 'undefined') {
        return window.setTimeout(() => {
          this.ngZone.run(() => this.changeDetectorRef.markForCheck());
        }, timeToUpdate);
      }
      return null;
    });
    
    if (Number.isNaN(seconds)) return '';
    if (seconds <= 10) return 'agora mesmo';
    if (seconds < 60) return `há ${seconds} seg`;
    const minutes = Math.round(Math.abs(seconds / 60));
    if (minutes === 1) return 'há 1 min';
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.round(Math.abs(minutes / 60));
    return `há ${hours} horas`;
  }

  ngOnDestroy(): void {
    this.removeTimer();
  }
  
  private removeTimer() {
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
