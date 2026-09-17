import { pricing } from './pricing';

// Keep the visible answers and FAQ structured data in sync.
export const homepageFaqs = (copy: CopyTranslator) => [
  {
    question: copy('u_c4f5ef02c7e1'),
    answer: copy('u_42f25a5177dc', {
      p0: pricing.monthly,
      p1: pricing.yearly,
    }),
  },
  {
    question: copy('u_5b31c63b7459'),
    answer: copy('u_8b42becae66c'),
  },
  {
    question: copy('u_bef0dab83b91'),
    answer: copy('u_f5268abdb16c'),
  },
  {
    question: copy('u_a8ef16881520'),
    answer: copy('u_ff4e74d016ec'),
  },
  {
    question: copy('u_62bb3acca108'),
    answer: copy('u_81f95f9dcca0'),
  },
  {
    question: copy('u_58feec03b834'),
    answer: copy('u_dfbf3db5461a'),
  },
];
type CopyTranslator = (key: string, values?: Record<string, string | number>) => string;
