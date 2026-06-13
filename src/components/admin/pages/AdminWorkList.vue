<script setup lang="ts">
  import type { DropdownItem } from '@/types/admin'
  import type { WorkType } from '@/types/portfolio'

  import { CirclePlus, Eye, Pencil, Trash } from 'lucide-vue-next'
  import { onMounted, ref } from 'vue'
  import { addToast } from '@/stores/toasts'
  import { useConfirmDelete } from '@/composables/useConfirmDelete'
  import { useCurrentUser } from '@/composables/useCurrentUser'

  import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
  import DropdownMenu from '@/components/admin/DropdownMenu.vue'

  const { isGuest } = useCurrentUser()

  const props = defineProps<{ data: WorkType[] }>()

  const workData = ref<WorkType[]>([...props.data])

  const {
    isOpen: confirmOpen,
    loading: deleting,
    request: requestDelete,
    confirm: confirmDelete,
    cancel: cancelDelete
  } = useConfirmDelete<string>((id) => deleteWork(id))

  const base = '/admin/work'

  // Rich-text descriptions are stored as sanitized HTML; show plain text in the
  // table cell. Regex strip (not DOMParser) keeps this safe during SSR hydration.
  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '').trim()

  function rowItems(row: WorkType): DropdownItem[] {
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
              onSelect: () => requestDelete(id)
            } satisfies DropdownItem
          ])
    ]
  }

  async function deleteWork(id: string) {
    try {
      const response = await fetch('/api/admin/work', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const body = await response.json().catch(() => ({}))

      if (response.ok) {
        workData.value = workData.value.filter((w) => w._id !== id)
        addToast({
          type: 'success',
          title: 'Deleted',
          description: 'Work record has been deleted.'
        })
      } else {
        addToast({
          type: 'error',
          title: 'Delete failed',
          description: body.error || 'Failed to delete work record.'
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

    if (params.get('toast') === 'work-created') {
      addToast({
        type: 'success',
        title: 'Added',
        description: 'Work record has been added.'
      })
      history.replaceState({}, '', base)
    }
  })
</script>

<template>
  <div class="mb-7 flex items-start justify-between gap-4">
    <h1 class="text-4xl font-light tracking-[-0.7px] text-ink">Work</h1>

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
          <th class="px-4 py-3 font-semibold">Weight</th>
          <th class="px-4 py-3 font-semibold">Name</th>
          <th class="px-4 py-3 font-semibold">Slug</th>
          <th class="px-4 py-3 font-semibold">Description</th>
          <th class="px-4 py-3" />
        </tr>
      </thead>
      <tbody>
        <tr v-if="!workData.length">
          <td colspan="5" class="px-4 py-8 text-center text-muted">
            No work records yet.
          </td>
        </tr>
        <tr
          v-for="row in workData"
          :key="row._id"
          class="border-b border-hairline last:border-0 transition-colors hover:bg-row-hover"
        >
          <td class="tnum px-4 py-3 text-ink">{{ row.weight }}</td>
          <td class="px-4 py-3 text-ink">{{ row.name }}</td>
          <td class="px-4 py-3 text-muted">{{ row.slug }}</td>
          <td class="px-4 py-3">
            <p class="line-clamp-2 max-w-md text-muted">
              {{ stripHtml(row.description) }}
            </p>
          </td>
          <td class="px-4 py-3 text-right">
            <DropdownMenu :items="rowItems(row)" align="end" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <ConfirmDialog
    :open="confirmOpen"
    :loading="deleting"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />
</template>
