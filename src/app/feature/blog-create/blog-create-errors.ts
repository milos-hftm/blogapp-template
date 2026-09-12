import { Component, input } from '@angular/core';
import type { FieldState } from '@angular/forms/signals';

@Component({
  selector: 'app-blog-create-errors',
  template: `
    @if (field().touched() && field().invalid()) {
      <ul class="field-errors">
        @for (error of field().errors(); track error.kind) {
          <li>{{ error.message }}</li>
        }
      </ul>
    }
  `,
  styles: `
    .field-errors {
      margin: -4px 0 0;
      padding-left: 24px;
      color: var(--mat-sys-error);
      font-size: 0.875rem;
    }
  `,
})
export class BlogCreateErrors {
  readonly field = input.required<FieldState<string>>();
}
