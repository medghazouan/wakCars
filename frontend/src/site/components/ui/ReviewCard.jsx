import { motion } from 'framer-motion'

const StarIcon = ({ filled }) => (
  <svg
    className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const ReviewCard = ({ review, index = 0 }) => {
  const { name, nationality, vehicle, rating, comment, avatar } = review

  return (
    <motion.div
      className="bg-white p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gray-200 flex items-center justify-center overflow-hidden">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-display font-bold text-primary">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="font-display font-bold text-text-primary">{name}</h4>
          <p className="text-sm text-text-secondary">{nationality}</p>
        </div>

        {/* Rating */}
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon key={star} filled={star <= rating} />
          ))}
        </div>
      </div>

      {/* Comment */}
      <p className="text-text-secondary leading-relaxed mb-4">
        "{comment}"
      </p>

      {/* Vehicle */}
      {vehicle && (
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-primary">{vehicle}</span>
        </p>
      )}
    </motion.div>
  )
}

export default ReviewCard
