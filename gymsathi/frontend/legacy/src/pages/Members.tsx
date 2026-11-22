import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus } from 'lucide-react';
import { fetchMembers } from '../store/membersSlice';
import AddMemberModal from '../components/AddMemberModal';
import MemberFilterCards from '../components/MemberFilterCards';
import MemberSearchBar from '../components/MemberSearchBar';
import MemberGrid from '../components/MemberGrid';
import { getDerivedStatus } from '../components/MemberCard';

export default function Members() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.members);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);

  const members = useMemo(() => (Array.isArray(list) ? list : []), [list]);

  const enriched = useMemo(
    () =>
      members
        .filter(Boolean)
        .map((m) => ({
          ...m,
          name: typeof m.name === 'string' ? m.name : '',
          phone: m.phone == null ? '' : String(m.phone),
          plan: typeof m.plan === 'string' ? m.plan : 'custom',
          _derived: getDerivedStatus(m),
        })),
    [members]
  );

  const counts = useMemo(
    () => ({
      all: members.length,
      active: enriched.filter((m) => m._derived.status === 'active').length,
      expiring: enriched.filter((m) => m._derived.status === 'expiring').length,
      expired: enriched.filter((m) => m._derived.status === 'expired').length,
    }),
    [members.length, enriched]
  );

  const filtered = useMemo(() => {
    let out = enriched;
    if (statusFilter !== 'all') out = out.filter((m) => m._derived.status === statusFilter);
    if (planFilter !== 'all') out = out.filter((m) => m.plan === planFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        (m) => m.name.toLowerCase().includes(q) || m.phone.includes(q)
      );
    }
    return out;
  }, [enriched, statusFilter, planFilter, search]);

  return (
    <div className='p-6'>
      <div className='mb-5 flex items-center justify-between'>
        <h1 className='text-xl font-bold text-gray-900'>Members</h1>
        <button
          onClick={() => setShowModal(true)}
          className='flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-600'
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {showModal && <AddMemberModal onClose={() => setShowModal(false)} />}

      {error && (
        <div className='mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600'>
          {error}
        </div>
      )}

      <MemberFilterCards counts={counts} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      <MemberSearchBar search={search} setSearch={setSearch} planFilter={planFilter} setPlanFilter={setPlanFilter} />
      <MemberGrid loading={loading} filtered={filtered} />
    </div>
  );
}
