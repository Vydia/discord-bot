/* eslint-disable prefer-const */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Index from '../pages/index'
import { AuthContext } from '../components/providers/FirebaseAuthProvider'
import '@testing-library/jest-dom/extend-expect'
import Router from 'next/router'

const mockedRouterPush = Router.push as jest.Mock<any>

// Override these in a specific test
let mockAuthUser: any = {
  uid: '123456789'
}
let mockDatabase: any

jest.mock('firebase/app', () => {
  return {
    apps: [],
    initializeApp: jest.fn().mockReturnValue({
      database: jest.fn().mockReturnValue({
        ref: jest.fn((ref) => {
          const data = mockDatabase && mockDatabase[ref]

          const snapshot = {
            val: jest.fn(() => data),
            exists: jest.fn(() => !!data)
          }

          return {
            once: jest.fn(() => Promise.resolve(snapshot)),
            get: jest.fn(() => Promise.resolve(snapshot)),
            set: jest.fn(),
          }
        }),
      })
    })
  }
})

let mockPartyId = 'XQC3'
jest.mock('../lib/generatePartyId', () => ({
  generatePartyId: () => mockPartyId,
}))

describe('Index', () => {
  test('when a youtube link is entered and Create Party button clicked the user is redirected to the new watch party page', async () => {
    mockDatabase = {
      // Setting all these to undefined is redundant, but here to show intent that there is no data there yet.
      [`parties/${mockPartyId}`]: undefined,
      [`party/${mockAuthUser.uid}/${mockPartyId}/video`]: undefined,
      [`party/${mockAuthUser.uid}/${mockPartyId}/playing`]: undefined,
      [`party/${mockAuthUser.uid}/${mockPartyId}/seek`]: undefined,
    }
    let path = ''

    mockedRouterPush.mockImplementation((newPath: string) => {
      path = newPath
    })

    render(<AuthContext.Provider value={mockAuthUser}><Index /></AuthContext.Provider>)

    screen.getByText('Have a Watch Party code? Enter it here:')
    screen.getByText('Or, start a new Watch Party by pasting a YouTube link:')

    userEvent.type(screen.getByRole('textbox', { name: 'Create Party' }), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    userEvent.click(screen.getByRole('button', { name: 'Create Party' }))

    await waitFor(() => expect(path).toBe(`/watch/${mockPartyId}`))
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
