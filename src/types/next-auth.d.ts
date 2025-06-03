import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    profilePicture?: string;
    username?: string;
  }

  interface Session {
    user: User;
  }
} 