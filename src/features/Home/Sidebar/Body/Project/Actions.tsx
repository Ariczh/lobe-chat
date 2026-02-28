import { ActionIcon } from '@lobehub/ui';
import { PlusIcon } from 'lucide-react';
import { memo } from 'react';

import { useProjectMenuItems } from '@/features/Home/hooks';

const Actions = memo(() => {
  const { createProject } = useProjectMenuItems();

  return <ActionIcon icon={PlusIcon} size={'small'} onClick={createProject} />;
});

export default Actions;
