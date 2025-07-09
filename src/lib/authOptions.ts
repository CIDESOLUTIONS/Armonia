import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JWTPayload } from './auth'; // Importar la interfaz JWTPayload
import { ServerLogger } from './logging/server-logger';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        schemaName: { label: 'Schema Name', type: 'text', optional: true },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { email, password, schemaName } = credentials;

        let user = null;
        let targetPrisma = prisma;

        try {
          if (schemaName) {
            // Conectar a un esquema específico si se proporciona
            targetPrisma = new PrismaClient({
              datasources: {
                db: { url: process.env.DATABASE_URL?.replace('armonia', schemaName) },
              },
            });
          }

          user = await targetPrisma.user.findUnique({
            where: { email: email },
          });

          if (!user) {
            ServerLogger.warn(`Intento de login fallido: Usuario no encontrado para ${email} en esquema ${schemaName || 'principal'}`);
            return null;
          }

          const passwordMatch = await bcrypt.compare(password, user.password);

          if (!passwordMatch) {
            ServerLogger.warn(`Intento de login fallido: Contraseña incorrecta para ${email} en esquema ${schemaName || 'principal'}`);
            return null;
          }

          // Devolver el usuario si la autenticación es exitosa
          // NextAuth serializará este objeto en el JWT
          return {
            id: user.id.toString(), // ID debe ser string
            email: user.email,
            name: user.name,
            role: user.role,
            complexId: user.complexId?.toString(), // Convertir a string si existe
            schemaName: schemaName || 'armonia', // Usar el schemaName proporcionado o 'armonia'
          };
        } catch (error) {
          ServerLogger.error('Error en la autorización de credenciales:', error);
          return null;
        } finally {
          if (schemaName) {
            await (targetPrisma as PrismaClient).$disconnect();
          }
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // El usuario es el objeto devuelto por authorize
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
        token.complexId = user.complexId;
        token.schemaName = user.schemaName;
      }
      return token;
    },
    async session({ session, token }) {
      // Enviar propiedades adicionales al cliente, como el ID de usuario y el rol
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.complexId = token.complexId;
        session.user.schemaName = token.schemaName;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirigir a la página de login en caso de error
  },
  secret: process.env.NEXTAUTH_SECRET,
};
