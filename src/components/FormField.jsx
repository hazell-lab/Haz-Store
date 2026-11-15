// label, input (or select) and error message wired together for screen readers
export function FormField({ id, label, error, full = false, as = "input", children, inputRef, ...inputProps }) {
  const errorId = id + "Error";
  const Control = as;
  const className = "form-control" + (error ? " input-error" : "");

  return (
    <div className={"form-group" + (full ? " full" : "")}>
      <label htmlFor={id}>{label}</label>
      <Control
        id={id}
        name={id}
        ref={inputRef}
        className={className}
        aria-describedby={errorId}
        aria-invalid={error ? "true" : "false"}
        {...inputProps}
      >
        {children}
      </Control>
      <span className="error-message" id={errorId}>
        {error || ""}
      </span>
    </div>
  );
}
