import { motion } from 'framer-motion'
import { useLanguage } from '../hooks/useLanguage'
import { useInView } from '../hooks/useInView'
import { fadeLeft, accentGrow, fadeUp, scaleUp, staggerContainer } from '../utils/motion'
import MetaTags from '../components/seo/MetaTags'
import Breadcrumbs from '../components/seo/Breadcrumbs'
import StatsCounter from '../components/sections/StatsCounter'

const About = () => {
  const { t } = useLanguage()
  const { ref, isInView } = useInView({ threshold: 0.2 })

  return (
    <>
      <MetaTags
        title={t('nav.about')}
        description="WAK Cars - Votre partenaire de confiance pour la location de voiture à Marrakech depuis 2018."
        url="/a-propos"
      />

      <div className="pt-24 bg-background-light">
        <div className="container-wak pb-16">
          <Breadcrumbs items={[{ label: t('nav.about'), href: '/a-propos' }]} />

          {/* Header synced with Fleet/Booking */}
          <div className="mb-16 relative">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="absolute top-0 -left-6 rtl:left-auto rtl:-right-6 w-1 h-3/4 bg-primary rounded-full hidden md:block origin-top"
                variants={accentGrow}
                initial="hidden"
                animate="visible"
              />
              <h1 className="text-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-4 uppercase leading-[1.1]">
                {t('nav.about')}
              </h1>
              <p className="text-text-secondary text-xl font-light tracking-wide max-w-2xl">
                 Votre partenaire de confiance pour la location de voiture à Marrakech depuis 2018.
              </p>
            </motion.div>
          </div>

          {/* Image */}
          <motion.div
            className="aspect-video max-w-5xl mx-auto mb-16"
            variants={scaleUp}
            initial="hidden"
            animate="visible"
          >
            <img
              src="https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200"
              alt="Équipe WAK Cars à Marrakech"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Story */}
          <div ref={ref} className="max-w-7xl mx-auto mt-20">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
               {/* Histoire Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center">
                  <div>
                     <h2 className="text-display text-3xl text-text-primary mb-6 uppercase tracking-wider relative inline-block">
                        Notre Histoire
                        <div className="absolute -bottom-2 left-0 w-12 h-1 bg-primary" />
                     </h2>
                     <p className="text-text-secondary leading-relaxed text-lg mb-4">
                        WAK Cars est née d'une passion pour l'automobile et d'un amour profond pour le Maroc. 
                        Fondée en 2018 à Marrakech, notre agence s'est rapidement distinguée par son approche 
                        centrée sur le client et sa volonté de proposer des véhicules de qualité à des prix transparents.
                     </p>
                     <p className="text-text-secondary leading-relaxed text-lg">
                        Notre fondateur, après avoir constaté les difficultés rencontrées par les voyageurs 
                        pour louer un véhicule en toute confiance, a décidé de créer une alternative. 
                        Une agence où la transparence, la qualité et le service client seraient les maîtres-mots.
                     </p>
                  </div>
                  <div className="bg-background-dark p-12 shadow-2xl border-t-8 border-primary relative">
                     <div className="absolute -top-6 -right-6 text-6xl text-white/5 font-display font-black">2018</div>
                     <p className="text-white text-xl font-ui font-light italic leading-relaxed">
                        "Nous ne louons pas seulement des voitures, nous facilitons l'exploration de l'un des plus beaux pays du monde en toute tranquillité d'esprit."
                     </p>
                  </div>
               </div>

               {/* Mission Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
                  <div className="lg:col-span-1">
                     <h2 className="text-display text-3xl text-text-primary mb-6 uppercase tracking-wider relative inline-block">
                        Notre Mission
                        <div className="absolute -bottom-2 left-0 w-12 h-1 bg-primary" />
                     </h2>
                     <p className="text-text-secondary leading-relaxed text-lg">
                        Chez WAK Cars, nous croyons que louer une voiture au Maroc devrait être simple, 
                        transparent et sans stress. C'est pourquoi nous nous engageons sur ces 5 piliers :
                     </p>
                  </div>
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="bg-white p-6 border border-gray-100 shadow-xl shadow-primary/5">
                        <h4 className="font-display font-bold mb-2 text-primary">Flotte Récente</h4>
                        <p className="text-text-secondary text-sm">Proposer des véhicules récents et parfaitement entretenus.</p>
                     </div>
                     <div className="bg-white p-6 border border-gray-100 shadow-xl shadow-primary/5">
                        <h4 className="font-display font-bold mb-2 text-primary">Transparence</h4>
                        <p className="text-text-secondary text-sm">Afficher des prix clairs dès le départ, strictement sans frais cachés.</p>
                     </div>
                     <div className="bg-white p-6 border border-gray-100 shadow-xl shadow-primary/5">
                        <h4 className="font-display font-bold mb-2 text-primary">Livraison Facile</h4>
                        <p className="text-text-secondary text-sm">Offrir une livraison gratuite à l'aéroport pour toute location de 3+ jours.</p>
                     </div>
                     <div className="bg-white p-6 border border-gray-100 shadow-xl shadow-primary/5">
                        <h4 className="font-display font-bold mb-2 text-primary">Assistance 24/7</h4>
                        <p className="text-text-secondary text-sm">Être disponibles jour et nuit via WhatsApp pour accompagner nos clients.</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <StatsCounter />
      </div>
    </>
  )
}

export default About
