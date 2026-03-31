import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { authApi } from '@/api/auth.api'
import { pageTransition } from '@/animations/variants'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const res = await authApi.login(data)
      if (res.success) {
        setAuth(res.data.accessToken, res.data.admin)
        toast.success('Logged in successfully')
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div 
      className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-[#2D4A3E] to-[#6B8F7B] p-4"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-10 py-12">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-12 h-12 bg-tertiary rounded-lg flex items-center justify-center mb-6">
              <span className="font-bold text-secondary text-xl tracking-tighter">WAK</span>
            </div>
            <h1 className="text-2xl font-bold text-secondary mb-2">Admin Portal</h1>
            <p className="text-gray-400 text-sm">Precision management for luxury fleet operations.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                Admin Email
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
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                  Password
                </label>
                <a href="#" className="text-primary text-xs font-medium hover:underline">
                  Forgot Password?
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
                type="checkbox" 
                id="remember" 
                className="rounded border-gray-300 text-primary focus:ring-primary" 
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Remember me
              </label>
            </div>

            <Button type="submit" className="w-full h-12 text-[13px]" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          {/* Badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-success">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-semibold uppercase tracking-widest">
              Secure 2FA Environment Active
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f8f9fa] border-t border-gray-100 py-4 px-10">
          <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest leading-relaxed">
            Authorized access only. All sessions are logged and monitored.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
