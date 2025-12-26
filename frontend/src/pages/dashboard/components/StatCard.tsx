type Props = { title: string; value: string | number; description: string };

const StatCard = ({ title, value, description }: Props) => {
  return (
    <div className="card-gradient rounded-2xl p-6 shadow-card hover-lift border-0">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-3xl font-bold mt-2 text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{description}</div>
    </div>
  );
};

export default StatCard;



