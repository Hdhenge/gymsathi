const STAT_CARDS = [
  {
    key: 'all',
    label: 'All',
    idle: 'border-gray-200 bg-gray-50 text-gray-700',
    active: 'border-gray-800 bg-gray-800 text-white',
  },
  {
    key: 'active',
    label: 'Active',
    idle: 'border-green-200 bg-green-50 text-green-700',
    active: 'border-green-600 bg-green-600 text-white',
  },
  {
    key: 'expiring',
    label: 'Expiring Soon',
    idle: 'border-amber-200 bg-amber-50 text-amber-700',
    active: 'border-amber-500 bg-amber-500 text-white',
  },
  {
    key: 'expired',
    label: 'Expired',
    idle: 'border-red-200 bg-red-50 text-red-700',
    active: 'border-red-500 bg-red-500 text-white',
  },
];

export default function MemberFilterCards({ counts, statusFilter, setStatusFilter }) {
  return (
    <div className='mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 cursor-pointer'>
      {STAT_CARDS.map(({ key, label, idle, active }) => (
        <button
          key={key}
          onClick={() => setStatusFilter(key)}
          className={`rounded-xl border px-4 py-3 text-left transition hover:opacity-90 ${
            statusFilter === key ? active : idle
          }`}
        >
          <p className='text-2xl font-bold'>{counts[key]}</p>
          <p className='mt-0.5 text-xs opacity-80'>{label}</p>
        </button>
      ))}
    </div>
  );
}
