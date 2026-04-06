import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '../hooks/useLanguage'
import { generateFAQSchema } from '../utils/seo.utils'
import { fadeLeft, accentGrow, fadeUp } from '../utils/motion'
import api from '../services/api'
import MetaTags from '../components/seo/MetaTags'
import Breadcrumbs from '../components/seo/Breadcrumbs'
import Skeleton from '../components/ui/Skeleton'

const ChevronIcon = ({ isOpen }) => (
  <motion.svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ duration: 0.3, ease: "backOut" }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </motion.svg>
)

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className={`mb-4 border bg-white transition-all duration-500 overflow-hidden ${
      isOpen ? 'border-primary shadow-xl shadow-primary/10 ring-1 ring-primary/20 rounded-none' : 'border-gray-100 hover:border-gray-300 hover:shadow-md rounded-none'
    }`}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 text-left group"
        aria-expanded={isOpen}
      >
        <span className={`font-display font-bold text-lg md:text-xl transition-colors duration-300 pr-4 leading-snug ${
          isOpen ? 'text-primary' : 'text-text-primary group-hover:text-primary'
        }`}>
          {question}
        </span>
        <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-primary text-white rounded-full scale-110' : 'bg-gray-50 text-text-secondary rounded-none group-hover:bg-primary/10 group-hover:text-primary'
        }`}>
          <ChevronIcon isOpen={isOpen} />
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="px-6 pb-6 pt-2 border-t border-gray-50 mx-4">
              <p className="text-text-secondary text-[16px] md:text-[17px] leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const FAQ = () => {
  const { t, currentLanguage, getLocalizedField } = useLanguage()
  const [openIndex, setOpenIndex] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['faqs', currentLanguage],
    queryFn: () => api.get('/faqs', { params: { lang: currentLanguage } }),
  })

  const faqs = data?.data || []
  
  // Group FAQs by category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    const cat = faq.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(faq)
    return acc
  }, {})

  const categories = Object.keys(groupedFaqs)
  const displayCategory = activeCategory || categories[0]
  const displayFaqs = groupedFaqs[displayCategory] || []

  // Prepare schema data
  const schemaFaqs = faqs.map((faq) => ({
    question: getLocalizedField(faq, 'question'),
    answer: getLocalizedField(faq, 'answer'),
  }))

  return (
    <>
      <MetaTags
        title={t('faq.title')}
        description={t('faq.metaDesc')}
        url="/faq"
        schema={generateFAQSchema(schemaFaqs)}
      />

      <div className="pt-24 pb-16 bg-background-light min-h-screen">
        <div className="container-wak">
          <Breadcrumbs items={[{ label: t('faq.title'), href: '/faq' }]} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mt-8">
            
            {/* Left Sidebar: Header and Categories */}
            <div className="lg:col-span-4 lg:sticky lg:top-32 flex flex-col">
              {/* Header Title Block */}
              <motion.div 
                className="mb-10 relative"
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
                <h1 className="text-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-6 leading-[1.1] uppercase">
                  {t('faq.heading')}
                </h1>
                <p className="text-text-secondary text-lg leading-relaxed">
                  {t('faq.subtitle')}
                </p>
              </motion.div>

              {/* Category Tabs */}
              <motion.div 
                className="flex flex-row flex-wrap lg:flex-col gap-3"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat)
                      setOpenIndex(null)
                    }}
                    className={`flex items-center justify-between px-6 py-4 text-sm font-ui font-bold uppercase tracking-widest transition-all duration-300 text-left border ${
                      displayCategory === cat
                        ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 lg:translate-x-2 rtl:lg:-translate-x-2'
                        : 'bg-white text-text-secondary border-gray-100 hover:border-primary/50 hover:text-primary hover:shadow-md'
                    }`}
                  >
                    <span>{t(`faq.categories.${cat}`) || cat}</span>
                    <svg className={`w-4 h-4 transition-transform hidden lg:block ${displayCategory === cat ? 'translate-x-1 rtl:-translate-x-1' : 'opacity-0 -translate-x-2 rtl:translate-x-2'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                ))}
              </motion.div>
            </div>

            {/* Right Content: FAQ Items Accordion */}
            <div className="lg:col-span-8 w-full flex flex-col">
              {isLoading ? (
                <div className="space-y-4 w-full">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-none" />
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="w-full flex-col flex"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <AnimatePresence mode="popLayout">
                    {displayFaqs.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <FAQItem
                          question={getLocalizedField(faq, 'question')}
                          answer={getLocalizedField(faq, 'answer')}
                          isOpen={openIndex === index}
                          onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default FAQ
