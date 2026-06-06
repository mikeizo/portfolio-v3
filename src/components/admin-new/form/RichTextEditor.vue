<script setup lang="ts">
  import type { Editor } from '@tiptap/vue-3'

  import {
    AlignCenter,
    AlignLeft,
    Bold,
    Code,
    Heading2,
    Heading3,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered
  } from 'lucide-vue-next'
  import { EditorContent, useEditor } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'
  import { TextAlign } from '@tiptap/extension-text-align'
  import { watch } from 'vue'

  const props = defineProps<{ modelValue: string }>()
  const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

  const editor = useEditor({
    content: props.modelValue,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false }
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] })
    ],
    editorProps: {
      attributes: {
        class:
          'tiptap min-h-40 px-3.5 py-3 text-base text-ink outline-none'
      }
    },
    onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML())
  })

  // Keep the editor in sync if the bound value is replaced externally.
  watch(
    () => props.modelValue,
    (value) => {
      if (editor.value && value !== editor.value.getHTML()) {
        editor.value.commands.setContent(value, { emitUpdate: false })
      }
    }
  )

  function setLink(instance: Editor) {
    const previous = instance.getAttributes('link').href as string | undefined
    const url = window.prompt('Enter URL', previous ?? '')
    if (url === null) return
    if (url === '') {
      instance.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    instance
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run()
  }
</script>

<template>
  <div class="overflow-hidden rounded-md border border-hairline-input bg-field">
    <div
      v-if="editor"
      class="flex flex-wrap items-center gap-0.5 border-b border-hairline px-2 py-1.5"
    >
      <button
        type="button"
        title="Bold"
        class="rt-btn"
        :class="editor.isActive('bold') && 'rt-btn--active'"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <Bold :size="16" />
      </button>
      <button
        type="button"
        title="Italic"
        class="rt-btn"
        :class="editor.isActive('italic') && 'rt-btn--active'"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <Italic :size="16" />
      </button>

      <span class="mx-1 h-5 w-px bg-hairline" />

      <button
        type="button"
        title="Heading 2"
        class="rt-btn"
        :class="editor.isActive('heading', { level: 2 }) && 'rt-btn--active'"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <Heading2 :size="16" />
      </button>
      <button
        type="button"
        title="Heading 3"
        class="rt-btn"
        :class="editor.isActive('heading', { level: 3 }) && 'rt-btn--active'"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        <Heading3 :size="16" />
      </button>

      <span class="mx-1 h-5 w-px bg-hairline" />

      <button
        type="button"
        title="Align left"
        class="rt-btn"
        :class="editor.isActive({ textAlign: 'left' }) && 'rt-btn--active'"
        @click="editor.chain().focus().setTextAlign('left').run()"
      >
        <AlignLeft :size="16" />
      </button>
      <button
        type="button"
        title="Align center"
        class="rt-btn"
        :class="editor.isActive({ textAlign: 'center' }) && 'rt-btn--active'"
        @click="editor.chain().focus().setTextAlign('center').run()"
      >
        <AlignCenter :size="16" />
      </button>
      <button
        type="button"
        title="Bullet list"
        class="rt-btn"
        :class="editor.isActive('bulletList') && 'rt-btn--active'"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <List :size="16" />
      </button>
      <button
        type="button"
        title="Ordered list"
        class="rt-btn"
        :class="editor.isActive('orderedList') && 'rt-btn--active'"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <ListOrdered :size="16" />
      </button>
      <button
        type="button"
        title="Link"
        class="rt-btn"
        :class="editor.isActive('link') && 'rt-btn--active'"
        @click="setLink(editor)"
      >
        <LinkIcon :size="16" />
      </button>

      <span class="mx-1 h-5 w-px bg-hairline" />

      <button
        type="button"
        title="Code"
        class="rt-btn"
        :class="editor.isActive('code') && 'rt-btn--active'"
        @click="editor.chain().focus().toggleCode().run()"
      >
        <Code :size="16" />
      </button>
    </div>

    <EditorContent :editor="editor" />
  </div>
</template>

<style scoped>
  .rt-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 1.75rem;
    width: 1.75rem;
    border-radius: 0.375rem;
    color: var(--text-muted);
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
  }
  .rt-btn:hover {
    background: var(--row-hover);
    color: var(--text);
  }
  .rt-btn--active {
    background: var(--accent-soft-bg);
    color: var(--accent);
  }

  /* The .tiptap (ProseMirror) DOM is generated, so element styling lives here. */
  :deep(.tiptap > * + *) {
    margin-top: 0.6em;
  }
  :deep(.tiptap h2) {
    font-size: 1.3rem;
    font-weight: 500;
    color: var(--text);
  }
  :deep(.tiptap h3) {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--text);
  }
  :deep(.tiptap ul) {
    list-style: disc;
    padding-left: 1.25rem;
  }
  :deep(.tiptap ol) {
    list-style: decimal;
    padding-left: 1.25rem;
  }
  :deep(.tiptap a) {
    color: var(--accent);
    text-decoration: underline;
  }
  :deep(.tiptap code) {
    background: var(--surface-2);
    border-radius: 0.25rem;
    padding: 0.1em 0.35em;
    font-size: 0.9em;
  }
  :deep(.tiptap:focus) {
    outline: none;
  }
</style>
