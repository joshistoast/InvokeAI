import { accordionAnatomy as parts } from '@chakra-ui/anatomy';
import {
  createMultiStyleConfigHelpers,
  defineStyle,
} from '@chakra-ui/styled-system';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys);

const invokeAIContainer = defineStyle({
  border: 'none',
  bg: 'base.850',
  borderRadius: 'base',
  ':has(&div &button:hover)': { bg: 'base.850' },
  transitionProperty: 'common',
  transitionDuration: '0.1s',
});

const invokeAIButton = defineStyle((_props) => {
  return {
    gap: 2,
    fontWeight: 'semibold',
    fontSize: 'sm',
    border: 'none',
    borderRadius: 'base',
    color: 'base.400',
    _hover: {
      color: 'base.50',
    },
    _expanded: {
      borderBottomRadius: 'none',
    },
  };
});

const invokeAIPanel = defineStyle((props) => {
  const { colorScheme: c } = props;
  return {
    bg: `${c}.850`,
    borderRadius: 'base',
    p: 0,
    transitionProperty: 'common',
    transitionDuration: '0.1s',
  };
});

const invokeAIIcon = defineStyle({
  ms: 2,
});

const invokeAI = definePartsStyle((props) => ({
  container: invokeAIContainer,
  button: invokeAIButton(props),
  panel: invokeAIPanel(props),
  icon: invokeAIIcon,
}));

const baseStyle = definePartsStyle(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
}));

export const accordionTheme = defineMultiStyleConfig({
  baseStyle,
  variants: { invokeAI },
  defaultProps: {
    variant: 'invokeAI',
    colorScheme: 'base',
  },
});
