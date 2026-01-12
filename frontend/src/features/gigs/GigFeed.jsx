import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchGigs } from './gigSlice'

export default function GigFeed() {
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { gigs, loading, error } = useSelector((state) => state.gigs)

  useEffect(() => {
    dispatch(fetchGigs())
  }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(fetchGigs(search))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Open Gigs</h1>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {gigs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No gigs found</div>
          ) : (
            gigs.map((gig) => (
              <div key={gig._id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">{gig.title}</h3>
                <p className="text-gray-600 mb-3">{gig.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-semibold">
                    Budget: ${gig.budget}
                  </span>
                  <Link
                    to={`/gigs/${gig._id}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View Details
                  </Link>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Posted by: {gig.ownerId.name}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}