import { DirectiveConfig } from "marked-directive";

export const vimeoDirective: DirectiveConfig = {
  level: "block",
  marker: "::",
  renderer(token) {
    if (token.meta.name === "vimeo") {
      const videoId = token.attrs?.videoId;

      if (typeof videoId !== "string" || !videoId) {
        throw new Error(`Missing or invalid "videoId" attribute on ${token.raw}`);
      }

      return `
        <div class="aspect-ratio overflow-hidden" style="padding-bottom: 60%; padding-top: 30px;">
          <iframe
            allowFullScreen
            class="aspect-ratio--object"
            frameBorder="0"
            src="https://player.vimeo.com/video/${videoId}"
          >
          </iframe>
        </div>`;
    }

    return false;
  },
};
