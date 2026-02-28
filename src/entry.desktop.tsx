import './initialize';

import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import SPAGlobalProvider from '@/layout/SPAGlobalProvider';
import { desktopRoutes } from '@/routes/router/desktopRouter.config';
import { createAppRouter } from '@/utils/router';

const router = createAppRouter(desktopRoutes);

createRoot(document.getElementById('root')!).render(
  <SPAGlobalProvider>
    <RouterProvider router={router} />
  </SPAGlobalProvider>,
);
