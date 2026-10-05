import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Blog } from '../../blog';
import { BlogCard } from './blog-card';

describe('BlogCard', () => {
  let component: BlogCard;
  let fixture: ComponentFixture<BlogCard>;

  const blog: Blog = {
    id: 1,
    title: 'Test Blog',
    contentPreview: 'Das ist ein Test-Preview.',
    author: 'Test Autor',
    likes: 3,
    comments: 1,
    likedByMe: false,
    createdByMe: false,
    headerImageUrl: 'https://example.com/image.jpg',
    createdAt: '2026-02-15T10:30:00',
    updatedAt: '2026-02-16T08:15:00',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('model', blog);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the blog title', () => {
    expect(fixture.nativeElement.textContent).toContain('Test Blog');
  });

  it('should emit the blog id when like is clicked', () => {
    const liked = vi.fn();
    component.liked.subscribe(liked);

    const likeButton = fixture.nativeElement.querySelector(
      'button[aria-label="Like"]',
    ) as HTMLButtonElement;
    likeButton.click();

    expect(liked).toHaveBeenCalledWith(1);
  });
});
