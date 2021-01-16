import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import Index from '../pages/index'

describe('Index', () => {
  test('displays the heading', async () => {
    render(<Index />)

    screen.getByText('Hello!')
  })
})
