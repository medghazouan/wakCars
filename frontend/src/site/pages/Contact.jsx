import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useLanguage } from '../hooks/useLanguage'
import api from '../services/api'
import MetaTags from '../components/seo/MetaTags'
import Breadcrumbs from '../components/seo/Breadcrumbs'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const MailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const MapPinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const contactSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  message: z.string().min(10, 'Message trop court'),
})

const Contact = () => {
  const { t } = useLanguage()
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
  })

  const sendMessage = useMutation({
    mutationFn: (data) => api.post('/contact', data),
    onSuccess: () => {
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 5000)
    },
  })

  const onSubmit = (data) => {
    sendMessage.mutate(data)
  }

  const contactInfo = [
    {
      icon: <PhoneIcon />,
      label: t('contact.info.phone'),
      value: '+212 524 123 456',
      href: 'tel:+212524123456',
    },
    {
      icon: <WhatsAppIcon />,
      label: t('contact.info.whatsapp'),
      value: '+212 661 234 567',
      href: 'https://wa.me/212661234567',
    },
    {
      icon: <MailIcon />,
      label: t('contact.info.email'),
      value: 'contact@wakcars.ma',
      href: 'mailto:contact@wakcars.ma',
    },
    {
      icon: <MapPinIcon />,
      label: t('contact.info.address'),
      value: '47 Avenue Mohammed V, Guéliz\nMarrakech 40000, Maroc',
    },
    {
      icon: <ClockIcon />,
      label: t('contact.info.hours'),
      value: 'Lun-Sam: 08h00-20h00\nDim: 09h00-17h00',
    },
  ]

  return (
    <>
      <MetaTags
        title={t('contact.title')}
        description={t('contact.subtitle')}
        url="/contact"
      />

      <div className="pt-24 pb-16 bg-background-light min-h-screen">
        <div className="container-wak">
          <Breadcrumbs items={[{ label: t('contact.title'), href: '/contact' }]} />

          {/* Header */}
          <div className="mb-14 relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute top-0 -left-6 rtl:left-auto rtl:-right-6 w-1 h-3/4 bg-primary rounded-full hidden md:block" />
              <h1 className="text-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-4 uppercase leading-[1.1]">
                {t('contact.title')}
              </h1>
              <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
                {t('contact.subtitle')}
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              className="lg:col-span-7 flex flex-col"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white p-8 md:p-12 border border-gray-100 shadow-xl shadow-primary/5 flex-grow group relative overflow-hidden">
                {/* Decorative subtle gradient */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <h2 className="text-2xl md:text-3xl font-display font-bold text-text-primary mb-8 relative z-10">
                  {t('contact.form.title', 'Envoyez-nous un message')}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10 flex flex-col flex-grow">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input
                      label={t('contact.form.name')}
                      {...register('name')}
                      error={errors.name?.message}
                    />
                    <Input
                      type="email"
                      label={t('contact.form.email')}
                      {...register('email')}
                      error={errors.email?.message}
                    />
                  </div>
                  
                  <div className="input-group flex-grow">
                    <textarea
                      {...register('message')}
                      rows={6}
                      className="input-field resize-none h-full"
                      placeholder=" "
                    />
                    <label className="input-label bg-white">{t('contact.form.message')}</label>
                    {errors.message && (
                      <span className="text-xs text-primary mt-1 absolute -bottom-5">{errors.message.message}</span>
                    )}
                  </div>

                  {success && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {t('contact.form.success')}
                    </div>
                  )}

                  {sendMessage.isError && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                      {t('contact.form.error')}
                    </div>
                  )}

                  <div className="mt-auto pt-4">
                    <Button
                      type="submit"
                      loading={sendMessage.isPending}
                      className="w-full md:w-auto px-10 py-4 text-sm tracking-wide"
                    >
                      {sendMessage.isPending ? t('contact.form.sending') : t('contact.form.send')}
                      {!sendMessage.isPending && (
                        <svg className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0 inline-block rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Contact Info & Map */}
            <motion.div
              className="lg:col-span-5 flex flex-col space-y-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {/* Info Cards */}
              <div className="bg-background-dark p-8 md:p-12 text-white relative overflow-hidden group">
                {/* Modern Dark Glow */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/30 transition-colors duration-700" />
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary to-primary-light transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
                
                <h3 className="font-display text-2xl font-bold mb-8 relative z-10 text-white">
                  {t('contact.info.title', 'Nos Coordonnées')}
                </h3>
                
                <div className="space-y-6 relative z-10">
                  {contactInfo.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-5 hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform duration-300"
                    >
                      <div className="w-12 h-12 rounded-none bg-white/5 border border-white/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        {item.icon}
                      </div>
                      <div className="flex-grow pt-1">
                        <p className="text-gray-400 text-xs tracking-wider uppercase mb-1">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="font-medium text-white hover:text-primary transition-colors whitespace-pre-line text-[15px] block leading-relaxed"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="font-medium text-white whitespace-pre-line text-[15px] leading-relaxed">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Embed */}
              <div className="relative h-[300px] bg-gray-100 border border-gray-100 overflow-hidden group">
                {/* Decorative Map overlay line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-10" />
                
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3397.0!2d-7.9811!3d31.6295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sGu%C3%A9liz%2C%20Marrakech!5e0!3m2!1sfr!2sma!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1) opacity(0.9)' }}
                  className="transition-all duration-700 group-hover:filter-none"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="WAK Cars - Localisation"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Contact
