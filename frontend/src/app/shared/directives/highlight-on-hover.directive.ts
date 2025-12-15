import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appHighlightOnHover]'
})
export class HighlightOnHoverDirective {
  @Input() appHighlightOnHover: string | undefined;

  private originalBoxShadow: string | null = null;
  private originalTransform: string | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    // Sauvegarder les valeurs existantes pour ne pas casser le design Tailwind
    this.originalBoxShadow = this.el.nativeElement.style.boxShadow;
    this.originalTransform = this.el.nativeElement.style.transform;

    const customShadow =
      this.appHighlightOnHover ||
      '0 20px 25px -5px rgba(79, 70, 229, 0.25), 0 10px 10px -5px rgba(79, 70, 229, 0.15)';

    this.renderer.setStyle(this.el.nativeElement, 'boxShadow', customShadow);
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(-2px)');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 150ms ease-out');
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'boxShadow', this.originalBoxShadow || 'none');
    this.renderer.setStyle(this.el.nativeElement, 'transform', this.originalTransform || 'none');
  }
}


