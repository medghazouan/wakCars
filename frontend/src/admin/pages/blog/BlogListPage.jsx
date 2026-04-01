import { motion } from 'framer-motion'
import { pageTransition } from '@admin/animations/variants'

export default function BlogListPage() {
  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition} className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-secondary">Blog Posts</h1>
      <p className="text-gray-500">Manage news and articles.</p>
    </motion.div>
  )
}
