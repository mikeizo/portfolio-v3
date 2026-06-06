<script lang="ts">
  // Shared across all instances so only one menu is open at a time. Clicking a
  // trigger closes whichever menu was previously open before opening its own.
  let closeActive: (() => void) | null = null
</script>

<script setup lang="ts">
  import type { DropdownItem } from '@/types/admin'

  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { EllipsisVertical } from 'lucide-vue-next'

  const props = withDefaults(
    defineProps<{
      items: DropdownItem[]
      align?: 'start' | 'end'
    }>(),
    { align: 'end' }
  )

  const open = ref(false)
  const triggerRef = ref<HTMLButtonElement | null>(null)
  // position:fixed keeps the panel from being clipped by the table's
  // overflow-x-auto wrapper on mobile; coords are measured from the trigger when
  // the menu opens. (Teleport caused an insertBefore crash with multiple rows.)
  const position = ref<{ top: number; left?: number; right?: number }>({
    top: 0
  })

  function updatePosition() {
    const el = triggerRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    position.value =
      props.align === 'end'
        ? { top: rect.bottom + 4, right: window.innerWidth - rect.right }
        : { top: rect.bottom + 4, left: rect.left }
  }

  function close() {
    open.value = false
    if (closeActive === close) closeActive = null
  }

  function toggle() {
    if (open.value) {
      close()
      return
    }
    closeActive?.()
    closeActive = close
    open.value = true
    updatePosition()
  }

  async function runItem(item: DropdownItem) {
    close()
    await item.onSelect?.()
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') close()
  }

  onMounted(() => {
    document.addEventListener('click', close)
    document.addEventListener('keydown', onKeydown)
    // Capture phase so scrolling any nested container (not just window) closes it.
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('click', close)
    document.removeEventListener('keydown', onKeydown)
    window.removeEventListener('scroll', close, true)
    window.removeEventListener('resize', close)
    if (closeActive === close) closeActive = null
  })
</script>

<template>
  <button
    ref="triggerRef"
    type="button"
    aria-label="Actions"
    :aria-expanded="open"
    class="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-row-hover hover:text-ink"
    @click.stop="toggle"
  >
    <slot name="trigger">
      <EllipsisVertical :size="18" />
    </slot>
  </button>

  <div
    v-if="open"
    class="fixed z-50 min-w-[180px] rounded-lg border border-hairline bg-surface p-1.5 shadow-pop"
    :style="{
      top: `${position.top}px`,
      left: position.left != null ? `${position.left}px` : undefined,
      right: position.right != null ? `${position.right}px` : undefined
    }"
    @click.stop
  >
    <template v-for="(item, index) in items" :key="index">
      <div
        v-if="item.type === 'label'"
        class="px-2.5 py-1.5 text-[13px] text-muted"
      >
        {{ item.label }}
      </div>

      <hr v-else-if="item.type === 'separator'" class="my-1 border-hairline" />

      <a
        v-else-if="item.type === 'link'"
        :href="item.to"
        :target="item.target"
        class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] transition-colors hover:bg-row-hover hover:text-ink"
        :class="item.danger ? 'text-danger' : 'text-ink-secondary'"
        @click="close"
      >
        <component
          :is="item.icon"
          v-if="item.icon"
          :size="16"
          class="shrink-0"
          :class="item.danger ? 'text-danger' : 'text-muted'"
        />
        {{ item.label }}
      </a>

      <button
        v-else
        type="button"
        class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] transition-colors hover:bg-row-hover hover:text-ink"
        :class="item.danger ? 'text-danger' : 'text-ink-secondary'"
        @click="runItem(item)"
      >
        <component
          :is="item.icon"
          v-if="item.icon"
          :size="16"
          class="shrink-0"
          :class="item.danger ? 'text-danger' : 'text-muted'"
        />
        {{ item.label }}
      </button>
    </template>
  </div>
</template>
