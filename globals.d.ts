import '@testing-library/jest-dom/extend-expect'

declare global {
  interface Window { YT: any }
}

window.YT = window.YT || {}
