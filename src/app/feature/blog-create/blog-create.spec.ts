import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Blog } from '../blog/blog';
import { BlogStateService } from '../blog/blog-state.service';
import { BlogCreateComponent } from './blog-create';

describe('BlogCreateComponent', () => {
  let fixture: ComponentFixture<BlogCreateComponent>;
  let createdBlog: Blog | undefined;

  const blogState = {
    loading: signal(false),
    createBlog: async (blog: Blog) => {
      createdBlog = blog;
      return true;
    },
  };

  beforeEach(async () => {
    createdBlog = undefined;
    blogState.loading.set(false);

    await TestBed.configureTestingModule({
      imports: [BlogCreateComponent],
      providers: [provideRouter([]), { provide: BlogStateService, useValue: blogState }],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogCreateComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show validation messages after fields are touched', async () => {
    touch('input');
    touch('textarea');

    fixture.detectChanges();
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Titel ist erforderlich');
    expect(text).toContain('Inhalt ist erforderlich');
  });

  it('should create a blog when the form is valid', async () => {
    setValue('input', 'Mein Blog');
    setValue('textarea', 'Das ist ein gueltiger Inhalt fuer den neuen Blog.');

    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(false);

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(createdBlog?.title).toBe('Mein Blog');
    expect(createdBlog?.category).toBe('general');
  });

  function setValue(selector: string, value: string): void {
    const element = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function touch(selector: string): void {
    const element = fixture.nativeElement.querySelector(selector) as HTMLElement;
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }
});
