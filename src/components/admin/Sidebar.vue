<script setup lang="ts">
  import {
    ArrowUpRight,
    ChevronDown,
    CodeXml,
    FileText,
    Globe,
    Settings
  } from 'lucide-vue-next'
  import type { NavGroup, NavItem } from '@/types/admin'
  import { reactive } from 'vue'

  const props = defineProps<{
    mobileOpen: boolean
    rail: boolean
    pathname: string
  }>()

  const emit = defineEmits<{ navigate: []; expand: [] }>()

  const base = '/admin'

  function isGroup(item: NavItem): item is NavGroup {
    return 'children' in item
  }

  const navItems: NavItem[] = [
    {
      label: 'Pages',
      icon: FileText,
      defaultOpen: true,
      children: [
        { label: 'About', to: `${base}/about` },
        { label: 'Work', to: `${base}/work` }
      ]
    },
    { label: 'Experience', to: `${base}/experience`, icon: CodeXml },
    { label: 'Settings', to: `${base}/settings`, icon: Settings }
  ]

  // Open/closed state per group, keyed by label and seeded from defaultOpen.
  const openGroups = reactive<Record<string, boolean>>(
    Object.fromEntries(
      navItems
        .filter(isGroup)
        .map((group) => [group.label, group.defaultOpen ?? false])
    )
  )

  function isActive(path: string) {
    return props.pathname === path || props.pathname.startsWith(`${path}/`)
  }

  function groupActive(group: NavGroup) {
    return group.children.some((child) => isActive(child.to))
  }

  // Collapsed rail: a group has no destination of its own, so a click expands
  // the rail (persisted by the parent) and forces the submenu open so the
  // children are reachable. Expanded/mobile: plain toggle.
  function onGroupClick(group: NavGroup) {
    if (props.rail && window.matchMedia('(min-width: 1024px)').matches) {
      emit('expand')
      openGroups[group.label] = true
    } else {
      openGroups[group.label] = !openGroups[group.label]
    }
  }
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-61 min-w-0 flex-col overflow-hidden border-r border-hairline bg-sidebar transition-transform duration-200 lg:static lg:z-auto lg:w-full lg:translate-x-0"
    :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- wordmark -->
    <div
      class="flex h-14 shrink-0 items-center gap-2 px-5 border-b border-hairline"
    >
      <span
        class="whitespace-nowrap text-2xl font-light text-ink rail:lg:hidden"
      >
        MikeTropea<span class="text-accent">.</span>
      </span>
      <span class="hidden text-2xl font-light text-ink rail:lg:inline-block">
        MT<span class="text-accent">.</span>
      </span>
    </div>

    <!-- nav -->
    <nav class="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      <template v-for="item in navItems" :key="item.label">
        <!-- group with children -->
        <template v-if="isGroup(item)">
          <button
            type="button"
            class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-light text-ink-secondary transition-colors hover:bg-row-hover hover:text-ink rail:lg:justify-center"
            :class="groupActive(item) && 'text-accent'"
            :title="item.label"
            @click="onGroupClick(item)"
          >
            <component
              :is="item.icon"
              :size="18"
              class="shrink-0"
              :class="groupActive(item) ? 'text-accent' : 'text-muted'"
            />
            <span class="whitespace-nowrap rail:lg:hidden">
              {{ item.label }}
            </span>
            <ChevronDown
              :size="15"
              class="ml-auto text-faint transition-transform duration-200 rail:lg:hidden"
              :class="openGroups[item.label] && 'rotate-180'"
            />
          </button>

          <div
            v-if="openGroups[item.label]"
            class="flex flex-col gap-px overflow-hidden rail:lg:hidden"
          >
            <a
              v-for="child in item.children"
              :key="child.to"
              :href="child.to"
              class="rounded-md py-2 pl-10 pr-3 text-sm transition-colors hover:bg-row-hover hover:text-ink"
              :class="
                isActive(child.to) ? 'font-normal text-accent' : 'text-muted'
              "
            >
              {{ child.label }}
            </a>
          </div>
        </template>

        <!-- plain link -->
        <a
          v-else
          :href="item.to"
          class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-light transition-colors hover:bg-row-hover hover:text-ink rail:lg:justify-center"
          :class="
            isActive(item.to)
              ? 'bg-accent-soft font-normal text-accent'
              : 'text-ink-secondary'
          "
          :title="item.label"
          @click="$emit('navigate')"
        >
          <component
            :is="item.icon"
            :size="18"
            class="shrink-0"
            :class="isActive(item.to) ? 'text-accent' : 'text-muted'"
          />
          <span class="whitespace-nowrap rail:lg:hidden">{{ item.label }}</span>
        </a>
      </template>
    </nav>

    <!-- footer: external site link -->
    <div class="shrink-0 border-t border-hairline p-3">
      <a
        href="/"
        target="_blank"
        class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-light text-muted transition-colors hover:bg-row-hover hover:text-ink rail:lg:justify-center"
        title="Site"
      >
        <Globe :size="18" class="shrink-0 text-muted" />
        <span class="whitespace-nowrap rail:lg:hidden">Site</span>
        <ArrowUpRight :size="14" class="ml-auto rail:lg:hidden" />
      </a>
    </div>
  </aside>
</template>
