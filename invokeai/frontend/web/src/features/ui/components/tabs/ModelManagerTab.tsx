import { Flex } from '@invoke-ai/ui-library';
import { ModelManager } from 'features/modelManagerV2/subpanels/ModelManager';
import { ModelPane } from 'features/modelManagerV2/subpanels/ModelPane';
import { memo } from 'react';

const ModelManagerTab = () => {
  return (
    <Flex w="full" h="full">
      <ModelManager />
      <ModelPane />
    </Flex>
  );
};

export default memo(ModelManagerTab);
