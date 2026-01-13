import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const submitBid = createAsyncThunk(
  'bids/submitBid',
  async (bidData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bids/submit', bidData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit bid')
    }
  }
)

export const fetchBidsForGig = createAsyncThunk(
  'bids/fetchBidsForGig',
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bids/gig/${gigId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bids')
    }
  }
)

export const hireBid = createAsyncThunk(
  'bids/hireBid',
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/bids/${bidId}/hire`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to hire bid')
    }
  }
)

const bidSlice = createSlice({
  name: 'bids',
  initialState: {
    bids: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitBid.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitBid.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(submitBid.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchBidsForGig.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBidsForGig.fulfilled, (state, action) => {
        state.loading = false
        state.bids = action.payload
      })
      .addCase(fetchBidsForGig.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(hireBid.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(hireBid.fulfilled, (state, action) => {
        state.loading = false
        const hiredBidId = action.payload.bid._id
        state.bids = state.bids.map(bid => ({
          ...bid,
          status: bid._id === hiredBidId ? 'hired' : 'rejected'
        }))
      })
      .addCase(hireBid.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = bidSlice.actions
export default bidSlice.reducer