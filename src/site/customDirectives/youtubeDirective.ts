import { DirectiveConfig } from "marked-directive";

export const youtubeDirective: DirectiveConfig = {
  level: "block",
  marker: "::",
  renderer(token) {
    if (token.meta.name === "youtube") {
      if (!token.attrs || !token.attrs.videoId) {
        throw new Error(`Missing "videoId" attribute on ${token.raw}`);
      }

      return `
        <div class="aspect-ratio overflow-hidden" style="padding-bottom: 60%; padding-top: 30px">
          <iframe
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            class="aspect-ratio--object"
            frameBorder="0"
            height="720"
            src="https://www.youtube.com/embed/${token.attrs.videoId}"
            width="1280"
          ></iframe>
        </div>`;
    }

    return false;
  },
};
