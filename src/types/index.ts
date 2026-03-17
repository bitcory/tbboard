export interface UserInfo {
  id: string;
  username: string;
  name: string;
}

export interface PostWithAuthor {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  author: {
    id: string;
    name: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}
