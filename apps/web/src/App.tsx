import type { ReactElement } from 'react';
import { RouterProvider } from 'react-router-dom';

import { router } from '@/router';

/**
 * Top-level app — just hands off to the data router. The router config
 * lives in `src/router/index.tsx` and mounts `RootLayout` plus the
 * MVP screen routes.
 */
export function App(): ReactElement {
  return <RouterProvider router={router} />;
}
