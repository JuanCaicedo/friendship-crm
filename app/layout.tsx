'use client';

import { SWRConfig } from 'swr';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/lib/theme';
import { swrConfig } from '@/lib/swr-config';
import { Navigation } from '@/components/Navigation';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SWRConfig value={swrConfig}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
              <Navigation />
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </ErrorBoundary>
          </ThemeProvider>
        </SWRConfig>
      </body>
    </html>
  );
}

