export interface Blog {
  id: number;
  title: string;
  contentPreview: string;
  content?: string;
  category?: string;
  author: string;
  likes: number;
  comments: number;
  likedByMe: boolean;
  createdByMe: boolean;
  headerImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
