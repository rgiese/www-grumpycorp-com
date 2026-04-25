import { DirectiveConfig } from "marked-directive";

export const youtubeDirective: DirectiveConfig = {
  level: "block",
  marker: "::",
  renderer(token) {
    if (token.meta.name === "youtube") {
      const videoId = token.attrs?.videoId;

      if (typeof videoId !== "string" || !videoId) {
        throw new Error(`Missing or invalid "videoId" attribute on ${token.raw}`);
      }

      return `
        <div class="relative h-0 pb-[60%] pt-[30px] overflow-hidden">
          <iframe
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            class="absolute inset-0 w-full h-full"
            frameBorder="0"
            src="https://www.youtube.com/embed/${videoId}"
          ></iframe>
        </div>`;
    }

    return false;
  },
};
