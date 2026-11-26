import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Schema } from 'hast-util-sanitize';
import type { Pluggable } from 'unified';

const katexSchema: Schema = {
  ...defaultSchema,
  tagNames: [...defaultSchema.tagNames, 'span'],
  attributes: {
    ...defaultSchema.attributes,
    span: ['class', 'style', 'data-fragment-index', 'aria-label'],
  },
};

export const sanitizeWithKatex = rehypeSanitize(katexSchema) as unknown as Pluggable;