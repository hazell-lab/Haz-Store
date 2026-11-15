import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLocalStorage } from "./useLocalStorage.js";

describe("useLocalStorage", () => {
  it("reads, writes and falls back on broken json", () => {
    window.localStorage.setItem("key", "{broken");
    const { result } = renderHook(() => useLocalStorage("key", []));
    expect(result.current[0]).toEqual([]);
    act(() => result.current[1]([1, 2]));
    expect(result.current[0]).toEqual([1, 2]);
    expect(window.localStorage.getItem("key")).toBe("[1,2]");
  });

  it("follows changes from another tab", () => {
    const { result } = renderHook(() => useLocalStorage("key", []));
    act(() => {
      window.localStorage.setItem("key", "[7]");
      window.dispatchEvent(new StorageEvent("storage", { key: "key" }));
    });
    expect(result.current[0]).toEqual([7]);
  });
});
