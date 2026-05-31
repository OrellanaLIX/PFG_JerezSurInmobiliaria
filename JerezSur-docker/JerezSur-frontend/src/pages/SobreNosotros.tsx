import { useEffect } from 'react';
import '../styles/SobreNosotros.scss';
import { CtaSection } from '../components/CtaSection';
import teamMember1 from '../assets/imgs/placeholders/team1.jpg';
import teamMember2 from '../assets/imgs/placeholders/team2.jpg';

// --- DATA ---
// Centralizamos todos los datos aquí para una fácil edición.

const teamMembersData = [
    {
        id: 1,
        name: 'Elena García',
        title: 'Fundadora y CEO',
        image: teamMember1,
        bio: 'Con más de 15 años de experiencia, Elena lidera JerezSur con pasión y un profundo conocimiento del mercado local.',
    },
    {
        id: 2,
        name: 'Carlos Navarro',
        title: 'Agente Inmobiliario Senior',
        image: teamMember2,
        bio: 'Especialista en compra-venta residencial. Carlos te acompañará para encontrar el hogar de tus sueños.',
    },
];

const valuesData = [
    { id: 'mision', title: 'Misión', text: 'Facilitar el proceso inmobiliario con transparencia, profesionalidad y un trato cercano y personalizado.' },
    { id: 'vision', title: 'Visión', text: 'Ser la inmobiliaria de referencia en Jerez, reconocida por nuestra integridad, eficacia y la satisfacción del cliente.' },
    { id: 'valores', title: 'Valores', text: 'Compromiso, honestidad, cercanía y una profunda pasión por nuestro trabajo y por la ciudad de Jerez.' },
];

// --- COMPONENTES DE PRESENTACIÓN ---
// Componentes pequeños y reutilizables.

interface TeamMemberCardProps {
    image: string;
    name: string;
    title: string;
    bio: string;
}

interface ValueCardProps {
    title: string;
    text: string;
}

const TeamMemberCard = ({ image, name, title, bio }: TeamMemberCardProps) => (
    <div className="team-member-card">
        <img src={image} alt={`Retrato de ${name}`} className="team-member-card__image" />
        <div className="team-member-card__info">
            <h4 className="team-member-card__name">{name}</h4>
            <p className="team-member-card__title">{title}</p>
            <p className="team-member-card__bio">{bio}</p>
        </div>
    </div>
);

const ValueCard = ({ title, text }: ValueCardProps) => (
    <div className="value-card">
        <h3 className="value-card__title">{title}</h3>
        <p>{text}</p>
    </div>
);

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

const SobreNosotros = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        // Usamos una clase contenedora para la página y el padding-top del header
        <div className="page-wrapper about-us-page">
            <main>
                {/* 1. Hero Section Adaptada a tus nuevos estilos */}
                <section className="hero about-hero">
                    <div className="hero__content">
                        <h1>Tu confianza, nuestro compromiso.</h1>
                        <p>
                            Somos más que una inmobiliaria; somos tus vecinos en Jerez, dedicados a ayudarte a encontrar tu lugar en el mundo.
                        </p>
                    </div>
                </section>

                {/* 2. El Equipo */}
                <section className="page-section">
                    <div className="container">
                        <h2 className="section-title">Conoce a nuestro equipo</h2>
                        <p className="section-subtitle">Personas dedicadas a hacer tu proyecto realidad.</p>
                        <div className="team-grid">
                            {teamMembersData.map((member) => (
                                <TeamMemberCard key={member.id} {...member} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. Llamada a la Acción (CTA) */}
                <CtaSection
                    title="¿Listo para dar el siguiente paso?"
                    text="Ya sea para comprar, vender o alquilar, estamos aquí para ayudarte a alcanzar tus objetivos con la máxima confianza."
                    buttonText="Contacta con nosotros"
                    buttonLink="/contacto"
                    buttonType="secondary" // Elige el color del botón, 'secondary' suele quedar genial en este fondo
                />

                {/* 4. Misión y Valores */}
                <section className="page-section values-section">
                    <div className="container">
                        <div className="values-grid">
                            {valuesData.map((value) => (
                                <ValueCard key={value.id} {...value} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SobreNosotros;