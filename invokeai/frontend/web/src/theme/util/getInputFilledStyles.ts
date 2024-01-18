import type {
  StyleFunctionProps,
  SystemStyleObject,
} from '@chakra-ui/styled-system';

export const getInputFilledStyles = (
  props: StyleFunctionProps
): SystemStyleObject => {
  const { variant } = props;

  const bg = variant === 'darkFilled' ? 'base.850' : 'base.800';
  const bgHover = variant === 'darkFilled' ? 'blue.300' : 'base.650';
  const error = 'error.600';
  const errorHover = 'error.500';
  const fg = 'base.100';

  const baseColors = {
    color: fg,
    bg: bg,
    borderColor: bg,
  };
  const _invalid = {
    borderColor: error,
    _hover: {
      borderColor: errorHover,
    },
  };
  const _hover = {
    borderColor: bgHover,
  };
  const _focusVisible = {
    ..._hover,
    _invalid,
  };
  const _disabled = {
    opacity: 0.35,
    _hover: baseColors,
  };
  return {
    ...baseColors,
    minH: '28px',
    borderWidth: 1,
    borderRadius: 'base',
    outline: 'none',
    boxShadow: 'none',
    _hover,
    _focusVisible,
    _invalid,
    _disabled,
  };
};
