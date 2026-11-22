export default function MemberSearchBar({ search, setSearch, planFilter, setPlanFilter }) {
  return (
    <div className='mb-5 flex gap-2'>
      <input
        type='text'
        placeholder='Search by name or phone...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='w-56 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500'
      />
      <select
        value={planFilter}
        onChange={(e) => setPlanFilter(e.target.value)}
        className='rounded-lg border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500'
      >
        <option value='all'>All Plans</option>
        <option value='monthly'>Monthly</option>
        <option value='quarterly'>Quarterly</option>
        <option value='yearly'>Yearly</option>
        <option value='custom'>Custom</option>
      </select>
    </div>
  );
}
