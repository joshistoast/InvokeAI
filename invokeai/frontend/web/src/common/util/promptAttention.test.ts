import { describe, expect, it } from 'vitest';

import { adjustPromptAttention } from './promptAttention';

describe('adjustPromptAttention', () => {
  describe('cross-boundary selection', () => {
    it('should split group and apply attention when selection spans from inside group to outside (increment)', () => {
      const prompt = '(a b)+ c';
      const result = adjustPromptAttention(prompt, 3, 8, 'increment');

      expect(result.prompt).toBe('(a b+ c)+');
    });

    it('should split group and apply attention when selection spans from inside group to outside (decrement)', () => {
      const prompt = '(a b)+ c';
      const result = adjustPromptAttention(prompt, 3, 8, 'decrement');

      expect(result.prompt).toBe('a+ b c-');
    });

    it('should split group when selection starts before group and ends inside (increment)', () => {
      const prompt = 'a (b c)+';
      const result = adjustPromptAttention(prompt, 0, 4, 'increment');

      expect(result.prompt).toBe('(a b+ c)+');
    });

    it('should split group when selection starts before group and ends inside (decrement)', () => {
      const prompt = 'a (b c)+';
      const result = adjustPromptAttention(prompt, 0, 4, 'decrement');

      expect(result.prompt).toBe('a- b c+');
    });

    it('should handle nested groups with cross-boundary selection (increment)', () => {
      const prompt = '((a b)+)+ c';
      const result = adjustPromptAttention(prompt, 2, 11, 'increment');

      expect(result.prompt).toBe('((a b)++ c)+');
    });

    it('should handle nested groups with cross-boundary selection (decrement)', () => {
      const prompt = '((a b)+)+ c';
      const result = adjustPromptAttention(prompt, 2, 11, 'decrement');

      expect(result.prompt).toBe('(a b)+ c-');
    });

    it('should handle selection spanning multiple groups (increment)', () => {
      const prompt = '(a)+ (b)+';
      const result = adjustPromptAttention(prompt, 0, 9, 'increment');

      expect(result.prompt).toBe('(a b)++');
    });

    it('should handle selection spanning multiple groups (decrement)', () => {
      const prompt = '(a)+ (b)+';
      const result = adjustPromptAttention(prompt, 0, 9, 'decrement');

      expect(result.prompt).toBe('a b');
    });

    it('should split negative group correctly (decrement on negative group)', () => {
      const prompt = '(a b)- c';
      const result = adjustPromptAttention(prompt, 3, 8, 'decrement');

      expect(result.prompt).toBe('(a b- c)-');
    });

    it('should split negative group correctly (increment on negative group)', () => {
      const prompt = '(a b)- c';
      const result = adjustPromptAttention(prompt, 3, 8, 'increment');

      expect(result.prompt).toBe('a- b c+');
    });

    it('should handle multiple non-selected items in group', () => {
      const prompt = '(a b c)+ d';
      const result = adjustPromptAttention(prompt, 5, 10, 'decrement');

      expect(result.prompt).toBe('(a b)+ c d-');
    });

    it('should handle word with existing attention in group when crossing boundary', () => {
      const prompt = 'c (d- e)+';
      const result = adjustPromptAttention(prompt, 0, 5, 'increment');

      expect(result.prompt).toBe('c+ d e+');
    });

    it('should handle complex multi-group case', () => {
      const prompt = '(a+ b)+ c (d- e)+';
      const result = adjustPromptAttention(prompt, 8, 14, 'increment');

      expect(result.prompt).toBe('(a+ b c)+ d e+');
    });
  });

  describe('single word', () => {
    it('should add + when incrementing word without attention', () => {
      const prompt = 'hello world';
      const result = adjustPromptAttention(prompt, 0, 5, 'increment');

      expect(result.prompt).toBe('hello+ world');
    });

    it('should add - when decrementing word without attention', () => {
      const prompt = 'hello world';
      const result = adjustPromptAttention(prompt, 0, 5, 'decrement');

      expect(result.prompt).toBe('hello- world');
    });
  });

  describe('existing group', () => {
    it('should adjust group attention when cursor is at group boundary', () => {
      const prompt = '(hello world)+';
      const result = adjustPromptAttention(prompt, 13, 14, 'increment');

      expect(result.prompt).toBe('(hello world)++');
    });

    it('should remove group when attention becomes neutral', () => {
      const prompt = '(hello world)+';
      const result = adjustPromptAttention(prompt, 0, 14, 'decrement');

      expect(result.prompt).toBe('hello world');
    });
  });

  describe('multiple words without group', () => {
    it('should create new group with + when incrementing multiple words', () => {
      const prompt = 'hello world';
      const result = adjustPromptAttention(prompt, 0, 11, 'increment');

      expect(result.prompt).toBe('(hello world)+');
    });

    it('should create new group with - when decrementing multiple words', () => {
      const prompt = 'hello world';
      const result = adjustPromptAttention(prompt, 0, 11, 'decrement');

      expect(result.prompt).toBe('(hello world)-');
    });
  });

  describe('selection preservation', () => {
    it('should preserve selection when incrementing single word', () => {
      const prompt = 'hello world';
      const result = adjustPromptAttention(prompt, 0, 5, 'increment');
      expect(result.prompt).toBe('hello+ world');
      expect(result.prompt.slice(result.selectionStart, result.selectionEnd)).toBe('hello+');
    });

    it('should preserve selection when incrementing group', () => {
      const prompt = '(hello world)+';
      const result = adjustPromptAttention(prompt, 0, 14, 'increment');
      expect(result.prompt).toBe('(hello world)++');
      expect(result.prompt.slice(result.selectionStart, result.selectionEnd)).toBe('(hello world)++');
    });

    it('should preserve selection when splitting group', () => {
      const prompt = '(a b)+';
      const result = adjustPromptAttention(prompt, 1, 2, 'increment'); // Select 'a' (index 1 to 2)
      // 'a' becomes 1.21, 'b' stays 1.1
      // Result: (a+ b)+ which is equivalent to a++ b+
      expect(result.prompt).toBe('(a+ b)+');
      expect(result.prompt.slice(result.selectionStart, result.selectionEnd)).toBe('a+');
    });
  });

  describe('numeric attention regression', () => {
    it('should not eat parentheses or explode floats when prompt contains (tag)1.x numeric weights (increment)', () => {
      const prompt =
        '(masterpiece)1.3, best quality, (high detail)1.2, oil painting, (sunny midday light)1.15, ' +
        'an old stone castle standing on a hill, medieval architecture, weathered stone walls, ' +
        '(lush rolling hills)1.1, expansive landscape, clear blue sky';

      const result = adjustPromptAttention(prompt, 0, 0, 'increment');

      // Should preserve numeric attention groups and not turn them into long floating-point strings
      expect(result.prompt).toContain('(masterpiece)');
      expect(result.prompt).toContain('(high detail)');
      expect(result.prompt).toContain('(sunny midday light)');
      expect(result.prompt).toContain('(lush rolling hills)');

      // No "eaten parens" like "masterpiece1.3..." (missing parentheses)
      expect(result.prompt).toMatch(/\(masterpiece\)/);

      // Avoid long float artifacts like "...0000000003"
      expect(result.prompt).not.toMatch(/\d+\.\d{6,}/);

      // Keep explicit numeric weights (on groups) numeric-looking with a reasonable precision
      expect(result.prompt).toMatch(/\(masterpiece\)1\.\d+/);
      expect(result.prompt).toMatch(/\(high detail\)1\.\d+/);
      expect(result.prompt).toMatch(/\(sunny midday light\)1\.\d+/);
      expect(result.prompt).toMatch(/\(lush rolling hills\)1\.\d+/);

      // Should not replace existing numeric weights with +/- syntax
      expect(result.prompt).not.toContain('(lush rolling hills)+');
      expect(result.prompt).not.toContain('(clear blue sky)+');
    });

    it('should not eat parentheses or explode floats when prompt contains (tag)1.x numeric weights (decrement)', () => {
      const prompt =
        '(masterpiece)1.3, best quality, (high detail)1.2, oil painting, (sunny midday light)1.15, ' +
        'an old stone castle standing on a hill, medieval architecture, weathered stone walls, ' +
        '(lush rolling hills)1.1, expansive landscape, clear blue sky';

      const result = adjustPromptAttention(prompt, 0, 0, 'decrement');

      expect(result.prompt).toContain('(masterpiece)');
      expect(result.prompt).toContain('(high detail)');
      expect(result.prompt).toContain('(sunny midday light)');
      expect(result.prompt).toContain('(lush rolling hills)');

      expect(result.prompt).toMatch(/\(masterpiece\)/);
      expect(result.prompt).not.toMatch(/\d+\.\d{6,}/);

      expect(result.prompt).toMatch(/\(masterpiece\)1\.\d+/);
      expect(result.prompt).toMatch(/\(high detail\)1\.\d+/);
      expect(result.prompt).toMatch(/\(sunny midday light\)1\.\d+/);
      expect(result.prompt).toMatch(/\(lush rolling hills\)1\.\d+/);

      expect(result.prompt).not.toContain('(lush rolling hills)+');
      expect(result.prompt).not.toContain('(clear blue sky)+');
    });

    it('should keep numeric weights stable on repeated adjustments (no float drift)', () => {
      const prompt = '(masterpiece)1.3, (high detail)1.2';

      const inc1 = adjustPromptAttention(prompt, 0, 0, 'increment').prompt;
      const inc2 = adjustPromptAttention(inc1, 0, 0, 'increment').prompt;

      // If numeric values are drifting due to float math, you typically see long tails.
      expect(inc1).not.toMatch(/\d+\.\d{6,}/);
      expect(inc2).not.toMatch(/\d+\.\d{6,}/);

      // Also ensure we didn't drop parentheses in the process
      expect(inc1).toMatch(/\(masterpiece\)/);
      expect(inc2).toMatch(/\(masterpiece\)/);
    });
  });
});
