/**
 * Unit tests for Card component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card Component', () => {
  test('renders card with content', () => {
    render(
      <Card>
        <CardContent>Card content</CardContent>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  test('renders card with header', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description')).toBeInTheDocument();
  });

  test('renders card with footer', () => {
    render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  test('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  test('applies custom className to card', () => {
    render(
      <Card className="custom-card">
        <CardContent>Content</CardContent>
      </Card>
    );
    
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('custom-card');
  });

  test('applies custom className to card parts', () => {
    render(
      <Card>
        <CardHeader className="custom-header" data-testid="header">
          <CardTitle className="custom-title">Title</CardTitle>
        </CardHeader>
        <CardContent className="custom-content" data-testid="content">Content</CardContent>
        <CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Title')).toHaveClass('custom-title');
    expect(screen.getByTestId('content')).toHaveClass('custom-content');
    expect(screen.getByTestId('footer')).toHaveClass('custom-footer');
  });
});
