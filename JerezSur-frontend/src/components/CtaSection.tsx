import { Link } from 'react-router-dom';
import '../styles/CtaSection.scss';

// Definimos los tipos de las props para tener autocompletado y seguridad
type CtaSectionProps = {
  title: string;
  text: string;
  buttonText: string;
  buttonLink: string;
  buttonType?: 'primary' | 'secondary' | 'white'; // El tipo de botón es opcional
};

export const CtaSection = ({ title, text, buttonText, buttonLink, buttonType = 'secondary' }: CtaSectionProps) => {
  return (
    <section className="cta-section-shared">
      <div className="cta-section-shared__container">
        <div className="cta-section-shared__content">
          <div className="cta-section-shared__text">
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <Link to={buttonLink} className={`btn btn--${buttonType}`}>
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
};