function CardMetric({
  titulo,
  valor
}) {

  return (

    <div className="card-metric">

      <h3>{titulo}</h3>

      <h1>{valor}</h1>

    </div>

  );

}

export default CardMetric;