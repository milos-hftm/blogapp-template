import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthStore } from '../../core/auth/auth-store';
import { Blog } from '../blog/blog';
import { BlogStateService } from '../blog/blog-state.service';
import { BlogCard } from '../blog/components/blog-card/blog-card';

@Component({
  selector: 'app-blog-overview-page',
  imports: [
    BlogCard,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './blog-overview-page.html',
  styleUrl: './blog-overview-page.scss',
})
export class BlogOverviewPage implements OnInit {
  protected readonly state = inject(BlogStateService);
  protected readonly authStore = inject(AuthStore);
  protected readonly canManageBlogs = computed(() => this.authStore.roles().includes('user'));

  editingBlogId = signal<number | null>(null);

  protected title = '';
  protected author = 'student@hftm.ch';
  protected content = '';
  protected headerImageUrl = '';

  ngOnInit(): void {
    void this.state.loadBlogs();
  }

  async saveBlog(): Promise<void> {
    if (!this.canManageBlogs() || !this.canSave()) {
      return;
    }

    const blog = this.createBlogFromForm();
    const editingBlogId = this.editingBlogId();
    const saved =
      editingBlogId === null
        ? await this.state.createBlog(blog)
        : await this.state.updateBlog(String(editingBlogId), blog);

    if (saved) {
      this.resetForm();
    }
  }

  editBlog(blog: Blog): void {
    if (!this.canManageBlogs()) {
      return;
    }

    this.editingBlogId.set(blog.id);
    this.title = blog.title;
    this.author = blog.author;
    this.content = blog.content ?? blog.contentPreview;
    this.headerImageUrl = blog.headerImageUrl ?? '';
  }

  async deleteBlog(blogId: number): Promise<void> {
    if (!this.canManageBlogs()) {
      return;
    }

    await this.state.deleteBlog(String(blogId));
  }

  cancelEdit(): void {
    this.resetForm();
  }

  toggleLike(blogId: number): void {
    this.state.toggleLike(blogId);
  }

  protected canSave(): boolean {
    return this.title.trim().length > 0 && this.content.trim().length > 0;
  }

  private createBlogFromForm(): Blog {
    const now = new Date().toISOString();
    const editingBlogId = this.editingBlogId();
    const existingBlog = this.state.blogs().find((blog) => blog.id === editingBlogId);
    const content = this.content.trim();

    return {
      id: editingBlogId ?? 0,
      title: this.title.trim(),
      contentPreview: content,
      content,
      author: this.author.trim() || 'student@hftm.ch',
      likes: existingBlog?.likes ?? 0,
      comments: existingBlog?.comments ?? 0,
      likedByMe: existingBlog?.likedByMe ?? false,
      createdByMe: existingBlog?.createdByMe ?? true,
      headerImageUrl: this.headerImageUrl.trim() || undefined,
      createdAt: existingBlog?.createdAt ?? now,
      updatedAt: now,
    };
  }

  private resetForm(): void {
    this.editingBlogId.set(null);
    this.title = '';
    this.author = 'student@hftm.ch';
    this.content = '';
    this.headerImageUrl = '';
  }
}
