import { copyTextToClipboard } from "./clipboard";

const setClipboard = (writeText) => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
};

describe("copyTextToClipboard", () => {
  afterEach(() => {
    delete document.execCommand;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
  });

  it("uses the clipboard API without touching the DOM", async () => {
    const writeText = vi.fn(async () => {});
    setClipboard(writeText);
    document.execCommand = vi.fn();

    await expect(copyTextToClipboard("hello")).resolves.toBe("clipboard");

    expect(writeText).toHaveBeenCalledWith("hello");
    expect(document.execCommand).not.toHaveBeenCalled();
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("falls back to a temporary textarea when the clipboard API rejects", async () => {
    setClipboard(vi.fn(async () => {
      throw new Error("clipboard unavailable");
    }));
    const copied = [];
    document.execCommand = vi.fn(() => {
      copied.push(document.querySelector("textarea")?.value);
      return true;
    });

    await expect(copyTextToClipboard("fallback text")).resolves.toBe("fallback");

    expect(copied).toEqual(["fallback text"]);
    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("cleans up the temporary textarea when the fallback fails", async () => {
    setClipboard(vi.fn(async () => {
      throw new Error("clipboard unavailable");
    }));
    document.execCommand = vi.fn(() => {
      throw new Error("copy blocked");
    });

    await expect(copyTextToClipboard("blocked")).resolves.toBe("failed");

    expect(document.querySelector("textarea")).toBeNull();
  });
});
