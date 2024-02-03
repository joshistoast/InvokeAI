import { useDisclosure } from '@invoke-ai/ui-library';
import { isNil } from 'lodash-es';
import type { ChangeEventHandler, KeyboardEventHandler, RefObject } from 'react';
import { useCallback } from 'react';
import { flushSync } from 'react-dom';

export type UseInsertEmbeddingArg = {
  prompt: string;
  textareaRef: RefObject<HTMLTextAreaElement>;
  onChange: (v: string) => void;
};

export const usePrompt = ({ prompt, textareaRef, onChange: _onChange }: UseInsertEmbeddingArg) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      _onChange(e.target.value);
    },
    [_onChange]
  );

  const insertEmbedding = useCallback(
    (v: string) => {
      if (!textareaRef.current) {
        return;
      }

      // this is where we insert the TI trigger
      const caret = textareaRef.current.selectionStart;

      if (isNil(caret)) {
        return;
      }

      let newPrompt = prompt.slice(0, caret);

      if (newPrompt[newPrompt.length - 1] !== '<') {
        newPrompt += '<';
      }

      newPrompt += `${v}>`;

      // we insert the cursor after the `>`
      const finalCaretPos = newPrompt.length;

      newPrompt += prompt.slice(caret);

      // must flush dom updates else selection gets reset
      flushSync(() => {
        _onChange(newPrompt);
      });

      // set the caret position to just after the TI trigger
      textareaRef.current.selectionStart = finalCaretPos;
      textareaRef.current.selectionEnd = finalCaretPos;
    },
    [textareaRef, _onChange, prompt]
  );

  // Increases/decreases the weighting of the text
  type WeightingDir = 'up' | 'down';
  const updateWeighting = useCallback((text: string, dir: WeightingDir): string | undefined => {
    if (!text || !dir) {
      return text;
    }

    // Extract the main content and any existing attention symbols
    const regex = /^\(?([^()]+?)\)?([+-]*)$/;
    const match = text.match(regex);

    if (match) {
      const [_, content, attentionSymbols] = match;
      if (!content) {
        return;
      }
      let attention = 0;
      if (attentionSymbols) {
        attention = attentionSymbols.length * (attentionSymbols.startsWith('+') ? 1 : -1);
      }
      const needsParens = content.includes(' ');

      // adjust attention based on direction
      if (dir === 'up') {
        attention++;
      } else if (dir === 'down') {
        attention--;
      }

      const getAttentionSymbols = (num: number) => (num > 0 ? '+'.repeat(num) : '-'.repeat(-num));

      let result = content;
      if (needsParens) {
        result = `(${result})`;
      }
      if (attention !== 0) {
        result += getAttentionSymbols(attention);
      }
      if (attention === 0 && needsParens) {
        result = result.slice(1, -1);
      }

      return result;
    } else {
      return text;
    }
  }, []);

  type ExpandSelectionArgs = {
    content: string;
    currentSelectionStart: number;
    currentSelectionEnd: number;
  }
  type ExpandSelectionResult = {
    selectionStart: number
    selectionEnd: number
  }
  const expandSelection = useCallback(({
    content,
    currentSelectionStart,
    currentSelectionEnd,
  }: ExpandSelectionArgs): ExpandSelectionResult => {
    let selectionStart = currentSelectionStart;
    let selectionEnd = currentSelectionEnd;

    // return start and end of nearest opening and closing parens
    const selectParenBlock = (start: number, end: number) => {
      let depth = 0
      let leftParenIndex = -1
      let rightParenIndex = -1

      // Scan backwards from start to find the opening paren
      for (let i = start; i >= 0; i--) {
        if (content[i] === ')') {
          depth++
        } else if (content[i] === '(') {
          if (depth === 0) {
            leftParenIndex = i
            break
          } else {
            depth--
          }
        }
      }

      // Reset depth and scan forwards from end to find the closing paren
      depth = 0
      for (let i = end; i < content.length; i++) {
        if (content[i] === '(') {
          depth++
        } else if (content[i] === ')') {
          if (depth === 0) {
            rightParenIndex = i
            break
          } else {
            depth--
          }
        }
      }

      // Check for all + or - after right paren
      if (rightParenIndex !== -1) {
        let i = rightParenIndex + 1
        while (i < content.length && (content[i] === '+' || content[i] === '-')) {
          i++
        }
        rightParenIndex = i
      }

      return { leftParenIndex, rightParenIndex }
    }
    // return start and end of word
    const selectWord = (index: number) => {
      const textStart = content.lastIndexOf(' ', index - 1) + 1
      const textEnd = content.indexOf(' ', index) === -1 ? content.length : content.indexOf(' ', index)
      return { textStart, textEnd }
    }
    // return true if selection is between parens
    const isBetweenParens = (start: number, end: number) => {
      const { leftParenIndex, rightParenIndex } = selectParenBlock(start, end)
      return leftParenIndex !== -1 && rightParenIndex !== -1
    }

    // selection is resting cursor
    if (selectionStart === selectionEnd) {
      // resting cursor is within parens
      if (isBetweenParens(selectionStart, selectionEnd)) {
        const { leftParenIndex, rightParenIndex } = selectParenBlock(selectionStart, selectionEnd)
        selectionStart = leftParenIndex
        selectionEnd = rightParenIndex
      // resting cursor is only within word
      } else {
        const { textStart, textEnd } = selectWord(selectionStart)
        selectionStart = textStart
        selectionEnd = textEnd
      }
    }

    return { selectionStart, selectionEnd }
  }, [])

  const onFocus = useCallback(() => {
    textareaRef.current?.focus();
  }, [textareaRef]);

  const handleClose = useCallback(() => {
    onClose();
    onFocus();
  }, [onFocus, onClose]);

  const onSelectEmbedding = useCallback(
    (v: string) => {
      insertEmbedding(v);
      handleClose();
    },
    [handleClose, insertEmbedding]
  );

  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      if (e.key === '<') {
        onOpen();
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        // Handle keyboard shortcuts for increasing/decreasing the weighting of the selected text
        e.preventDefault();

        const textArea = textareaRef.current;
        if (!textArea) {
          return;
        }

        const dir = e.key === 'ArrowUp' ? 'up' : ('down' as WeightingDir);
        const { value } = textArea;
        let { selectionStart, selectionEnd } = textArea;

        const expandedSelection = expandSelection({
          content: value,
          currentSelectionStart: selectionStart,
          currentSelectionEnd: selectionEnd,
        });
        selectionStart = expandedSelection.selectionStart;
        selectionEnd = expandedSelection.selectionEnd;

        const newText = updateWeighting(value.slice(selectionStart, selectionEnd), dir);

        if (typeof newText !== 'string') {
          return;
        }

        // Update the text area with the new text
        const updatedValue = value.substring(0, selectionStart) + newText + value.substring(selectionEnd);
        flushSync(() => {
          _onChange(updatedValue);
        });

        // Set the cursor position to the end of the new text
        setTimeout(() => {
          textArea.selectionStart = selectionStart;
          textArea.selectionEnd = selectionStart + newText.length;
        }, 0);
      }
    },
    [onOpen, textareaRef, expandSelection, updateWeighting, _onChange]
  );

  return {
    onChange,
    isOpen,
    onClose,
    onOpen,
    onSelectEmbedding,
    onKeyDown,
    onFocus,
  };
};
