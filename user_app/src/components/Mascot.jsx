// PNG mascot illustrations (served from user_app/public/mascots).
// variant → filename. Falls back to "wave".
const VARIANTS = {
  wave:       "/mascots/mascot-wave.png",
  success:    "/mascots/mascot-success.png",
  concerned:  "/mascots/mascot-concerned.png",
  chat:       "/mascots/mascot-chat.png",
  reading:    "/mascots/mascot-reading.png",
  resources:  "/mascots/mascot-resources.png",
  screening:  "/mascots/mascot-screening.png",
  master:     "/mascots/mascot-wave.png",
};

export default function Mascot({ variant = "wave", size = 120, className = "", style = {} }) {
  const src = VARIANTS[variant] || VARIANTS.wave;
  return (
    <img
      src={src}
      alt="MindCare AI mascot"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain", flexShrink: 0, ...style }}
      draggable={false}
    />
  );
}
