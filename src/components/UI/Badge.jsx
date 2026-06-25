export const STATUS_COLORS = {
  // Colony status
  unmanaged: 'bg-red-100 text-red-700 border-red-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  managed: 'bg-green-100 text-green-700 border-green-200',
  // Trap status
  available: 'bg-green-100 text-green-700 border-green-200',
  in_use: 'bg-amber-100 text-amber-700 border-amber-200',
  needs_pickup: 'bg-red-100 text-red-700 border-red-200',
  // Role
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  volunteer: 'bg-blue-100 text-blue-700 border-blue-200',
  // Gender
  male: 'bg-blue-100 text-blue-700 border-blue-200',
  female: 'bg-pink-100 text-pink-700 border-pink-200',
  unknown: 'bg-gray-100 text-gray-600 border-gray-200',
  // Pipeline status
  tnr: 'bg-gray-100 text-gray-600 border-gray-200',
  socializing: 'bg-blue-100 text-blue-700 border-blue-200',
  adoption_ready: 'bg-amber-100 text-amber-700 border-amber-200',
  adopted: 'bg-green-100 text-green-700 border-green-200',
  // Recovery
  recovering: 'bg-amber-100 text-amber-700 border-amber-200',
  released: 'bg-green-100 text-green-700 border-green-200',
  complications: 'bg-red-100 text-red-700 border-red-200',
}

export const STATUS_LABELS = {
  unmanaged: 'Unmanaged',
  in_progress: 'In Progress',
  managed: 'Managed',
  available: 'Available',
  in_use: 'In Use',
  needs_pickup: 'Needs Pickup',
  admin: 'Admin',
  volunteer: 'Volunteer',
  male: 'Male',
  female: 'Female',
  unknown: 'Unknown',
  // Pipeline
  tnr: 'TNR (Return)',
  socializing: 'Socializing',
  adoption_ready: 'Ready for Adoption',
  adopted: 'Adopted 🎉',
  // Recovery
  recovering: 'Recovering',
  released: 'Released',
  complications: 'Complications',
}

export function Badge({ status, children, className = '' }) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600 border-gray-200'
  const label = children || STATUS_LABELS[status] || status

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}>
      {label}
    </span>
  )
}
