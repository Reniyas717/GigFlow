import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchGigs = createAsyncThunk(
  'gigs/fetchGigs',
  async (search = '', { rejectWithValue }) => {
    try {
      const response = await api.get(`/gigs${search ? `?search=${search}` : ''}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gigs')
    }
  }
)

export const createGig = createAsyncThunk(
  'gigs/createGig',
  async (gigData, { rejectWithValue }) => {
    try {
      const response = await api.post('/gigs', gigData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create gig')
    }
  }
)

const gigSlice = createSlice({
  name: 'gigs',
  initialState: {
    gigs: [],
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
      .addCase(fetchGigs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.loading = false
        state.gigs = action.payload
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createGig.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.loading = false
        state.gigs.unshift(action.payload)
      })
      .addCase(createGig.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = gigSlice.actions
export default gigSlice.reducer