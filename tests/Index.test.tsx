import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Index from '../pages/index'
import '@testing-library/jest-dom/extend-expect'
import Router from 'next/router'

const mockedRouterPush = Router.push as jest.Mock<any>

jest.mock('firebase/app', () => {
  const data = { name: 'unnamed' }
  const exists = true
  const snapshot = {
    val: jest.fn(() => data),
    exists: jest.fn(() => exists)
  }

  return {
    apps: [],
    initializeApp: jest.fn().mockReturnValue({
      database: jest.fn().mockReturnValue({
        ref: jest.fn().mockReturnThis(),
        once: jest.fn(() => Promise.resolve(snapshot)),
        get: jest.fn(() => Promise.resolve(snapshot)),
      })
    })
  }
})

describe('Index', () => {
  test('when a youtube link is entered and Create Party button clicked the user is redirected to the new watch party page', async () => {
    let path = ''

    mockedRouterPush.mockImplementation((newPath: string) => {
      path = newPath
    })

    render(<Index />)

    screen.getByText('Have a Watch Party code? Enter it here:')
    screen.getByText('Or, start a new Watch Party by pasting a YouTube link:')

    userEvent.type(screen.getByRole('textbox', { name: 'Create Party' }), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    userEvent.click(screen.getByRole('button', { name: 'Create Party' }))

    await waitFor(() => expect(path).toBe('/watch/WHATEVER'))
  })

  test('when given an invalid YouTube Video URL and Create Party button clicked it shows a browser alert', async () => {
    let path = ''

    mockedRouterPush.mockImplementation((newPath: string) => {
      path = newPath
    })

    render(<Index />)

    screen.getByText('Have a Watch Party code? Enter it here:')
    screen.getByText('Or, start a new Watch Party by pasting a YouTube link:')

    userEvent.type(screen.getByRole('textbox', { name: 'Create Party' }), 'https://www.youtube.com/notvalid')
    jest.spyOn(window, 'alert').mockImplementation(() => {})
    userEvent.click(screen.getByRole('button', { name: 'Create Party' }))

    expect(path).toBe('')
    expect(window.alert).toBeCalledWith('Enter a valid YouTube URL or YouTube Video ID then try again.')

    userEvent.type(screen.getByRole('textbox', { name: 'Create Party' }), 'dQw4w9WgXcQ1') // Invalid because all YouTube Video IDs have 11 characters.
    jest.spyOn(window, 'alert').mockImplementation(() => {})
    userEvent.click(screen.getByRole('button', { name: 'Create Party' }))

    await waitFor(() => expect(path).toBe(''))
  })

  // TODO: Test joining valid existing party
  // TODO: Test joining invalid/nonexisting party
})
