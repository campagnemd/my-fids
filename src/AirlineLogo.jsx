import { useEffect, useState } from "react";
import { getAirline } from "./airlines";

export default function AirlineLogo({ flightId, rowHeight, slotWidth }) {
  const airline = getAirline(flightId);
  const [imageFailed, setImageFailed] = useState(false);
  const maxHeight = Math.max(18, rowHeight * 0.89);
  const width = Math.max(20, Math.min(slotWidth - 4, maxHeight * (16 / 9)));

  useEffect(() => {
    setImageFailed(false);
  }, [airline.logo]);

  const style = {
    width: `${width}px`,
    aspectRatio: "16 / 9"
  };

  if (!airline.logo || imageFailed) {
    return (
      <span
        className="airline-logo-fallback"
        style={style}
        aria-label={`${airline.name} 로고 없음`}
        title={`${airline.name} (${airline.code})`}
      >
        {airline.code}
      </span>
    );
  }

  return (
    <span className="airline-logo-frame" style={style} title={`${airline.name} (${airline.code})`}>
      <img
        src={airline.logo}
        alt={`${airline.name} logo`}
        loading="eager"
        decoding="async"
        onError={() => setImageFailed(true)}
      />
    </span>
  );
}
