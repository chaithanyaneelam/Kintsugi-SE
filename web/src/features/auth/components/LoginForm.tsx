import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { toast } from 'sonner'
import { Mail, LockKeyhole, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'

import { AppLogo } from '@/components/AppLogo'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { ROUTES } from '@/app/router/routes'
import { useLoadingStore } from '@/stores/useLoadingStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'
import { BackgroundEffects } from '@/components/background/BackgroundEffects'
import { GlassCard } from '@/components/ui/GlassCard'

/* ─── Zod Validation Schema ─── */
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email address is required.' })
    .email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(1, { message: 'Password is required.' })
    .min(8, { message: 'Password must be at least 8 characters.' }),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export interface LoginFormProps {
  embedded?: boolean
  onSwitchToRegister?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ embedded = false, onSwitchToRegister }) => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  const { mutate: login, isPending, error: serverError } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleAuthNav = (path: string, message: string) => {
    useLoadingStore.getState().show(message)
    navigate(path)
  }

  const onSubmit = (data: LoginFormValues) => {
    login(data, {
      onSuccess: () => {
        toast.success('Welcome back to Kintsugi!', {
          description: 'Session authenticated successfully.',
        })
      },
      onError: (err) => {
        toast.error('Authentication failed', {
          description: err.message || 'Please verify your credentials.',
        })
      },
    })
  }

  const formBody = (
    <div className="space-y-4 w-full">
      {/* Server Error Alert */}
      {serverError && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-300 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <AlertTitle className="font-semibold text-xs">Authentication Error</AlertTitle>
          <AlertDescription className="text-[11px] text-red-300/90 leading-relaxed">
            {serverError.message || 'Incorrect email or password. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5 text-left">
          <Label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={isPending}
              className="pl-10 h-11 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:ring-violet-500/20 rounded-xl text-xs sm:text-sm transition-all"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-500 font-medium pl-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <button
              type="button"
              onClick={() => handleAuthNav(ROUTES.AUTH.FORGOT_PASSWORD, 'Loading Password Recovery...')}
              className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isPending}
              className="pl-10 pr-10 h-11 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:ring-violet-500/20 rounded-xl text-xs sm:text-sm transition-all"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isPending}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-500 font-medium pl-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <motion.div whileHover={isAnimated && !isPending ? { scale: 1.01 } : undefined} whileTap={isAnimated && !isPending ? { scale: 0.98 } : undefined}>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-600/30 transition-all gap-2 border border-violet-400/20 text-sm cursor-pointer"
          >
            {isPending ? (
              <LoadingSpinner size="sm" label="Signing in..." />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 text-violet-200" />
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  )

  if (embedded) {
    return formBody
  }

  return (
    <div className="w-full h-screen max-h-screen flex items-center justify-center p-4 bg-background text-foreground relative overflow-hidden select-none transition-colors">
      <BackgroundEffects />
      <motion.div
        className="max-w-md w-full relative z-10"
        initial={isAnimated ? { opacity: 0, y: 20, scale: 0.96 } : undefined}
        animate={isAnimated ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        <GlassCard accentColor="purple" hoverEffect={false} className="p-5 sm:p-6 space-y-4 shadow-2xl rounded-2xl border-border bg-card text-card-foreground">
          <div className="flex flex-col items-center text-center space-y-2">
            <button
              type="button"
              onClick={() => handleAuthNav(ROUTES.PUBLIC.HOME, 'Loading Home...')}
              className="focus:outline-none cursor-pointer"
            >
              <AppLogo size={40} showText={true} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-card-foreground sm:text-2xl pt-1 font-serif">
              Welcome Back
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Sign in to continue your personal journey of growth and restoration.
            </p>
          </div>

          {formBody}

          <div className="pt-2 border-t border-border text-center text-xs text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister || (() => handleAuthNav(ROUTES.AUTH.REGISTER, 'Loading Registration...'))}
              className="font-semibold text-violet-600 dark:text-violet-400 hover:underline transition-colors cursor-pointer"
            >
              Create account
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default LoginForm
