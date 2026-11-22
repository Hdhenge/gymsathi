import { Pencil, RotateCcw } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-indigo-500',
];

function formatDate(iso) {
  if (!iso) return '-';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase();
}

export function getDerivedStatus(member) {
  if (!member?.endDate) return { status: 'active', daysLeft: 0 };

  const now = new Date();
  const end = new Date(member.endDate);
  if (Number.isNaN(end.getTime())) return { status: 'active', daysLeft: 0 };

  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { status: 'expired', daysLeft };
  if (daysLeft <= 7) return { status: 'expiring', daysLeft };
  return { status: 'active', daysLeft };
}

const STATUS_PILL = {
  active: 'bg-green-100 text-green-700',
  expiring: 'bg-amber-100 text-amber-700',
  expired: 'bg-red-100 text-red-700',
};

const STATUS_LABEL = { active: 'Active', expiring: 'Expiring', expired: 'Expired' };

export default function MemberCard({ member, index }) {
  const { status, daysLeft } = getDerivedStatus(member);
  const totalFees = Number(member?.totalFees || 0);
  const paidAmount = Number(member?.paidAmount || 0);
  const remainingAmount = Number(
    member?.remainingAmount != null ? member.remainingAmount : totalFees - paidAmount
  );
  const paidPct = totalFees > 0 ? Math.round((paidAmount / totalFees) * 100) : 0;
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const safeName = member?.name || 'Unknown Member';
  const safePhone = member?.phone || '-';
  const safePlan = member?.plan || 'custom';

  return (
    <div className='flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'>
      {status === 'expiring' && (
        <div className='border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-700'>
          Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
        </div>
      )}
      {status === 'expired' && (
        <div className='border-b border-red-200 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-700'>
          Expired {Math.abs(daysLeft)} day{Math.abs(daysLeft) !== 1 ? 's' : ''} ago
        </div>
      )}

      <div className='flex flex-1 flex-col gap-3 p-4'>
        <div className='flex items-center gap-3'>
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${avatarColor} text-sm font-bold text-white`}
          >
            {getInitials(safeName)}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate font-semibold text-gray-900'>{safeName}</p>
            <p className='text-xs text-gray-500'>{safePhone}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_PILL[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          {[
            { label: 'Plan', value: <span className='capitalize'>{safePlan}</span> },
            { label: 'Total Fees', value: `Rs ${totalFees}` },
            { label: 'Start', value: formatDate(member?.startDate) },
            { label: 'End', value: formatDate(member?.endDate) },
          ].map(({ label, value }) => (
            <div key={label} className='rounded-lg bg-gray-50 px-3 py-2'>
              <p className='text-[10px] uppercase tracking-wide text-gray-400'>{label}</p>
              <p className='text-sm font-medium text-gray-800'>{value}</p>
            </div>
          ))}
        </div>

        <div>
          <div className='mb-1 flex justify-between text-xs text-gray-600'>
            <span>
              Paid: <span className='font-medium text-green-600'>Rs {paidAmount}</span>
            </span>
            <span>
              Rem: <span className='font-medium text-red-500'>Rs {remainingAmount}</span>
            </span>
          </div>
          <div className='h-2 overflow-hidden rounded-full bg-gray-100'>
            <div
              className='h-full rounded-full bg-green-500 transition-all'
              style={{ width: `${paidPct}%` }}
            />
          </div>
          <p className='mt-0.5 text-right text-[10px] text-gray-400'>{paidPct}% paid</p>
        </div>

        <div className='mt-auto flex items-center justify-between pt-1'>
          <div>
            {(status === 'expiring' || status === 'expired') && (
              <button className='flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100'>
                <RotateCcw size={12} />
                Renew
              </button>
            )}
          </div>
          <button className='flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100'>
            <Pencil size={12} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
