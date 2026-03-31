import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { insuranceApi } from '@/api/insurance.api'
import { pageTransition } from '@/animations/variants'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function InsuranceListPage() {
  const [filter, setFilter] = useState('ALL')
  const { data, isLoading } = useQuery({
    queryKey: ['insurance'],
    queryFn: () => insuranceApi.getList({ limit: 10 }),
  })

  const stats = {
    compliant: 142,
    compliantPct: 88,
    dueSoon: 14,
    dueSoonPct: 9,
    critical: 5,
    criticalPct: 3
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-secondary mb-2">Fleet Compliance</h2>
          <p className="text-sm text-gray-400 mb-8">Review status and insurance coverage overview.</p>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Compliant</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-secondary">{stats.compliant}</span>
                <span className="text-sm font-bold text-success">{stats.compliantPct}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Due Soon</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-secondary">{stats.dueSoon}</span>
                <span className="text-sm font-bold text-warning">{stats.dueSoonPct}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Critical</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-secondary">{stats.critical}</span>
                <span className="text-sm font-bold text-danger">{stats.criticalPct}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-64 bg-danger text-white rounded-xl p-6 shadow-lg flex flex-col justify-between">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 className="font-bold text-xl mb-4">New Review Log Required</h3>
            <Button variant="outline" className="w-full bg-white text-danger border-none hover:bg-gray-50">
              Start Inspection
            </Button>
          </div>
        </div>

        <div className="w-full lg:w-64 bg-gradient-to-br from-[#FFF8E1] to-[#FFECB3] rounded-xl p-6 border border-[#FFC107]/30 flex flex-col justify-between">
          <div className="inline-flex items-center gap-1.5 bg-[#FFC107]/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#B28704] mb-4 w-fit">
            <ShieldCheck size={12} />
            Premium Fleet
          </div>
          <div>
            <h3 className="font-bold text-secondary text-lg mb-2">Technical Review Quality Score</h3>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-secondary">9.8</span>
              <p className="text-[10px] font-medium text-gray-600 leading-tight pb-1">
                Excellent technical health maintained across VIP segment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-secondary">Compliance Queue</h2>
          <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-semibold">
            <button className="px-4 py-1.5 bg-white text-secondary rounded-md shadow-sm">All Vehicles</button>
            <button className="px-4 py-1.5 text-danger hover:text-red-700">Critical Only</button>
          </div>
        </div>

        {/* Mock Queue Items */}
        <div className="flex gap-6 overflow-x-auto pb-4">
          <Card className="flex w-[480px] flex-shrink-0 overflow-hidden border-danger">
            <div className="w-40 bg-[#1E293B] relative flex items-center justify-center">
              <div className="absolute top-2 left-2 bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Overdue</div>
              <div className="text-white text-center opacity-50 text-xs">Car Image</div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-secondary">Porsche 911 Carrera</h4>
                  <span className="text-danger font-black">Red</span>
                </div>
                <p className="text-xs text-gray-500 font-mono mb-4">Plate: ZN-402-WX</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-red-50 p-2 rounded">
                    <p className="text-[10px] font-bold text-danger uppercase mb-1">Technical Review</p>
                    <p className="text-xs font-semibold text-secondary">Expired 12 days ago</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-[10px] font-bold text-success uppercase mb-1">Insurance Renewal</p>
                    <p className="text-xs font-semibold text-secondary">Expires in 18 days</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="danger" className="flex-1">Review Now</Button>
                <Button variant="outline" className="px-3 border-gray-200"><Shield size={16} /></Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-50 text-danger flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="font-bold text-secondary">Log Review</h3>
              <p className="text-xs text-gray-500">Capture inspection details</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Select Vehicle</label>
              <select className="w-full bg-gray-100 border-none rounded-lg px-3 py-2 text-sm font-semibold text-secondary focus:ring-2 focus:ring-primary">
                <option>Porsche 911 (ZN-402-WX)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Inspection Checklist</label>
              <div className="space-y-2">
                {['Engine & Transmission', 'Tires & Suspension', 'Interior Condition', 'Exterior & Paint', 'Fluids & Levels'].map(item => (
                  <label key={item} className="flex items-center gap-3 bg-gray-50 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input type="checkbox" className="rounded text-primary focus:ring-primary w-4 h-4" />
                    <span className="text-sm font-semibold text-gray-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <Button className="w-full bg-secondary hover:bg-black text-white">
            Submit Inspection Report
          </Button>
        </Card>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-lg text-secondary">Recent Review History</h3>
            <button className="text-primary text-sm font-bold hover:underline">Download CSV</button>
          </div>
          <div className="space-y-3">
            {[
              { status: 'success', text: 'Passed Periodic Technical Review', tag: 'PASSED (CLEAN)', color: 'success' },
              { status: 'warning', text: 'Passed with Minor Observations', tag: 'PASSED (WARNING)', color: 'warning' },
              { status: 'danger', text: 'Failed Inspection: Brake System', tag: 'FAILED (REPAIR)', color: 'danger' }
            ].map((item, i) => (
              <Card key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${item.color}/10 text-${item.color}`}>
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary text-sm">Vehicle {i+1} • Plate</h4>
                    <p className="text-xs text-gray-500">{item.text}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-secondary mb-1">Aug 14, 2023</p>
                  <span className={`text-[10px] font-bold text-${item.color} uppercase tracking-widest`}>{item.tag}</span>
                </div>
              </Card>
            ))}
            <Button variant="outline" className="w-full border-dashed border-2">
              View Full History Archives
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
