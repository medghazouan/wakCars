import { Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

function healthLabel(score) {
  if (score >= 85) return 'Excellent'
  if (score >= 65) return 'Good'
  if (score >= 45) return 'Fair'
  return 'Needs attention'
}

export function FleetHealthCard({ score = 0, isLoading }) {
  const pct = Math.min(100, Math.max(0, Math.round(Number(score) || 0)))
  const label = healthLabel(pct)

  return (
    <div className="rounded-xl bg-gradient-to-br from-[#E61E25] to-[#991418] p-6 text-white shadow-lg relative overflow-hidden h-[300px] flex flex-col justify-between">
      {/* Background Decor */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      
      <div>
        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
          <Star size={12} className="text-tertiary fill-tertiary" />
          Premium Insights
        </div>
        
        <h3 className="text-xl font-bold mb-2">Fleet Health Score</h3>
        
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-6xl font-black tracking-tighter">
            {isLoading ? '…' : `${pct}%`}
          </span>
          <span className="text-sm font-medium text-white/80">{isLoading ? '' : label}</span>
        </div>
        
        <div className="w-full bg-black/20 rounded-full h-2 mb-8">
          <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: isLoading ? '0%' : `${pct}%` }}></div>
        </div>
      </div>
      
      <Button variant="outline" className="w-full bg-white text-primary border-none hover:bg-gray-50">
        Run Technical Audit
      </Button>
    </div>
  )
}
