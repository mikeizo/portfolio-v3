<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import type { MenuItemsType } from '@/types/portfolio.d'

  const INDICATOR_WIDTH = 10

  const props = defineProps<{
    site: string
    path: string
    menuItems: MenuItemsType
  }>()

  const isActive = (pathName: string) => props.path === pathName

  const menuRef = ref<HTMLUListElement | null>(null)
  const hoveredIndex = ref<number | null>(null)
  const direction = ref<'forward' | 'backward'>('forward')
  const isReady = ref(false)

  const activeIndex = computed(() =>
    props.menuItems.findIndex((item) => isActive(item.url))
  )

  const targetIndex = computed(() =>
    hoveredIndex.value !== null ? hoveredIndex.value : activeIndex.value
  )

  const positionIndicator = () => {
    const menu = menuRef.value
    if (!menu || targetIndex.value < 0) return

    const target =
      menu.querySelectorAll<HTMLLIElement>('.nav__link')[targetIndex.value]
    if (!target) return

    const menuRect = menu.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const left =
      targetRect.left -
      menuRect.left +
      targetRect.width / 2 -
      INDICATOR_WIDTH / 2

    menu.style.setProperty('--indicator-left', `${left}px`)
    menu.style.setProperty(
      '--indicator-right',
      `${menuRect.width - left - INDICATOR_WIDTH}px`
    )
  }

  watch(targetIndex, (next, prev) => {
    direction.value = next > prev ? 'forward' : 'backward'
    positionIndicator()
  })

  const onResize = () => positionIndicator()

  onMounted(() => {
    positionIndicator()
    requestAnimationFrame(() => (isReady.value = true))
    window.addEventListener('resize', onResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
  })

  defineOptions({
    name: 'Nav'
  })
</script>

<template>
  <nav class="nav">
    <ul
      ref="menuRef"
      class="nav__menu"
      :data-dir="direction"
      :data-ready="isReady ? '' : null"
      @mouseleave="hoveredIndex = null"
    >
      <li
        v-for="(item, index) in menuItems"
        :key="`${item.title}-${index}`"
        class="nav__link"
        :class="{ 'nav__link--active': isActive(item.url) }"
        :aria-label="item.title"
        @mouseenter="hoveredIndex = index"
      >
        <a :href="`${site}/${item.url}`">{{ item.title }}</a>
      </li>
    </ul>
  </nav>
</template>
