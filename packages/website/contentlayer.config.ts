import { defineDocumentType, makeSource } from 'contentlayer2/source-files';
// MDX plugins similar to taxonomy setup
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';
import {
  transformerMetaHighlight,
  transformerNotationHighlight,
  transformerRemoveLineBreak,
} from '@shikijs/transformers';

// Minimal custom transformer: adds data-line-numbers when `lineNumbers` appears in code fence meta
const transformerMetaLineNumbers = () => ({
  name: 'meta-line-numbers',
  // `this` is ShikiTransformerContext
  pre(hast: any) {
    const raw = (this as any)?.options?.meta?.__raw as string | undefined;
    if (raw && raw.includes('lineNumbers')) {
      hast.properties ??= {};
      hast.properties['data-line-numbers'] = '';
    }
    return hast;
  },
});

// Extract title/filename from code fence meta: title="..." or filename="..."
const transformerMetaTitle = () => ({
  name: 'meta-title',
  pre(hast: any) {
    const raw = (this as any)?.options?.meta?.__raw as string | undefined;
    if (raw) {
      const m = raw.match(/(?:title|filename)=\"([^\"]+)\"/);
      if (m?.[1]) {
        hast.properties ??= {};
        hast.properties['data-title'] = m[1];
      }
    }
    return hast;
  },
});

// Attach detected language as data-language to <pre>
const transformerLanguageAttr = () => ({
  name: 'language-attr',
  pre(hast: any) {
    const lang = (this as any)?.options?.lang as string | undefined;
    if (lang) {
      hast.properties ??= {};
      hast.properties['data-language'] = lang;
    }
    return hast;
  },
});
import remarkGfm from 'remark-gfm';

const removePrefix = (value: string, prefix: string) =>
  value.startsWith(prefix) ? value.slice(prefix.length) : value;

const splitSlug = (slug: string) => slug.split('/').filter(Boolean);

// Translated docs live at content/docs/<locale>/<slug>.mdx; English stays at
// content/docs/<slug>.mdx so existing paths and URLs are untouched.
const DOC_LOCALES = ['de', 'fr', 'es', 'nl'];

const docPath = (flattened: string) => removePrefix(flattened, 'docs/');

const docLocale = (flattened: string) => {
  const [first] = splitSlug(docPath(flattened));
  return DOC_LOCALES.includes(first) ? first : 'en';
};

const docSlug = (flattened: string) => {
  const parts = splitSlug(docPath(flattened));
  return (DOC_LOCALES.includes(parts[0]) ? parts.slice(1) : parts).join('/');
};

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `blog/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    date: { type: 'date', required: true },
    updated: { type: 'date', required: false },
    image: { type: 'string', required: false },
    cover: { type: 'string', required: false },
    published: { type: 'boolean', required: false, default: true },
    tags: { type: 'list', of: { type: 'string' }, required: false },
    draft: { type: 'boolean', required: false, default: false },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (post) => `/blog/${removePrefix(post._raw.flattenedPath, 'blog/')}`,
    },
    slugAsParams: {
      type: 'string',
      resolve: (post) => removePrefix(post._raw.flattenedPath, 'blog/'),
    },
    readingTimeMinutes: {
      type: 'number',
      // Approximate reading time: 200 wpm
      resolve: (post) => {
        const words = (post.body?.raw || '').trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 200));
      },
    },
    heroImage: {
      type: 'string',
      resolve: (post) => (post.image ? post.image : (post as any).cover || undefined),
    },
  },
}));

export const Guide = defineDocumentType(() => ({
  name: 'Guide',
  filePathPattern: `docs/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    summary: { type: 'string', required: true },
    section: {
      type: 'enum',
      options: [
        'getting-started',
        'budget-basics',
        'accounts-and-imports',
        'collaboration',
        'integrations',
      ],
      required: true,
    },
    topicId: { type: 'string', required: true },
    takeaways: { type: 'list', of: { type: 'string' }, required: false },
    badge: { type: 'string', required: false },
    order: { type: 'number', required: false },
    published: { type: 'boolean', required: false, default: true },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (guide) => docSlug(guide._raw.flattenedPath),
    },
    slugSegments: {
      type: 'list',
      of: { type: 'string' },
      resolve: (guide) => splitSlug(docSlug(guide._raw.flattenedPath)),
    },
    locale: {
      type: 'string',
      resolve: (guide) => docLocale(guide._raw.flattenedPath),
    },
    url: {
      type: 'string',
      resolve: (guide) => {
        const locale = docLocale(guide._raw.flattenedPath);
        const slug = docSlug(guide._raw.flattenedPath);
        return locale === 'en' ? `/docs/${slug}` : `/${locale}/docs/${slug}`;
      },
    },
    readingTimeMinutes: {
      type: 'number',
      resolve: (guide) => {
        const words = (guide.body?.raw || '').trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 200));
      },
    },
  },
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post, Guide],
  mdx: {
    // GFM tables crash with mdast-util-gfm-table@2.0.0 - use HTML tables in MDX instead
    remarkPlugins: [],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { class: 'anchor' },
        },
      ],
      [
        rehypeShiki,
        {
          themes: {
            dark: 'github-dark',
            light: 'github-light',
          },
          transformers: [
            // Remove text line breaks so display:block lines don't create blank gaps
            transformerRemoveLineBreak(),
            transformerLanguageAttr(),
            transformerMetaLineNumbers(),
            transformerMetaTitle(),
            transformerMetaHighlight(),
            transformerNotationHighlight(),
          ],
        },
      ],
    ],
  },
});
