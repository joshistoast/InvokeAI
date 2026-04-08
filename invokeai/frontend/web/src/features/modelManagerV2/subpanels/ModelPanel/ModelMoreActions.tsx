import { IconButton, Menu, MenuButton, MenuDivider, MenuList } from '@invoke-ai/ui-library';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PiDotsThreeOutlineFill } from 'react-icons/pi';
import type { AnyModelConfig } from 'services/api/types';

import { ModelConvertButton } from './ModelConvertButton';
import { ModelDeleteButton } from './ModelDeleteButton';
import type { ModelPanelAction } from './modelPanelActionLayout';
import { ModelReidentifyButton } from './ModelReidentifyButton';
import { ModelUpdatePathButton } from './ModelUpdatePathButton';

type Props = {
  actions: ModelPanelAction[];
  modelConfig: AnyModelConfig;
};

export const ModelMoreActions = memo(({ actions, modelConfig }: Props) => {
  const { t } = useTranslation();

  if (actions.length === 0) {
    return null;
  }

  const hasDestructiveActions = actions.includes('delete');
  const hasNonDestructiveActions = actions.some((action) => action !== 'delete');

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={IconButton}
        size="sm"
        variant="ghost"
        icon={<PiDotsThreeOutlineFill />}
        aria-label={t('userManagement.actions')}
        tooltip={t('userManagement.actions')}
        flexShrink={0}
      />
      <MenuList>
        {actions.includes('updatePath') && <ModelUpdatePathButton asMenuItem modelConfig={modelConfig} />}
        {actions.includes('reidentify') && <ModelReidentifyButton asMenuItem modelConfig={modelConfig} />}
        {actions.includes('convert') && modelConfig.type === 'main' && modelConfig.format === 'checkpoint' && (
          <ModelConvertButton asMenuItem modelConfig={modelConfig} />
        )}
        {hasDestructiveActions && hasNonDestructiveActions && <MenuDivider />}
        {actions.includes('delete') && <ModelDeleteButton asMenuItem modelConfig={modelConfig} />}
      </MenuList>
    </Menu>
  );
});

ModelMoreActions.displayName = 'ModelMoreActions';
