import { Component, signal } from '@angular/core';
import blogData from '../../data/blogs.json';
import { Blog } from '../../shared/blog';
import { BlogCard } from '../../shared/components/blog-card/blog-card';

@Component({
  selector: 'app-blog-overview-page',
  imports: [BlogCard],
  templateUrl: './blog-overview-page.html',
  styleUrl: './blog-overview-page.scss',
})
export class BlogOverviewPage {
  blogs = signal<Blog[]>(blogData as Blog[]);

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
