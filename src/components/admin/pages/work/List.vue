<script setup lang="ts">
  import type { Row } from '@tanstack/vue-table'
  import type { TableColumn } from '@nuxt/ui'
  import type { WorkType } from '@/types/portfolio'

  import { h, onMounted, ref, resolveComponent } from 'vue'
  import { adminRequest } from '@/utils/request'
  import { getDataFeed } from '@/utils/api'
  import { truncateString } from '@/utils/forms'

  const props = defineProps<{
    data: WorkType[]
    path: string
  }>()

  const UButton = resolveComponent('UButton')
  const UDropdownMenu = resolveComponent('UDropdownMenu')
  const workData = ref(props.data)

  const columns: TableColumn<WorkType>[] = [
    {
      accessorKey: '_id',
      header: ''
    },
    {
      accessorKey: 'weight',
      header: 'Weight',
      enableSorting: true
    },
    {
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      enableSorting: true
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        return truncateString(row.getValue('description'), 75)
      }
    },
    {
      id: 'actions',
      meta: {
        class: {
          td: 'text-right'
        }
      },
      cell: ({ row }) => {
        return h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row),
            'aria-label': 'Actions dropdown'
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              'aria-label': 'Actions dropdown'
            })
        )
      }
    }
  ]

  function getRowItems(row: Row<WorkType>) {
    const id = row.getValue('_id')

    return [
      {
        type: 'label',
        label: 'Actions'
      },
      {
        type: 'separator'
      },
      {
        label: 'Edit',
        icon: 'i-lucide-pencil',
        type: 'link',
        to: `${props.path}/${id}`,
        target: '_self'
      },
      {
        label: 'Delete',
        icon: 'i-lucide-trash',
        async onSelect() {
          await adminRequest(
            'DELETE',
            'work',
            { id },
            'Work record has been deleted'
          )

          // Update experience list
          workData.value = await getDataFeed('work', 'weight', 'asc')
        }
      }
    ]
  }

  onMounted(() => {
    const toast = useToast()
    const params = new URLSearchParams(window.location.search)

    if (params.get('toast') === 'work-created') {
      toast.add({
        title: 'Success',
        description: 'Work record has been added.',
        color: 'success'
      })

      history.replaceState({}, '', '/admin/work')
    }
  })
</script>

<template>
  <div class="flex justify-end">
    <UButton
      type="submit"
      class="flex items-center justify-center cursor-pointer"
      size="xl"
      trailing-icon="i-lucide-circle-plus"
      to="/admin/work/new"
    >
      Add
    </UButton>
  </div>
  <UTable
    class="flex-1"
    :data="workData"
    :columns="columns"
    :column-visibility="{ _id: false }"
  />
</template>
