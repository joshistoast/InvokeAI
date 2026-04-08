import { describe, expect, it } from 'vitest';

import { getModelPanelActionLayout } from './modelPanelActionLayout';

describe('getModelPanelActionLayout', () => {
  it('keeps edit primary, places secondary model actions in more actions, and keeps settings actions in settings', () => {
    const layout = getModelPanelActionLayout({
      canManageModels: true,
      canUpdatePath: true,
      withSettings: true,
      modelConfig: { type: 'main', format: 'checkpoint' },
    });

    expect(layout.primaryHeaderActions).toEqual(['edit']);
    expect(layout.moreHeaderActions).toEqual(['updatePath', 'reidentify', 'convert', 'delete']);
    expect(layout.settingsActions).toEqual(['importSettings', 'exportSettings']);
  });

  it('omits unsupported actions', () => {
    const layout = getModelPanelActionLayout({
      canManageModels: false,
      canUpdatePath: false,
      withSettings: false,
      modelConfig: { type: 'main', format: 'diffusers' },
    });

    expect(layout.primaryHeaderActions).toEqual([]);
    expect(layout.moreHeaderActions).toEqual([]);
    expect(layout.settingsActions).toEqual([]);
  });

  it('keeps destructive actions available in edit mode without showing edit again', () => {
    const layout = getModelPanelActionLayout({
      canManageModels: true,
      canUpdatePath: true,
      withSettings: true,
      isEditing: true,
      modelConfig: { type: 'main', format: 'checkpoint' },
    });

    expect(layout.primaryHeaderActions).toEqual([]);
    expect(layout.moreHeaderActions).toEqual(['updatePath', 'reidentify', 'convert', 'delete']);
    expect(layout.settingsActions).toEqual(['importSettings', 'exportSettings']);
  });
});
