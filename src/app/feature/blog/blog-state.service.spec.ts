import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { Blog } from './blog';
import { BlogStateService } from './blog-state.service';
import { BlogService } from './blog.service';

describe('BlogStateService', () => {
  let service: BlogStateService;
  let blogService: {
    getBlogs: Mock<() => Promise<Blog[]>>;
    createBlog: Mock<(blog: Blog) => Promise<Blog>>;
    updateBlog: Mock<(id: string, blog: Blog) => Promise<Blog>>;
    deleteBlog: Mock<(id: string) => Promise<void>>;
  };

  beforeEach(() => {
    localStorage.clear();

    blogService = {
      getBlogs: vi.fn(),
      createBlog: vi.fn(),
      updateBlog: vi.fn(),
      deleteBlog: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: BlogService, useValue: blogService }],
    });

    service = TestBed.inject(BlogStateService);
  });

  it('should start with empty blogs array', () => {
    expect(service.blogs()).toEqual([]);
    expect(service.blogCount()).toBe(0);
    expect(service.loading()).toBe(false);
  });

  it('should update loading state while blogs are loaded', async () => {
    const blogsLoaded = createDeferred<Blog[]>();
    blogService.getBlogs.mockReturnValueOnce(blogsLoaded.promise);

    const loadPromise = service.loadBlogs();

    expect(service.loading()).toBe(true);

    blogsLoaded.resolve([createBlog(1)]);
    await loadPromise;

    expect(service.loading()).toBe(false);
    expect(service.blogs()).toHaveLength(1);
  });

  it('should calculate blog count after loading blogs', async () => {
    blogService.getBlogs.mockResolvedValueOnce([createBlog(1), createBlog(2), createBlog(3)]);

    await service.loadBlogs();

    expect(service.blogCount()).toBe(3);
  });

  it('should reactively update blog count when blogs change', async () => {
    blogService.getBlogs.mockResolvedValueOnce([createBlog(1), createBlog(2), createBlog(3)]);
    await service.loadBlogs();

    expect(service.blogCount()).toBe(3);

    blogService.getBlogs.mockResolvedValueOnce([]);
    await service.loadBlogs();

    expect(service.blogCount()).toBe(0);
  });
});

function createBlog(id: number): Blog {
  return {
    id,
    title: `Test Blog ${id}`,
    contentPreview: `Preview ${id}`,
    author: 'Test Autor',
    likes: id,
    comments: 0,
    likedByMe: false,
    createdByMe: false,
    createdAt: '2026-09-24T10:00:00.000Z',
    updatedAt: '2026-09-24T10:00:00.000Z',
  };
}

function createDeferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}
