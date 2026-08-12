import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Blog } from '../blog/blog';
import { BlogService } from '../blog/blog.service';

import { BlogOverviewPage } from './blog-overview-page';

describe('BlogOverviewPage', () => {
  let component: BlogOverviewPage;
  let fixture: ComponentFixture<BlogOverviewPage>;

  const blogs: Blog[] = [
    {
      id: 1,
      title: 'Test Blog',
      contentPreview: 'Das ist ein Test-Preview.',
      content: 'Das ist ein Test-Preview.',
      author: 'Test Autor',
      likes: 3,
      comments: 1,
      likedByMe: false,
      createdByMe: false,
      createdAt: '2026-02-15T10:30:00',
      updatedAt: '2026-02-16T08:15:00',
    },
  ];

  const blogService = {
    getBlogs: async () => blogs,
    createBlog: async (blog: Blog) => blog,
    updateBlog: async (_id: string, blog: Blog) => blog,
    deleteBlog: async () => undefined,
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [BlogOverviewPage],
      providers: [provideRouter([]), { provide: BlogService, useValue: blogService }],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogOverviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load blogs', () => {
    expect(fixture.nativeElement.textContent).toContain('Test Blog');
    expect(fixture.nativeElement.textContent).toContain('1 Blog-Posts');
  });
});
