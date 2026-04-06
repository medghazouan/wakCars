import { motion } from 'framer-motion'
import { useLanguage } from '../hooks/useLanguage'
import { fadeLeft, accentGrow, fadeUp } from '../utils/motion'
import MetaTags from '../components/seo/MetaTags'
import Breadcrumbs from '../components/seo/Breadcrumbs'

const Privacy = () => {
  const { t } = useLanguage()

  return (
    <>
      <MetaTags
        title={t('footer.privacy')}
        description="Politique de confidentialité et protection des données personnelles chez WAK Cars."
        url="/confidentialite"
      />

      <div className="pt-24 pb-16 bg-background-light min-h-screen">
        <div className="container-wak">
          <Breadcrumbs items={[{ label: t('footer.privacy'), href: '/confidentialite' }]} />

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
                {t('privacy.title')}
              </h1>
              <p className="text-text-secondary text-xl font-light tracking-wide max-w-2xl">
                {t('privacy.lastUpdate')}
              </p>
            </motion.div>
          </div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-4 gap-12"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            {/* Table of Contents / Sidebar */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-28 space-y-4 bg-white p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 rounded-sm">
                 <h3 className="font-display font-bold text-primary uppercase tracking-widest text-xs mb-6 border-b border-gray-100 pb-4">
                   {t('privacy.summary')}
                 </h3>
                 <ul className="space-y-4 text-sm font-ui text-text-secondary">
                    {t('privacy.sections', { returnObjects: true }).map((section) => (
                      <li key={section.id}>
                        <a 
                          href={`#section-${section.id}`}
                          className="hover:text-primary transition-colors cursor-pointer flex items-center gap-3"
                        >
                          <span className="text-gray-300 font-bold text-xs">{section.id}</span>
                          <span className="font-medium">{section.title}</span>
                        </a>
                      </li>
                    ))}
                 </ul>
              </div>
            </div>

            {/* Content Body */}
            <div className="lg:col-span-3 space-y-8">
               {t('privacy.sections', { returnObjects: true }).map((section) => (
                 <div 
                   key={section.id} 
                   id={`section-${section.id}`} 
                   className="bg-white p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 rounded-sm relative overflow-hidden group scroll-mt-28"
                 >
                   {/* Giant Watermark Number */}
                   <div className="absolute -top-12 -right-4 md:-right-8 rtl:-left-8 rtl:right-auto rtl:text-left text-[150px] font-display font-black text-gray-50 opacity-70 group-hover:scale-105 group-hover:text-primary/5 transition-all duration-700 z-0 pointer-events-none select-none leading-none">
                     {section.id}
                   </div>
                   
                   <div className="relative z-10">
                     <h2 className="font-display font-black text-2xl md:text-3xl text-text-primary mb-8 flex items-center gap-4">
                       <span className="text-primary text-xl">{section.id}.</span> {section.title}
                     </h2>
                     <div className="space-y-5 text-text-secondary leading-relaxed font-ui text-[15px] md:text-base">
                       {section.content.map((line, idx) => (
                         <p 
                           key={idx} 
                           className={line.startsWith('•') ? "pl-6 rtl:pl-0 rtl:pr-6 relative before:absolute before:left-0 rtl:before:left-auto rtl:before:right-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-primary before:rotate-45" : ""}
                         >
                           {line.replace('• ', '')}
                         </p>
                       ))}
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default Privacy
