import { Inter } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import { ImportantPeopleProvider } from '@/contexts/ImportantPeopleContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Chores App',
  description: 'A simple app to manage your chores',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ImportantPeopleProvider>
            {children}
          </ImportantPeopleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
