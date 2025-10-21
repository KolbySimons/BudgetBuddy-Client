import { formatCurrency } from "../../utils/formatters";
import "../../styles/Card.css";

const StatsCard = ({ title, amount, color = "var(--primary)" }) => {
  return (
    <div className="card card-stat">
      <div className="card-stat-number" style={{ color }}>
        {formatCurrency(amount)}
      </div>
      <div className="card-stat-label">{title}</div>
    </div>
  );
};

export default StatsCard;
