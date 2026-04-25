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
        <div class="relative h-0 pb-[60%] pt-[30px] overflow-hidden">
          <iframe
            allowFullScreen
            class="absolute inset-0 w-full h-full"
            frameBorder="0"
            src="https://player.vimeo.com/video/${videoId}"
          >
          </iframe>
        </div>`;
    }

    return false;
  },
};
