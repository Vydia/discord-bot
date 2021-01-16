import '@testing-library/jest-dom/extend-expect'
import '@testing-library/jest-dom'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(),
  default: {
    push: jest.fn((newPath: string) => {
      console.warn(`Unmocked Router.push('${newPath}') You should probably mock Router.push in your test.`)
    })
  }
}))

// Solves this error: https://github.com/vercel/next.js/issues/18415#issuecomment-718180659
// TypeError: Cannot destructure property 'deviceSizes' of 'imageData' as it is undefined.
// > 1 | import Image from "next/image"
//     | ^
//   2 |
process.env = {
  ...process.env,
  __NEXT_IMAGE_OPTS: {
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [],
    domains: ['images.example.com'],
    path: '/_next/image',
    loader: 'default',
  },
} as any
