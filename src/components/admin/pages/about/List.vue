<script setup lang="ts">
  import type { AboutType } from '@/types/portfolio'
  import type { Row } from '@tanstack/vue-table'
  import type { TableColumn } from '@nuxt/ui'

  import { h, resolveComponent } from 'vue'

  const props = defineProps<{
    data: AboutType[]
    path: string
  }>()

  const UButton = resolveComponent('UButton')
  const UDropdownMenu = resolveComponent('UDropdownMenu')

  const columns: TableColumn<AboutType>[] = [
    {
      accessorKey: '_id',
      header: ''
    },
    {
      accessorKey: 'yearFrom',
      header: 'Year From',
      enableSorting: true
    },
    {
      accessorKey: 'yearTo',
      header: 'Year To',
      enableSorting: true
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        return row.getValue('description')
      }
    },
    {
      accessorKey: 'image',
      header: 'Image'
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

  function getRowItems(row: Row<AboutType>) {
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
        onSelect() {
          console.log('row delete', id)
        }
      }
    ]
  }
</script>

<template>
  <UTable
    class="flex-1"
    :data="data"
    :columns="columns"
    :column-visibility="{ _id: false }"
  />
</template>
