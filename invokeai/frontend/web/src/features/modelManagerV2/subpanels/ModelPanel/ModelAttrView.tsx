import { FormControl, FormLabel, Text } from '@invoke-ai/ui-library';

interface Props {
  label: string;
  value: string | null | undefined;
}

export const ModelAttrView = ({ label, value }: Props) => {
  return (
    <FormControl flexDir="column" alignItems="flex-start" gap={0} borderBottomWidth={1} pb={1}>
      <FormLabel>{label}</FormLabel>
      <Text fontSize="md" noOfLines={1} wordBreak="break-all">
        {value || '-'}
      </Text>
    </FormControl>
  );
};
