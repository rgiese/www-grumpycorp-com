import React from "react";

const Vimeo: React.FunctionComponent<{ videoId: string }> = ({ videoId }) => (
  <p>
    <div
      className="aspect-ratio overflow-hidden"
      style={{ paddingBottom: "60%", paddingTop: "30px" }}
    >
      <iframe
        allowFullScreen
        className="aspect-ratio--object"
        frameBorder="0"
        src={"https://player.vimeo.com/video/" + videoId}
      />
    </div>
  </p>
);

export default Vimeo;
