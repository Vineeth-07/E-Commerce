import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User } from "../../app/models/user";
import { FieldValues } from "react-hook-form";
import agent from "../../app/api/agent";
import { router } from "../../app/router/Routes";

interface AccountState {
    user: User | null;
    error: string | null;
}

const initialState: AccountState = {
    user: null,
    error: null
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
    if (typeof error === "string" && error.trim()) {
        return error;
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return fallbackMessage;
}

export const signInUser = createAsyncThunk<User, FieldValues, { rejectValue: string }>(
    'auth/login',
    async (data, { rejectWithValue }) => {
        try{
            const user = await agent.Account.login(data);
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        }
        catch(error){
            return rejectWithValue(getErrorMessage(error, 'Sign in failed. Please try again.'));
        }
    }
)

export const registerUser = createAsyncThunk<
    User,
    { username: string; email: string; password: string },
    { rejectValue: string }
>(
    'auth/register',
    async (data, { rejectWithValue }) => {
        try {
            const user = await agent.Account.register(data);
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Registration failed. Please try again.'));
        }
    }
)

export const fetchCurrentUser = createAsyncThunk<User | null>(
    'auth/fetchCurrentUser',
    async() =>{
        try{
            //Retrieve user data from local storage
            const userString = localStorage.getItem('user');
            if(userString){
                const user = JSON.parse(userString) as User;
                return user;
            }
            return null;
        }
        catch(error){
            console.error("Error Fetching current User:", error);
            return null;
        }
    }
)

export const logoutUser = createAsyncThunk<void>(
    'auth/logout',
    async() =>{
        try{
            //Remove user from local storage
            localStorage.removeItem('user');
        }
        catch(error){
            console.error("Error logging out user");
        }
    }
)

export const accountSlice = createSlice({
    name:'account',
    initialState,
    reducers:{
        logOut:(state)=>{
            state.user = null;
            state.error = null;
            localStorage.removeItem('user');
            router.navigate('/');
        }, clearError:(state)=>{
            state.error = null;
        }
    },
    extraReducers:(builder=>{
        builder
            .addCase(signInUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.error = null;
            })
            .addCase(signInUser.rejected, (state, action) => {
                state.error = action.payload ?? 'Sign in failed. Please try again.';
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.error = action.payload ?? 'Registration failed. Please try again.';
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.user = null;
                state.error = null;
            });
    })
})
export const {logOut, clearError} = accountSlice.actions;
