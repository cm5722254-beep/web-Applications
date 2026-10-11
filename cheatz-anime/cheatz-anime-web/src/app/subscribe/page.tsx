'use client'

import { useState } from 'react'
import { Crown, Check, Sparkles, Zap, Shield, Star, Heart } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

const plans = [
  {
    id: '1month',
    name: '1 ខែ VIP',
    price: '$2.99',
    priceKHR: '៛12,000',
    duration: '1 month',
    popular: false,
  },
  {
    id: '3months',
    name: '3 ខែ VIP',
    price: '$7.99',
    priceKHR: '៛32,000',
    duration: '3 months',
    savings: 'សន្សំ 11%',
    popular: true,
  },
  {
    id: '1year',
    name: '1 ឆ្នាំ VIP',
    price: '$24.99',
    priceKHR: '៛100,000',
    duration: '1 year',
    savings: 'សន្សំ 30%',
    popular: false,
  },
  {
    id: 'lifetime',
    name: 'Lifetime VIP',
    price: '$99.99',
    priceKHR: '៛400,000',
    duration: 'មួយជីវិត',
    savings: 'តម្លៃល្អបំផុត',
    popular: false,
  },
]

const benefits = [
  { icon: Crown, text: 'ចូលមើលរឿង VIP ទាំងអស់គ្មានដែនកំណត់', color: 'text-amber-400' },
  { icon: Sparkles, text: 'គុណភាពវីដេអូ HD, FHD និង 4K', color: 'text-cyan-400' },
  { icon: Zap, text: 'មើលមុនគេ - Episodes ថ្មីមុនគេ 24 ម៉ោង', color: 'text-purple-400' },
  { icon: Shield, text: 'គ្មានផ្សាយពាណិជ្ជកម្ម (Ad-Free)', color: 'text-emerald-400' },
  { icon: Star, text: 'Download episodes ដើម្បីមើល Offline', color: 'text-rose-400' },
  { icon: Heart, text: 'គាំទ្រ SC-ANIME ឲ្យរីកចម្រើន', color: 'text-pink-400' },
]

export default function SubscribePage() {
  const { user, isSubscribed } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState('3months')
  const [processing, setProcessing] = useState(false)

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      alert('សូម login ជាមុនសិន')
      return
    }

    setProcessing(true)
    
    // TODO: Integrate with Razorpay payment gateway
    // For now, just show alert
    setTimeout(() => {
      alert(`កំពុងដំណើរការការទូទាត់សម្រាប់ ${plans.find(p => p.id === planId)?.name}...\n\nការទូទាត់នឹងត្រូវបាន integrate ជាមួយ Razorpay ឆាប់ៗនេះ!`)
      setProcessing(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-bold uppercase tracking-wider">
            <Crown size={16} className="fill-current" />
            <span>VIP Premium Membership</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Upgrade ទៅ <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">SC-ANIME VIP</span>
          </h1>

          <p className="text-neutral-300 text-lg max-w-2xl mx-auto leading-relaxed">
            រីករាយជាមួយ anime & donghua ជាង <strong className="text-white">500+ រឿង VIP</strong> ដោយគុណភាព HD/FHD គ្មានដែនកំណត់
          </p>

          {isSubscribed && (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              <Check size={20} />
              <span className="font-bold">អ្នកគឺជា VIP Member រួចហើយ!</span>
            </div>
          )}
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-5 rounded-2xl bg-[#0d0f1a] border border-white/10 hover:border-amber-500/30 transition-colors"
            >
              <div className={`shrink-0 ${benefit.color}`}>
                <benefit.icon size={24} />
              </div>
              <p className="text-sm text-neutral-200 font-medium leading-relaxed">
                {benefit.text}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            ជ្រើសរើសកញ្ចប់ដែលសមស្រប
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 border-2 transition-all transform hover:scale-[1.02] ${
                  plan.popular
                    ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)]'
                    : 'bg-[#0d0f1a] border-white/10 hover:border-amber-500/40'
                } ${selectedPlan === plan.id ? 'ring-2 ring-amber-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-extrabold uppercase tracking-wider shadow-lg">
                    ពេញនិយម
                  </div>
                )}

                <div className="text-center space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-3xl font-extrabold text-amber-400">{plan.price}</p>
                    <p className="text-sm text-neutral-400">{plan.priceKHR}</p>
                    {plan.savings && (
                      <p className="text-xs text-emerald-400 font-semibold mt-1">{plan.savings}</p>
                    )}
                  </div>

                  <div className="py-3 border-y border-white/10">
                    <p className="text-sm text-neutral-300">រយៈពេល: <strong className="text-white">{plan.duration}</strong></p>
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={processing || isSubscribed}
                    className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {processing ? 'កំពុងដំណើរការ...' : isSubscribed ? 'Active' : 'ជ្រើសរើសផែនការនេះ'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="text-center space-y-4 mb-12">
          <p className="text-sm text-neutral-400">💳 គាំទ្រការទូទាត់តាមរយៈ</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {['Credit Card', 'ABA Pay', 'Wing Money', 'ACLEDA', 'Pi Pay'].map((method) => (
              <div
                key={method}
                className="px-4 py-2 rounded-lg bg-[#0d0f1a] border border-white/10 text-xs text-neutral-300 font-semibold"
              >
                {method}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ / Notes */}
        <div className="max-w-2xl mx-auto bg-[#0d0f1a] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">📝 ចំណាំសំខាន់</h3>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>VIP membership ធ្វើការភ្លាមៗបន្ទាប់ពីការទូទាត់</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>អ្នកអាចលុបចោលនៅពេលណាក៏បាន ដោយគ្មានការចំណាយបន្ថែម</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>សម្រាប់ជំនួយ សូមទាក់ទង: support@scanime.com</span>
            </li>
          </ul>
        </div>

        {/* Back link */}
        {!user && (
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              ← ត្រឡប់ទៅ Home
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
