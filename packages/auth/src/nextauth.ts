import NextAuth from 'next-auth';
import { createAuthOptions } from './lib/auth-options';

export const authOptions = createAuthOptions();

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
