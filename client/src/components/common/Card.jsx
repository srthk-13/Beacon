import { useRef } from "react";

function Card({
  children,
  title,
  subtitle,
  actions,
  className = "",
  interactive = true,
  as = "section",
  ...rest
}) {
  const cardRef = useRef(null);
  const Component = as;

  const handleMouseMove = (event) => {
    if (!interactive || !cardRef.current) {
      return;
    }

    const rect = cardRef.current.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const rotateY = ((pointerX / rect.width) * 2 - 1) * 5;
    const rotateX = (1 - (pointerY / rect.height) * 2) * 5;

    cardRef.current.style.setProperty("--rotate-x", `${rotateX.toFixed(2)}deg`);
    cardRef.current.style.setProperty("--rotate-y", `${rotateY.toFixed(2)}deg`);
  };

  const resetTilt = () => {
    if (!cardRef.current) {
      return;
    }
    cardRef.current.style.setProperty("--rotate-x", "0deg");
    cardRef.current.style.setProperty("--rotate-y", "0deg");
  };

  const classes = ["beacon-card", "depth-card"];
  if (interactive) {
    classes.push("is-interactive");
  }
  if (className) {
    classes.push(className);
  }

  return (
    <Component
      ref={cardRef}
      className={classes.join(" ")}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseLeave={interactive ? resetTilt : undefined}
      {...rest}
    >
      {(title || subtitle || actions) && (
        <header className="card-header">
          <div>
            {title ? <h3 className="card-title">{title}</h3> : null}
            {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="card-actions">{actions}</div> : null}
        </header>
      )}
      <div className="card-body">{children}</div>
    </Component>
  );
}

export default Card;
