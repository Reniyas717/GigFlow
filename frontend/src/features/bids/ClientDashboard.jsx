import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBidsForGig, hireBid } from './bidSlice'
import api from '../../utils/api'

export default function ClientDashboard() {
  const [myGigs, setMyGigs] = useState([])
  const [selectedGig, setSelectedGig] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const dispatch = useDispatch()
  const { bids, loading: bidLoading, error } = useSelector((state) => state.bids)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchMyGigs = async () => {
      try {
        const response = await api.get('/gigs')
        const userGigs = response.data.filter(gig => gig.ownerId._id === user.id)
        setMyGigs(userGigs)
      } catch (error) {
        console.error('Failed to fetch gigs')
      } finally {
        setLoading(false)
      }
    }
    fetchMyGigs()
  }, [user])

  const handleViewBids = (gig) => {
    setSelectedGig(gig)
    dispatch(fetchBidsForGig(gig._id))
  }

  const handleHire = async (bidId) => {
    if (window.confirm('Are you sure you want to hire this bid?')) {
      const result = await dispatch(hireBid(bidId))
      if (result.type === 'bids/hireBid/fulfilled') {
        alert('Bid hired successfully!')
        // Refresh gigs
        const response = await api.get('/gigs')
        const userGigs = response.data.filter(gig => gig.ownerId._id === user.id)
        setMyGigs(userGigs)
      }
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Gigs Dashboard</h1>

      {myGigs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          You haven't created any gigs yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Gigs</h2>
            <div className="space-y-4">
              {myGigs.map((gig) => (
                <div
                  key={gig._id}
                  className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg"
                  onClick={() => handleViewBids(gig)}
                >
                  <h3 className="font-semibold">{gig.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{gig.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-green-600 font-semibold">
                      ${gig.budget}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      gig.status === 'open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {gig.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">
              {selectedGig ? `Bids for "${selectedGig.title}"` : 'Select a gig to view bids'}
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {bidLoading ? (
              <div className="text-center py-8">Loading bids...</div>
            ) : selectedGig ? (
              bids.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No bids yet for this gig.
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <div key={bid._id} className="bg-white p-4 rounded-lg shadow-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{bid.freelancerId.name}</p>
                          <p className="text-sm text-gray-600">{bid.freelancerId.email}</p>
                        </div>
                        <span className="text-xl font-bold text-green-600">
                          ${bid.price}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{bid.message}</p>
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 text-xs rounded ${
                          bid.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : bid.status === 'hired'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bid.status}
                        </span>
                        {bid.status === 'pending' && selectedGig.status === 'open' && (
                          <button
                            onClick={() => handleHire(bid._id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Hire
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}