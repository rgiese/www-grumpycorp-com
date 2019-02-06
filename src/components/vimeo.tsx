import React from "react";

const Vimeo: React.FunctionComponent<{ videoId: string }> = ({ videoId }) => (
  <p>
    <div
      className="aspect-ratio overflow-hidden"
      style={{ paddingBottom: "60%", paddingTop: "30px" }}
    >
      <iframe
        src={"https://player.vimeo.com/video/" + videoId}
        className="aspect-ratio--object"
        frameBorder="0"
        allowFullScreen={true}
      />
    </div>
  </p>
);

export default Vimeo;
