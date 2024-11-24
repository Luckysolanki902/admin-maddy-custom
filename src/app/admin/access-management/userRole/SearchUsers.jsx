'use client'

import { usePathname, useRouter } from 'next/navigation'

export const SearchUsers = () => {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          const formData = new FormData(form)
          const queryTerm = formData.get('search') 
          router.push(pathname + '?search=' + queryTerm)
        }}
      >
        {/* <label htmlFor="search">Search for Users</label>
        <input id="search" name="search" type="text" />
        <button type="submit">Submit</button> */}
        <label htmlFor="search" style={{ display: 'block', fontSize: '1.125rem', fontWeight: '600', color: '#85e0e0', marginBottom: '0.5rem' }}>Search for Users</label>
<input
  id="search"
  name="search"
  type="text"
  style={{
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    outline: 'none',
    focus: { ring: '2px solid #6366f1' },
    marginBottom: '1rem',
  }}
  placeholder="Search..."
/>
<button
  type="submit"
  style={{
    width: '100px',
    backgroundColor: '#3366ff',
    color: 'white',
    fontWeight:'bold',
    padding: '0.75rem',
    borderRadius:'8px',
    marginBottom:'20px',
    border:'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  }}
  onMouseOver={(e) => (e.target.style.backgroundColor = '#434190')}
  onMouseOut={(e) => (e.target.style.backgroundColor = '#3366ff')}
>
  Submit
</button>
      </form>
    </div>
  )
}