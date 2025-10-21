import "../../styles/ProgressBar.css";

const ProgressBar = ({ percentage = 0, size = "default", className = "" }) => {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);

  // Determine size class
  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "progress-bar-sm";
      case "large":
        return "progress-bar-lg";
      default:
        return "";
    }
  };

  // Determine color based on percentage
  const getProgressColor = () => {
    if (normalizedPercentage >= 90) {
      return "var(--danger)"; // Red for over 90%
    } else if (normalizedPercentage >= 75) {
      return "var(--warning)"; // Orange/yellow for 75-89%
    } else {
      return "var(--success)"; // Green for under 75%
    }
  };

  return (
    <div className={`progress-bar ${getSizeClass()} ${className}`}>
      <div
        className="progress-fill"
        style={{
          width: `${normalizedPercentage}%`,
          background: getProgressColor(),
        }}
        role="progressbar"
        aria-valuenow={normalizedPercentage}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`${normalizedPercentage}% complete`}
      />
    </div>
  );
};

export default ProgressBar;
