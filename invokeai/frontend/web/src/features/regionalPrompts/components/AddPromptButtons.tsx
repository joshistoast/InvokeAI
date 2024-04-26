import { Button, Flex } from '@invoke-ai/ui-library';
import { createMemoizedSelector } from 'app/store/createMemoizedSelector';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import {
  isVectorMaskLayer,
  maskLayerIPAdapterAdded,
  maskLayerNegativePromptChanged,
  maskLayerPositivePromptChanged,
  selectRegionalPromptsSlice,
} from 'features/regionalPrompts/store/regionalPromptsSlice';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PiPlusBold } from 'react-icons/pi';
import { assert } from 'tsafe';
type AddPromptButtonProps = {
  layerId: string;
};

export const AddPromptButtons = ({ layerId }: AddPromptButtonProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const selectValidActions = useMemo(
    () =>
      createMemoizedSelector(selectRegionalPromptsSlice, (regionalPrompts) => {
        const layer = regionalPrompts.present.layers.find((l) => l.id === layerId);
        assert(isVectorMaskLayer(layer), `Layer ${layerId} not found or not an RP layer`);
        return {
          canAddPositivePrompt: layer.positivePrompt === null,
          canAddNegativePrompt: layer.negativePrompt === null,
        };
      }),
    [layerId]
  );
  const validActions = useAppSelector(selectValidActions);
  const addPositivePrompt = useCallback(() => {
    dispatch(maskLayerPositivePromptChanged({ layerId, prompt: '' }));
  }, [dispatch, layerId]);
  const addNegativePrompt = useCallback(() => {
    dispatch(maskLayerNegativePromptChanged({ layerId, prompt: '' }));
  }, [dispatch, layerId]);
  const addIPAdapter = useCallback(() => {
    dispatch(maskLayerIPAdapterAdded(layerId));
  }, [dispatch, layerId]);

  return (
    <Flex w="full" p={2} justifyContent="space-between">
      <Button
        size="sm"
        variant="ghost"
        leftIcon={<PiPlusBold />}
        onClick={addPositivePrompt}
        isDisabled={!validActions.canAddPositivePrompt}
      >
        {t('common.positivePrompt')}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        leftIcon={<PiPlusBold />}
        onClick={addNegativePrompt}
        isDisabled={!validActions.canAddNegativePrompt}
      >
        {t('common.negativePrompt')}
      </Button>
      <Button size="sm" variant="ghost" leftIcon={<PiPlusBold />} onClick={addIPAdapter}>
        {t('common.ipAdapter')}
      </Button>
    </Flex>
  );
};
