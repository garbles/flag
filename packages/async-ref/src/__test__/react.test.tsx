/**
 * @jest-environment jsdom
 */

import React, { Suspense } from "react";
import { act, render, screen } from "@testing-library/react";
import { createAsyncRef } from "../async-ref";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error" />;
    }

    return this.props.children;
  }
}

test("renders when resolved", () => {
  const fallback = jest.fn();

  const ref = createAsyncRef<string>();
  ref.current = "hello";

  const Fallback = () => {
    fallback();

    return null;
  };

  const App = () => {
    return <div data-testid={ref.current} />;
  };

  render(
    <ErrorBoundary>
      <Suspense fallback={<Fallback />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  );

  expect(screen.queryByTestId("hello")).not.toBeNull();
  expect(screen.queryByTestId("error")).toBeNull();
  expect(fallback).not.toHaveBeenCalled();
});

test("renders the fallback when not resolved", async () => {
  const fallback = jest.fn();

  const ref = createAsyncRef<string>();

  const Fallback = () => {
    fallback();

    return null;
  };

  const App = () => {
    return <div data-testid={ref.current} />;
  };

  render(
    <ErrorBoundary>
      <Suspense fallback={<Fallback />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  );

  expect(screen.queryByTestId("goodbye")).toBeNull();
  expect(screen.queryByTestId("error")).toBeNull();
  expect(fallback).toHaveBeenCalledTimes(1);

  await act(async () => {
    ref.current = "goodbye";
    /**
     * This is a hack to force the suspense to re-render
     * before the act finishes.
     */
    await new Promise((res) => setTimeout(res, 0));
  });

  expect(screen.queryByTestId("goodbye")).not.toBeNull();
  expect(screen.queryByTestId("error")).toBeNull();
  expect(fallback).toHaveBeenCalledTimes(1);
});

test("throws to the error boundary when rejected", async () => {
  const fallback = jest.fn();

  const ref = createAsyncRef<string>();

  const Fallback = () => {
    fallback();

    return null;
  };

  const App = () => {
    return <div data-testid={ref.current} />;
  };

  render(
    <ErrorBoundary>
      <Suspense fallback={<Fallback />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  );

  await act(async () => {
    ref.reject(new Error("boom"));
    /**
     * This is a hack to force the suspense to re-render
     * before the act finishes.
     */
    await new Promise((res) => setTimeout(res, 100));
  });

  expect(screen.queryByTestId("goodbye")).toBeNull();
  expect(screen.queryByTestId("error")).not.toBeNull();
  expect(fallback).toHaveBeenCalledTimes(1);
});
