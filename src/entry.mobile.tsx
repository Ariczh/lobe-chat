import './initialize';

import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import SPAGlobalProvider from '@/layout/SPAGlobalProvider';
import { mobileRoutes } from '@/routes/router/mobileRouter.config';
import { createAppRouter } from '@/utils/router';

const router = createAppRouter(mobileRoutes);

createRoot(document.getElementById('root')!).render(
  <SPAGlobalProvider>
    <RouterProvider router={router} />
  </SPAGlobalProvider>,
);
