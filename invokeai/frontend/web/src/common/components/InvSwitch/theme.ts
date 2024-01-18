import { switchAnatomy as parts } from '@chakra-ui/anatomy';
import {
  createMultiStyleConfigHelpers,
  defineStyle,
} from '@chakra-ui/styled-system';

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys);

const invokeAITrack = defineStyle((_props) => {
  return {
    bg: 'base.800',
    p: 1,
    border: '1px solid transparent',
    _focusVisible: {
      boxShadow: 'none',
    },
    _checked: {
      bg: 'blue.300',
    },
    _hover: {
      borderColor: 'blue.300',
    }
  };
});

const invokeAIThumb = defineStyle((_props) => {
  return {
    bg: 'base.50',
    _checked: {
      bg: 'base.800'
    }
  };
});

const invokeAI = definePartsStyle((props) => ({
  container: {},
  track: invokeAITrack(props),
  thumb: invokeAIThumb(props),
}));

export const switchTheme = defineMultiStyleConfig({
  variants: { invokeAI },
  defaultProps: {
    size: 'md',
    variant: 'invokeAI',
  },
});
