import Mascot from "./Mascot.jsx";

export default function MascotCard({ variant = "wave", title, text, action, onAction, size = 80 }) {
  return (
    <div className="mascot-card">
      <div className="mascot-card-body">
        <div className="mascot-card-title">{title}</div>
        {text && <div className="mascot-card-text">{text}</div>}
        {action && (
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 10, color: "#009688", background: "rgba(0,150,136,0.12)" }}
            onClick={onAction}
          >
            {action}
          </button>
        )}
      </div>
      <Mascot variant={variant} size={size} />
    </div>
  );
}
