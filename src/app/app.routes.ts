import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { BlogOverviewPage } from './feature/blog-overview-page/blog-overview-page';

export const routes: Routes = [
  {
    path: '',
    component: BlogOverviewPage,
  },
  {
    path: 'add-blog',
    loadComponent: () =>
      import('./feature/blog-create/blog-create').then((m) => m.BlogCreateComponent),
    canMatch: [authGuard],
    data: { roles: ['user'] },
  },
  {
    path: 'login',
    loadComponent: () => import('./feature/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'blog/:id',
    loadComponent: () =>
      import('./feature/blog-detail-page/blog-detail-page').then((m) => m.BlogDetailPage),
  },
  {
    path: 'about',
    loadComponent: () => import('./feature/about-page/about-page').then((m) => m.AboutPage),
  },
];
