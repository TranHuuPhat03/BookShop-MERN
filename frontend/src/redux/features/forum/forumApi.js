import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getBaseUrl from '../../../utils/baseURL';

export const forumApi = createApi({
    reducerPath: 'forumApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getBaseUrl()}/api/forum`,
        credentials: 'include',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('user_token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            headers.set('Access-Control-Allow-Credentials', 'true');
            return headers;
        },
    }),
    tagTypes: ['Posts', 'Post'],
    endpoints: (builder) => ({
        getPosts: builder.query({
            query: (params) => ({
                url: '/',
                params: params,
            }),
            providesTags: ['Posts'],
        }),
        getPost: builder.query({
            query: (id) => `/${id}`,
            providesTags: ['Post'],
        }),
        createPost: builder.mutation({
            query: (post) => ({
                url: '/',
                method: 'POST',
                body: post,
            }),
            invalidatesTags: ['Posts'],
        }),
        updatePost: builder.mutation({
            query: ({ id, ...post }) => ({
                url: `/${id}`,
                method: 'PUT',
                body: post,
            }),
            invalidatesTags: ['Posts', 'Post'],
        }),
        deletePost: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Posts'],
        }),
        addComment: builder.mutation({
            query: ({ postId, content }) => ({
                url: `/${postId}/comments`,
                method: 'POST',
                body: { content },
            }),
            invalidatesTags: ['Post'],
        }),
        toggleLike: builder.mutation({
            query: (postId) => ({
                url: `/${postId}/like`,
                method: 'POST',
            }),
            invalidatesTags: ['Post'],
        }),
    }),
});

export const {
    useGetPostsQuery,
    useGetPostQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
    useAddCommentMutation,
    useToggleLikeMutation,
} = forumApi; 