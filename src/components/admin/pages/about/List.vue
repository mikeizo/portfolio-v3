<script setup lang="ts">
  import type { AboutType } from '@/types/portfolio'
  import type { Row } from '@tanstack/vue-table'
  import type { TableColumn } from '@nuxt/ui'

  import { h, onMounted, ref, resolveComponent } from 'vue'
  import { adminRequest } from '@/utils/request'
  import { getDataFeed } from '@/utils/api'

  const props = defineProps<{
    data: AboutType[]
    path: string
  }>()

  const UButton = resolveComponent('UButton')
  const UDropdownMenu = resolveComponent('UDropdownMenu')
  const aboutData = ref(props.data)

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
        async onSelect() {
          await adminRequest(
            'DELETE',
            'about',
            { id },
            'About record has been deleted'
          )

          // Update experience list
          aboutData.value = await getDataFeed('about', 'year', 'asc')
        }
      }
    ]
  }

  onMounted(() => {
    const toast = useToast()
    const params = new URLSearchParams(window.location.search)

    if (params.get('toast') === 'about-created') {
      toast.add({
        title: 'Success',
        description: 'About record has been added.',
        color: 'success'
      })

      history.replaceState({}, '', '/admin/about')
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
      to="/admin/about/new"
    >
      Add
    </UButton>
  </div>
  <UTable
    class="flex-1"
    :data="aboutData"
    :columns="columns"
    :column-visibility="{ _id: false }"
  />
</template>
