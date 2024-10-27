import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { MainState, User } from '../../types'
import axios from 'axios'

const initialState: MainState = {
  value: 0,
  users: null,
}

export const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },

  },
  extraReducers:(builder) => {
    builder.addCase(fetchAllUser.fulfilled, (state, action) => {
      state.users = action?.payload ?? [];
    })

    builder.addCase(addNewUser.fulfilled, (state, action) => {
      if(!action.payload) {
        return state;
      }
      const newUser = action.payload as User;
      if(state.users == null){
        state.users = [newUser];
      }else{
        state.users?.push(newUser);
      }
    })

    builder.addCase(deleteStudents.pending, (state, action) => {
      state.users = null;
    })
  },
})

// Action creators are generated for each case reducer function
export const { incrementByAmount } = mainSlice.actions

export default mainSlice.reducer

export const fetchAllUser = createAsyncThunk(
  'main/fetchAllUser',
  // if you type your function argument here
  async () => {
    const response = await axios.get(`http://localhost:3000/`);
    return response.data
  },
)

export const addNewUser = createAsyncThunk(
  'main/addNewUser',
  // if you type your function argument here
  async (name:string) => {
    const response = await axios.post(`http://localhost:3000/`,{name})
    return response.data
  },
)

export const deleteStudents = createAsyncThunk(
  'main/deleteStudents',
  // if you type your function argument here
  async () => {
    const response = await axios.delete(`http://localhost:3000/`)
    return response.data
  },
)
