import { DirectiveConfig } from "marked-directive";

export const vimeoDirective: DirectiveConfig = {
  level: "block",
  marker: "::",
  renderer(token) {
    if (token.meta.name === "vimeo") {
      if (!token.attrs || !token.attrs.videoId) {
        throw new Error(`Missing "videoId" attribute on ${token.raw}`);
      }

      return `
        <div class="aspect-ratio overflow-hidden" style="padding-bottom: 60%; padding-top: 30px;">
          <iframe
            allowFullScreen
            class="aspect-ratio--object"
            frameBorder="0"
            src="https://player.vimeo.com/video/${token.attrs.videoId}"
          >
          </iframe>
        </div>`;
    }

    return false;
  },
};
