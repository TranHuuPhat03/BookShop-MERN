import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import getBaseUrl from '../../../utils/baseURL'

const baseQuery = fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/auth`,
    credentials: 'include',
    prepareHeaders: (Headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            Headers.set('Authorization', `Bearer ${token}`);
        }
        return Headers;
    }
})

const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery,
    tagTypes: ['User'],
    endpoints: (builder) => ({
        getUserProfile: builder.query({
            query: (email) => `/profile/${email}`,
            providesTags: ['User']
        }),
        updateUserProfile: builder.mutation({
            query: ({ email, profile }) => ({
                url: `/profile/${email}`,
                method: 'PUT',
                body: { profile }
            }),
            invalidatesTags: ['User']
        })
    })
})

export const { useGetUserProfileQuery, useUpdateUserProfileMutation } = userApi;
export default userApi; 