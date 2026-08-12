import { computed, effect, Injectable, inject, signal } from '@angular/core';
import { Blog } from './blog';
import { BlogService } from './blog.service';

interface BlogState {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  selectedAuthor: string;
}

const selectedAuthorStorageKey = 'selectedAuthor';

@Injectable({
  providedIn: 'root',
})
export class BlogStateService {
  private readonly blogService = inject(BlogService);

  readonly #state = signal<BlogState>({
    blogs: [],
    loading: false,
    error: null,
    selectedAuthor: this.readSelectedAuthor(),
  });

  blogs = computed(() => this.#state().blogs);
  loading = computed(() => this.#state().loading);
  error = computed(() => this.#state().error);
  selectedAuthor = computed(() => this.#state().selectedAuthor);
  blogCount = computed(() => this.blogs().length);
  authors = computed(() => [...new Set(this.blogs().map((blog) => blog.author))].sort());
  filteredBlogs = computed(() => {
    const selectedAuthor = this.selectedAuthor();

    if (selectedAuthor === 'all') {
      return this.blogs();
    }

    return this.blogs().filter((blog) => blog.author === selectedAuthor);
  });

  constructor() {
    effect(() => {
      this.writeSelectedAuthor(this.selectedAuthor());
    });
  }

  async loadBlogs(): Promise<void> {
    this.#loadStarted();

    try {
      this.#loadSucceeded(await this.blogService.getBlogs());
    } catch {
      this.#loadFailed('Blog-Daten konnten nicht geladen werden.');
    }
  }

  async createBlog(blog: Blog): Promise<boolean> {
    this.#requestStarted();

    try {
      this.#blogCreated(await this.blogService.createBlog(blog));
      return true;
    } catch {
      this.#requestFailed('Blog konnte nicht gespeichert werden.');
      return false;
    }
  }

  async updateBlog(id: string, blog: Blog): Promise<boolean> {
    this.#requestStarted();

    try {
      this.#blogUpdated(await this.blogService.updateBlog(id, blog));
      return true;
    } catch {
      this.#requestFailed('Blog konnte nicht gespeichert werden.');
      return false;
    }
  }

  async deleteBlog(id: string): Promise<boolean> {
    this.#requestStarted();

    try {
      await this.blogService.deleteBlog(id);
      this.#blogDeleted(Number(id));
      return true;
    } catch {
      this.#requestFailed('Blog konnte nicht geloescht werden.');
      return false;
    }
  }

  setAuthor(author: string): void {
    this.#authorSelected(author);
  }

  toggleLike(blogId: number): void {
    this.#likeToggled(blogId);
  }

  #loadStarted(): void {
    this.#state.update((state) => ({ ...state, loading: true, error: null }));
  }

  #loadSucceeded(blogs: Blog[]): void {
    this.#state.update((state) => ({ ...state, blogs, loading: false }));
  }

  #loadFailed(message: string): void {
    this.#state.update((state) => ({ ...state, error: message, loading: false }));
  }

  #requestStarted(): void {
    this.#state.update((state) => ({ ...state, loading: true, error: null }));
  }

  #requestFailed(message: string): void {
    this.#state.update((state) => ({ ...state, error: message, loading: false }));
  }

  #blogCreated(blog: Blog): void {
    this.#state.update((state) => ({ ...state, blogs: [blog, ...state.blogs], loading: false }));
  }

  #blogUpdated(blog: Blog): void {
    this.#state.update((state) => ({
      ...state,
      blogs: state.blogs.map((currentBlog) => (currentBlog.id === blog.id ? blog : currentBlog)),
      loading: false,
    }));
  }

  #blogDeleted(blogId: number): void {
    this.#state.update((state) => ({
      ...state,
      blogs: state.blogs.filter((blog) => blog.id !== blogId),
      loading: false,
    }));
  }

  #authorSelected(author: string): void {
    this.#state.update((state) => ({ ...state, selectedAuthor: author }));
  }

  #likeToggled(blogId: number): void {
    this.#state.update((state) => ({
      ...state,
      blogs: state.blogs.map((blog) => {
        if (blog.id !== blogId) {
          return blog;
        }

        return {
          ...blog,
          likedByMe: !blog.likedByMe,
          likes: blog.likedByMe ? blog.likes - 1 : blog.likes + 1,
        };
      }),
    }));
  }

  private readSelectedAuthor(): string {
    try {
      return localStorage.getItem(selectedAuthorStorageKey) ?? 'all';
    } catch {
      return 'all';
    }
  }

  private writeSelectedAuthor(author: string): void {
    try {
      localStorage.setItem(selectedAuthorStorageKey, author);
    } catch {
      return;
    }
  }
}
