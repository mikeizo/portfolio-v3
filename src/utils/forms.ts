import type { EditorToolbarItem } from '@nuxt/ui'

// Editor toolbar items
export const editorItems: EditorToolbarItem[][] = [
  [
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold' },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic' }
  ],
  [
    // { kind: 'heading', level: 1, icon: 'i-lucide-heading-1' },
    { kind: 'heading', level: 2, icon: 'i-lucide-heading-2' },
    { kind: 'heading', level: 3, icon: 'i-lucide-heading-3' }
  ],
  [
    { kind: 'textAlign', align: 'left', icon: 'i-lucide-align-left' },
    { kind: 'textAlign', align: 'center', icon: 'i-lucide-align-center' },
    { kind: 'bulletList', icon: 'i-lucide-list' },
    { kind: 'orderedList', icon: 'i-lucide-list-ordered' },
    { kind: 'link', icon: 'i-lucide-link' }
  ],
  [{ kind: 'mark', mark: 'code', icon: 'i-lucide-code' }]
]

export const truncateString = (text: string, limit = 100) => {
  if (text.length > limit) {
    return `${text.slice(0, limit)} ...`
  } else {
    return text
  }
}
