;(() => {
  try {
    const storedMode = localStorage.getItem('theme')
    const dark = storedMode
      ? storedMode === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    if (localStorage.getItem('readingFont') === 'dyslexic') {
      document.documentElement.dataset.font = 'dyslexic'
    }
  } catch {
    // The theme composable applies the default when storage is unavailable.
  }
})()
