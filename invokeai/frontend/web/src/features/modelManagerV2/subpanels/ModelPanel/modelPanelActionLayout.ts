import type { AnyModelConfig } from 'services/api/types';

export type ModelPanelAction =
  | 'edit'
  | 'updatePath'
  | 'reidentify'
  | 'importSettings'
  | 'exportSettings'
  | 'convert'
  | 'delete';

type Args = {
  modelConfig: Pick<AnyModelConfig, 'type' | 'format'>;
  canManageModels: boolean;
  canUpdatePath: boolean;
  isEditing?: boolean;
  withSettings: boolean;
};

type ModelPanelActionLayout = {
  primaryHeaderActions: ModelPanelAction[];
  moreHeaderActions: ModelPanelAction[];
  settingsActions: ModelPanelAction[];
};

export const getModelPanelActionLayout = ({
  modelConfig,
  canManageModels,
  canUpdatePath,
  isEditing = false,
  withSettings,
}: Args): ModelPanelActionLayout => {
  const primaryHeaderActions: ModelPanelAction[] = [];
  const moreHeaderActions: ModelPanelAction[] = [];
  const settingsActions: ModelPanelAction[] = [];

  if (canManageModels) {
    if (!isEditing) {
      primaryHeaderActions.push('edit');
    }

    if (canUpdatePath) {
      moreHeaderActions.push('updatePath');
    }

    moreHeaderActions.push('reidentify');

    if (modelConfig.type === 'main' && modelConfig.format === 'checkpoint') {
      moreHeaderActions.push('convert');
    }

    moreHeaderActions.push('delete');
  }

  if (withSettings) {
    settingsActions.push('importSettings', 'exportSettings');
  }

  return {
    primaryHeaderActions,
    moreHeaderActions,
    settingsActions,
  };
};
