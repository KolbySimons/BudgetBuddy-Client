const Spinner = ({ size = "medium" }) => {
  const getSpinnerStyle = () => {
    switch (size) {
      case "small":
        return {
          width: "1rem",
          height: "1rem",
          borderWidth: "2px",
        };
      case "large":
        return {
          width: "4rem",
          height: "4rem",
          borderWidth: "4px",
        };
      case "medium":
      default:
        return {
          width: "3rem",
          height: "3rem",
          borderWidth: "3px",
        };
    }
  };

  return (
    <div
      className="spinner"
      style={getSpinnerStyle()}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
