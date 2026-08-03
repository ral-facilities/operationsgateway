import { act, render } from '@testing-library/react';
import React from 'react';
import { useScrollSync } from './useScrollSync';

describe('useScrollSync', () => {
  let refs: React.MutableRefObject<HTMLDivElement | null>[] = [];
  let scrollDirection: Parameters<typeof useScrollSync>[1] = 'both';
  beforeEach(() => {
    refs = [
      React.createRef<HTMLDivElement>(),
      React.createRef<HTMLDivElement>(),
    ];
    scrollDirection = 'both';
  });

  function TestComponent() {
    useScrollSync(refs, scrollDirection);

    return (
      <>
        <div ref={refs[0]} />
        <div ref={refs[1]} />
      </>
    );
  }

  it('syncs vertical and horizontal scroll positions', () => {
    render(<TestComponent />);

    const [source, target] = refs.map((ref) => ref.current as HTMLDivElement);

    source.scrollTop = 50;
    source.scrollLeft = 100;

    act(() => {
      source.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    expect(target.scrollTop).toBe(50);
    expect(target.scrollLeft).toBe(100);
  });

  it('syncs horizontal scroll positions only when x specified', () => {
    scrollDirection = 'x';
    render(<TestComponent />);

    const [source, target] = refs.map((ref) => ref.current as HTMLDivElement);

    source.scrollTop = 50;
    source.scrollLeft = 100;

    act(() => {
      source.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    expect(target.scrollTop).toBe(0);
    expect(target.scrollLeft).toBe(100);
  });

  it('syncs vertical scroll positions only when y specified', () => {
    scrollDirection = 'y';

    render(<TestComponent />);

    const [source, target] = refs.map((ref) => ref.current as HTMLDivElement);

    source.scrollTop = 50;
    source.scrollLeft = 100;

    act(() => {
      source.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    expect(target.scrollTop).toBe(50);
    expect(target.scrollLeft).toBe(0);
  });
});
