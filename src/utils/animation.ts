export function splitText(text: string, delay = 0) {
  const textArr = text.split('')

  return textArr
    .map((item, index) => {
      const seconds = 0.02 * index + delay
      const content = item === ' ' ? '&nbsp;' : item

      return `<span class="blur-in" style="animation-delay:${seconds}s">
      ${content}
    </span>`
    })
    .join('')
}
