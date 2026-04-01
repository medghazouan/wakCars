import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { useAuth } from '@admin/hooks/useAuth'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'
import { authApi } from '@admin/api/auth.api'
import { pageTransition } from '@admin/animations/variants'
import { Input } from '@admin/components/ui/Input'
import { Button } from '@admin/components/ui/Button'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const { t, currentLanguage, toggleLanguage } = useAdminLanguage()

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('login.errors.email')),
        password: z.string().min(1, t('login.errors.password')),
      }),
    [t]
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const res = await authApi.login(data)
      if (res.success) {
        setAuth(res.data.accessToken, res.data.admin)
        toast.success(t('login.success'))
        navigate(adminPath('/dashboard'))
      }
    } catch (error) {
      toast.error(error.response?.data?.error || t('login.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center bg-gradient-to-tr from-[#2D4A3E] to-[#6B8F7B] p-4"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex justify-end px-6 pt-6">
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:border-primary/40 hover:text-primary"
            aria-label={t('topbar.langSwitchAria')}
          >
            {currentLanguage === 'fr' ? t('topbar.langAr') : t('topbar.langFr')}
          </button>
        </div>

        <div className="px-10 pb-12 pt-2">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-tertiary">
              <span className="text-xl font-bold tracking-tighter text-secondary">WAK</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-secondary">{t('login.title')}</h1>
            <p className="text-sm text-gray-400">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                {t('login.emailLabel')}
              </label>
              <Input
                type="email"
                placeholder="name@wakcars.com"
                icon={Mail}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                  {t('login.passwordLabel')}
                </label>
                <a href="#" className="text-xs font-medium text-primary hover:underline">
                  {t('login.forgotPassword')}
                </a>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                icon={Lock}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="remember" className="cursor-pointer text-sm text-gray-600">
                {t('login.rememberMe')}
              </label>
            </div>

            <Button type="submit" className="h-12 w-full text-[13px]" isLoading={isLoading}>
              {t('login.submit')}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-success">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-semibold uppercase tracking-widest">{t('login.secureBadge')}</span>
          </div>
        </div>

        <div className="border-gray-100 border-t bg-[#f8f9fa] px-10 py-4">
          <p className="text-center text-[10px] uppercase leading-relaxed tracking-widest text-gray-400">
            {t('login.footerNote')}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
