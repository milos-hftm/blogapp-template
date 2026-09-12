import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';
import { environment } from '../../../environments/environment';
import { Blog } from './blog';

const commentSchema = z
  .object({
    id: z.number(),
    author: z.string(),
    content: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

const apiBlogSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    contentPreview: z.string().optional(),
    content: z.string().optional(),
    category: z.string().optional(),
    author: z.string(),
    likes: z.number(),
    comments: z.union([z.number(), z.array(commentSchema)]).optional(),
    likedByMe: z.boolean(),
    createdByMe: z.boolean(),
    headerImageUrl: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

const blogListResponseSchema = z
  .object({
    data: z.array(apiBlogSchema),
    pageIndex: z.number(),
    pageSize: z.number(),
    totalCount: z.number(),
    maxPageSize: z.number(),
  })
  .passthrough();

type ApiBlog = z.infer<typeof apiBlogSchema>;
type BlogListResponse = z.infer<typeof blogListResponseSchema>;

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  async getBlogs(): Promise<Blog[]> {
    try {
      const response = await firstValueFrom(this.http.get<BlogListResponse>(this.apiUrl));
      const result = blogListResponseSchema.safeParse(response);

      if (!result.success) {
        console.error('Unerwartete API-Antwort beim Laden der Blogs.', result.error);
        return [];
      }

      return result.data.data.map((blog) => this.mapBlog(blog));
    } catch (error) {
      console.error('Blogs konnten nicht geladen werden.', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Blog | undefined> {
    try {
      const response = await firstValueFrom(this.http.get<ApiBlog>(`${this.apiUrl}/${id}`));
      const result = apiBlogSchema.safeParse(response);

      if (!result.success) {
        console.error('Unerwartete API-Antwort beim Laden eines Blogs.', result.error);
        return undefined;
      }

      return this.mapBlog(result.data);
    } catch (error) {
      console.error('Blog konnte nicht geladen werden.', error);
      throw error;
    }
  }

  async createBlog(blog: Blog): Promise<Blog> {
    try {
      const response = await firstValueFrom(this.http.post<Blog>(this.apiUrl, blog));
      return this.parseBlogResponse(response, 'Blog konnte nicht erstellt werden.');
    } catch (error) {
      console.error('Blog konnte nicht erstellt werden.', error);
      throw error;
    }
  }

  async updateBlog(id: string, blog: Blog): Promise<Blog> {
    try {
      const response = await firstValueFrom(this.http.put<Blog>(`${this.apiUrl}/${id}`, blog));
      return this.parseBlogResponse(response, 'Blog konnte nicht aktualisiert werden.');
    } catch (error) {
      console.error('Blog konnte nicht aktualisiert werden.', error);
      throw error;
    }
  }

  async deleteBlog(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    } catch (error) {
      console.error('Blog konnte nicht geloescht werden.', error);
      throw error;
    }
  }

  private parseBlogResponse(response: unknown, message: string): Blog {
    const result = apiBlogSchema.safeParse(response);

    if (!result.success) {
      console.error(message, result.error);
      throw new Error(message);
    }

    return this.mapBlog(result.data);
  }

  private mapBlog(blog: ApiBlog): Blog {
    const content = blog.content;

    return {
      id: blog.id,
      title: blog.title,
      contentPreview: blog.contentPreview ?? this.createPreview(content ?? ''),
      content,
      category: blog.category,
      author: blog.author,
      likes: blog.likes,
      comments: Array.isArray(blog.comments) ? blog.comments.length : (blog.comments ?? 0),
      likedByMe: blog.likedByMe,
      createdByMe: blog.createdByMe,
      headerImageUrl: blog.headerImageUrl || undefined,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
  }

  private createPreview(content: string): string {
    const text = content.trim().replace(/\s+/g, ' ');

    if (text.length <= 160) {
      return text;
    }

    return `${text.slice(0, 157)}...`;
  }
}
