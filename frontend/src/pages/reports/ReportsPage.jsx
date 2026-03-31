import { motion } from 'framer-motion'
import { pageTransition } from '@/animations/variants'

export default function ReportsPage() {
  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition} className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-secondary">Reports & Analytics</h1>
      <p className="text-gray-500">View revenue, utilization, and export data.</p>
    </motion.div>
  )
}
