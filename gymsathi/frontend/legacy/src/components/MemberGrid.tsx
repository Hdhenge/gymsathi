import MemberCard from './MemberCard';

export default function MemberGrid({ loading, filtered }) {
  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 py-20 text-gray-400'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent' />
        Loading members...
      </div>
    );
  }

  if (filtered.length === 0) {
    return <div className='py-16 text-center text-gray-400'>No members found.</div>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1rem',
      }}
    >
      {filtered.map((member, i) => (
        <MemberCard key={member._id} member={member} index={i} />
      ))}
    </div>
  );
}
