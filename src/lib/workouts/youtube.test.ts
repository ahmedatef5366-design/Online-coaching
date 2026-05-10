import { describe, expect, it } from "vitest";
import { getYouTubeEmbedUrl, getYouTubeId } from "./youtube";

describe("getYouTubeId", () => {
  it("handles https://www.youtube.com/watch?v=...", () => {
    expect(getYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("handles https://youtu.be/...", () => {
    expect(getYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("handles /embed and /shorts paths", () => {
    expect(getYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
    expect(getYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("strips www. and accepts m.youtube.com", () => {
    expect(getYouTubeId("https://m.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("returns null for non-youtube URLs", () => {
    expect(getYouTubeId("https://vimeo.com/12345")).toBeNull();
    expect(getYouTubeId("https://example.com/watch?v=abc")).toBeNull();
  });

  it("returns null for malformed input", () => {
    expect(getYouTubeId(null)).toBeNull();
    expect(getYouTubeId("")).toBeNull();
    expect(getYouTubeId("not a url")).toBeNull();
  });

  it("returns null when the id is shaped wrong", () => {
    expect(getYouTubeId("https://youtu.be/short")).toBeNull();
    expect(
      getYouTubeId("https://www.youtube.com/watch?v=way-too-long-id-here"),
    ).toBeNull();
  });
});

describe("getYouTubeEmbedUrl", () => {
  it("rewrites supported URLs to youtube-nocookie", () => {
    expect(getYouTubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("returns null when not a YouTube URL", () => {
    expect(getYouTubeEmbedUrl("https://vimeo.com/12345")).toBeNull();
  });
});
