import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  form,
  maxLength,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Blog } from '../blog/blog';
import { BlogStateService } from '../blog/blog-state.service';
import { BlogCreateErrors } from './blog-create-errors';

interface BlogCreateModel {
  title: string;
  content: string;
  category: string;
}

const emptyBlog: BlogCreateModel = {
  title: '',
  content: '',
  category: 'general',
};

@Component({
  selector: 'app-blog-create',
  imports: [
    BlogCreateErrors,
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './blog-create.html',
  styleUrl: './blog-create.scss',
})
export class BlogCreateComponent {
  protected readonly state = inject(BlogStateService);
  private readonly router = inject(Router);

  protected readonly categories = [
    { value: 'general', label: 'Allgemein' },
    { value: 'tech', label: 'Technik' },
    { value: 'lifestyle', label: 'Lifestyle' },
  ];

  protected readonly blogModel = signal<BlogCreateModel>({ ...emptyBlog });

  protected readonly blogForm = form(this.blogModel, (blog) => {
    required(blog.title, { message: 'Titel ist erforderlich' });
    minLength(blog.title, 3, { message: 'Titel muss mindestens 3 Zeichen lang sein' });
    maxLength(blog.title, 100, { message: 'Titel darf maximal 100 Zeichen lang sein' });
    validate(blog.title, ({ value }) => {
      const title = value().trim();

      if (!title || /^[\p{L}\p{N} ]+$/u.test(title)) {
        return null;
      }

      return {
        kind: 'titleCharacters',
        message: 'Titel darf nur Buchstaben, Zahlen und Leerzeichen enthalten',
      };
    });

    required(blog.content, { message: 'Inhalt ist erforderlich' });
    minLength(blog.content, 10, { message: 'Inhalt muss mindestens 10 Zeichen lang sein' });
    validate(blog.content, ({ value, valueOf }) => {
      const content = value().trim();
      const title = valueOf(blog.title).trim();

      if (!title || !content || content.length >= title.length * 2) {
        return null;
      }

      return {
        kind: 'contentTitleLength',
        message: 'Inhalt muss mindestens doppelt so lang wie der Titel sein',
      };
    });

    required(blog.category, { message: 'Kategorie ist erforderlich' });
  });

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    await submit(this.blogForm, async () => {
      const formValue = this.blogModel();
      console.log(formValue);

      const saved = await this.state.createBlog(this.createBlog(formValue));

      if (saved) {
        this.blogModel.set({ ...emptyBlog });
        await this.router.navigate(['/']);
      }
    });
  }

  private createBlog(formValue: BlogCreateModel): Blog {
    const now = new Date().toISOString();
    const content = formValue.content.trim();

    return {
      id: 0,
      title: formValue.title.trim(),
      contentPreview: content,
      content,
      category: formValue.category,
      author: 'student@hftm.ch',
      likes: 0,
      comments: 0,
      likedByMe: false,
      createdByMe: true,
      createdAt: now,
      updatedAt: now,
    };
  }
}
