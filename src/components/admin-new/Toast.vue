<script setup lang="ts">
  import type { Component } from 'vue'
  import type { ToastType } from '@/stores/toasts'

  import { Bell, CheckCircle2, X, XCircle } from 'lucide-vue-next'
  import { useStore } from '@nanostores/vue'

  import { $toasts, removeToast } from '@/stores/toasts'

  const toasts = useStore($toasts)

  // Per-type icon + the color utilities for the icon and countdown bar.
  const variants: Record<
    ToastType,
    { icon: Component; icon_class: string; bar_class: string }
  > = {
    success: {
      icon: CheckCircle2,
      icon_class: 'text-success',
      bar_class: 'bg-success'
    },
    error: { icon: XCircle, icon_class: 'text-danger', bar_class: 'bg-danger' },
    info: { icon: Bell, icon_class: 'text-muted', bar_class: 'bg-accent' }
  }
</script>

<template>
  <TransitionGroup
    tag="div"
    name="toast"
    class="pointer-events-none fixed bottom-0 right-0 z-50 flex w-full max-w-[360px] flex-col gap-3 p-4"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast pointer-events-auto relative overflow-hidden rounded-lg border border-hairline bg-surface shadow-pop"
    >
      <div class="flex items-start gap-3 p-3.5">
        <component
          :is="variants[toast.type].icon"
          :size="18"
          :class="variants[toast.type].icon_class"
          class="mt-px shrink-0"
        />
        <div class="min-w-0 flex-1">
          <p class="text-[13.5px] font-medium text-ink">{{ toast.title }}</p>
          <p v-if="toast.description" class="mt-0.5 text-[13px] text-muted">
            {{ toast.description }}
          </p>
        </div>
        <button
          type="button"
          title="Dismiss"
          class="-mr-1 -mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md text-faint transition-colors hover:text-ink"
          @click="removeToast(toast.id)"
        >
          <X :size="15" />
        </button>
      </div>

      <!-- Countdown: the CSS animation drives both the visual depletion and the
           dismissal (via animationend). Hovering the card pauses it (see <style>),
           so bar and auto-dismiss stay in lockstep. -->
      <span
        class="toast__bar absolute bottom-0 left-0 h-[3px] w-full origin-left"
        :class="variants[toast.type].bar_class"
        @animationend="removeToast(toast.id)"
      />
    </div>
  </TransitionGroup>
</template>

<style scoped>
  .toast__bar {
    animation: toast-countdown 5s linear forwards;
  }

  /* Pause both the bar and the auto-dismiss while the card is hovered. */
  .toast:hover .toast__bar {
    animation-play-state: paused;
  }

  @keyframes toast-countdown {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }

  .toast-enter-active,
  .toast-leave-active {
    transition:
      transform 0.28s ease,
      opacity 0.28s ease;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: translateX(110%);
    opacity: 0;
  }

  /* Smoothly slide remaining toasts up when one above is removed. */
  .toast-move {
    transition: transform 0.28s ease;
  }
</style>
