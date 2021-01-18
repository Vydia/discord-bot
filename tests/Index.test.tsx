import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Index from '../pages/index'
import '@testing-library/jest-dom/extend-expect'
import Router from 'next/router'

const mockedRouterPush = Router.push as jest.Mock<any>

describe('Index', () => {
  test('when given a valid YouTube Video URL it navigates to the /watch/XXX path for a valid YouTube Video ID', async () => {
    let path = ''

    mockedRouterPush.mockImplementation((newPath: string) => {
      path = newPath
    })

    render(<Index />)

    screen.getByText('Enter a YouTube link to start or join a Watch Party!')

    userEvent.type(screen.getByRole('textbox'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ?hasContropl=true')
    userEvent.click(screen.getByRole('button'))

    expect(path).toBe('/watch/dQw4w9WgXcQ?hasControl=true')
  })

  test('when given a valid YouTube Video ID it navigates to the /watch/XXX path for a valid YouTube Video ID', async () => {
    let path = ''

    mockedRouterPush.mockImplementation((newPath: string) => {
      path = newPath
    })

    render(<Index />)

    screen.getByText('Enter a YouTube link to start or join a Watch Party!')

    userEvent.type(screen.getByRole('textbox'), 'dQw4w9WgXcQ')
    userEvent.click(screen.getByRole('button'))

    expect(path).toBe('/watch/dQw4w9WgXcQ?hasControl=true')
  })

  test('when given an invalid YouTube Video URL it shows a browser alert', async () => {
    let path = ''

    mockedRouterPush.mockImplementation((newPath: string) => {
      path = newPath
    })

    render(<Index />)

    screen.getByText('Enter a YouTube link to start or join a Watch Party!')

    userEvent.type(screen.getByRole('textbox'), 'https://www.youtube.com/notvalid')
    jest.spyOn(window, 'alert').mockImplementation(() => {})
    userEvent.click(screen.getByRole('button'))

    expect(path).toBe('')
    expect(window.alert).toBeCalledWith('Oops! Try entering a valid YouTube URL or Video ID this time.')

    userEvent.type(screen.getByRole('textbox'), 'dQw4w9WgXcQ1') // Invalid because all YouTube Video IDs have 11 characters.
    jest.spyOn(window, 'alert').mockImplementation(() => {})
    userEvent.click(screen.getByRole('button'))

    expect(path).toBe('')
  })
})
