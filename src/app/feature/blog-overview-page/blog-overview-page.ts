import { Component, inject, signal } from '@angular/core';
import { Blog } from '../blog/blog';
import { BlogService } from '../blog/blog.service';
import { BlogCard } from '../blog/components/blog-card/blog-card';

@Component({
  selector: 'app-blog-overview-page',
  imports: [BlogCard],
  templateUrl: './blog-overview-page.html',
  styleUrl: './blog-overview-page.scss',
})
export class BlogOverviewPage {
  private readonly blogService = inject(BlogService);

  blogs = signal<Blog[]>(this.blogService.getAll());

  toggleLike(blogId: number): void {
    this.blogs.update((blogs) =>
      blogs.map((blog) => {
        if (blog.id !== blogId) {
          return blog;
        }

        return {
          ...blog,
          likedByMe: !blog.likedByMe,
          likes: blog.likedByMe ? blog.likes - 1 : blog.likes + 1,
        };
      }),
    );
  }
}
