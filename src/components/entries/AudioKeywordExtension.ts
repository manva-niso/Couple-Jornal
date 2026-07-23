import { Mark, mergeAttributes } from '@tiptap/core';
import { ReactMarkViewRenderer } from '@tiptap/react';
import AudioKeywordMarkView from './AudioKeywordMarkView';

export const AudioKeywordExtension = Mark.create({
  name: 'audioKeyword',
  inclusive: false,

  addAttributes() {
    return {
      audioId: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-audio-id'),
        renderHTML: (attributes) => ({
          'data-audio-id': attributes.audioId,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-audio-id]',
      },
      {
        tag: 'a[href^="#audio-"]',
        getAttrs: (element) => {
          if (typeof element === 'string') return false;
          const href = element.getAttribute('href');
          return href ? { audioId: href.replace('#audio-', '') } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'cursor-pointer text-[#5b3a4f] underline decoration-[#5b3a4f]/30 underline-offset-4 font-medium transition-colors hover:text-[#3d2f1f]',
      }),
      0,
    ];
  },

  addMarkView() {
    return ReactMarkViewRenderer(AudioKeywordMarkView);
  },
});