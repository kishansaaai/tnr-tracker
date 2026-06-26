export function friendlyError(err) {
  if (!err) return 'Something went wrong. Please try again.'
  const msg = err.message || err.toString()
  if (msg.includes('duplicate key')) return 'This record already exists.'
  if (msg.includes('violates foreign key')) return 'Related record not found.'
  if (msg.includes('permission denied') || msg.includes('row-level security')) return 'You don\'t have permission to do that.'
  return 'Something went wrong. Please try again.'
}
