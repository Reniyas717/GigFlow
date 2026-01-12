import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { submitBid } from '../bids/bidSlice'
import api from '../../utils/api'

export default function GigDetailPage() {
  const { gigId } = useParams()
  const [gig, setGig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bidForm, setBidForm] = useState({ message: '', price: '' })
  
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { loading: bidLoading, error: bidError } = useSelector((state) => state.bids)

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await api.get(`/gigs?_id=${gigId}`)
        if (response.data.length > 0) {
          setGig(response.data[0])
        }
      } catch (error) {
        console.error('Failed to fetch gig')
      } finally {
        setLoading(false)
      }
    }
    fetchGig()
  }, [gigId])

  const handleBidSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(submitBid({
      gigId,
      message: bidForm.message,
      price: Number(bidForm.price)
    }))
    if (result.type === 'bids/submitBid/fulfilled') {
      setBidForm({ message: '', price: '' })
      alert('Bid submitted successfully!')
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!gig) return <div className="text-center py-8">Gig not found</div>

  const isOwner = user && user.id === gig.ownerId._id

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold mb-4">{gig.title}</h1>
        <p className="text-gray-700 mb-4">{gig.description}</p>
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-2xl font-semibold text-green-600">
            Budget: ${gig.budget}
          </span>
          <span className="text-gray-500">
            Status: <span className="font-semibold">{gig.status}</span>
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Posted by: {gig.ownerId.name}
        </p>
      </div>

      {!isOwner && user && gig.status === 'open' && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Submit a Bid</h2>
          
          {bidError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {bidError}
            </div>
          )}

          <form onSubmit={handleBidSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Your Offer ($)</label>
              <input
                type="number"
                value={bidForm.price}
                onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Message</label>
              <textarea
                value={bidForm.message}
                onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={bidLoading}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              {bidLoading ? 'Submitting...' : 'Submit Bid'}
            </button>
          </form>
        </div>
      )}

      {isOwner && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          This is your gig. Go to Dashboard to view bids.
        </div>
      )}
    </div>
  )
}