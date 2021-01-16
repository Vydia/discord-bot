import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Index from '../pages/index'
import '@testing-library/jest-dom/extend-expect'
import Router from 'next/router'

const mockedRouterPush = Router.push as jest.Mock<any>

describe('Index', () => {
  test('displays the heading', async () => {
    let path: string = ''

    mockedRouterPush.mockImplementation((newPath: string) => {
      path = newPath
    })

    render(<Index />)

    screen.getByText('Enter a YouTube link to start or join a Watch Party!')

    userEvent.type(screen.getByRole('textbox'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    userEvent.click(screen.getByRole('button'))

    expect(path).toBe('/watch/dQw4w9WgXcQ')
  })
})
