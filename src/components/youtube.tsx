import React from "react";

const YouTube = ({ videoId }: { videoId: string }): JSX.Element => (
  <div
    className="aspect-ratio overflow-hidden"
    style={{ paddingBottom: "60%", paddingTop: "30px" }}
  >
    <iframe
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="aspect-ratio--object"
      frameBorder="0"
      height="720"
      src={"https://www.youtube.com/embed/" + videoId}
      width="1280"
    />
  </div>
);

export default YouTube;
