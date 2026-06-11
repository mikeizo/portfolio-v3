<script setup lang="ts">
  import type { AboutType } from '@/types/portfolio'
  import type { DropdownItem } from '@/types/admin'

  import { CirclePlus, Eye, Pencil, Trash } from 'lucide-vue-next'
  import { onMounted, ref } from 'vue'
  import { addToast } from '@/stores/toasts'
  import { useCurrentUser } from '@/composables/useCurrentUser'

  import DropdownMenu from '@/components/admin-new/DropdownMenu.vue'

  const { isGuest } = useCurrentUser()

  const props = defineProps<{ data: AboutType[] }>()

  const aboutData = ref<AboutType[]>([...props.data])

  const base = '/admin-new/about'

  // Rich-text descriptions are stored as sanitized HTML; show plain text in the
  // table cell. Regex strip (not DOMParser) keeps this safe during SSR hydration.
  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '').trim()

  function rowItems(row: AboutType): DropdownItem[] {
    const id = row._id ?? ''

    return [
      { type: 'label', label: 'Actions' },
      { type: 'separator' },
      {
        type: 'link',
        label: isGuest.value ? 'View' : 'Edit',
        icon: isGuest.value ? Eye : Pencil,
        to: `${base}/${id}`
      },
      ...(isGuest.value
        ? []
        : [
            {
              label: 'Delete',
              icon: Trash,
              danger: true,
              onSelect: () => deleteAbout(id)
            } satisfies DropdownItem
          ])
    ]
  }

  async function deleteAbout(id: string) {
    try {
      const response = await fetch('/api/admin/about', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const body = await response.json().catch(() => ({}))

      if (response.ok) {
        aboutData.value = aboutData.value.filter((a) => a._id !== id)
        addToast({
          type: 'success',
          title: 'Deleted',
          description: 'About record has been deleted.'
        })
      } else {
        addToast({
          type: 'error',
          title: 'Delete failed',
          description: body.error || 'Failed to delete about record.'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Delete failed',
        description: (error as Error).message || 'An unexpected error occurred.'
      })
    }
  }

  onMounted(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('toast') === 'about-created') {
      addToast({
        type: 'success',
        title: 'Added',
        description: 'About record has been added.'
      })
      history.replaceState({}, '', base)
    }
  })
</script>

<template>
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-4xl font-light mb-7 text-ink">About</h1>
    </div>

    <a
      v-if="!isGuest"
      :href="`${base}/new`"
      class="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-base font-normal text-on-accent transition-colors hover:bg-accent-deep active:bg-accent-press"
    >
      Add
      <CirclePlus :size="16" />
    </a>
  </div>

  <div
    class="overflow-x-auto rounded-lg border border-hairline bg-surface shadow-card"
  >
    <table class="w-full min-w-170 text-left text-sm">
      <thead>
        <tr class="border-b border-hairline text-sm text-muted">
          <th class="px-4 py-3 font-semibold">Year From</th>
          <th class="px-4 py-3 font-semibold">Year To</th>
          <th class="px-4 py-3 font-semibold">Description</th>
          <th class="px-4 py-3 font-semibold">Image</th>
          <th class="px-4 py-3" />
        </tr>
      </thead>
      <tbody>
        <tr v-if="!aboutData.length">
          <td colspan="5" class="px-4 py-8 text-center text-muted">
            No about records yet.
          </td>
        </tr>
        <tr
          v-for="row in aboutData"
          :key="row._id"
          class="border-b border-hairline last:border-0 transition-colors hover:bg-row-hover"
        >
          <td class="tnum px-4 py-3 text-ink">{{ row.yearFrom }}</td>
          <td class="tnum px-4 py-3 text-ink">{{ row.yearTo || '—' }}</td>
          <td class="px-4 py-3">
            <p class="line-clamp-2 max-w-md text-muted">
              {{ stripHtml(row.description) }}
            </p>
          </td>
          <td class="px-4 py-3 text-muted">{{ row.image || '—' }}</td>
          <td class="px-4 py-3 text-right">
            <DropdownMenu :items="rowItems(row)" align="end" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
