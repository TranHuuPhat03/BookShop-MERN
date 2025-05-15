import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form"
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [message, setMessage] = useState("")
    const { loginUser, signInWithGoogle} = useAuth();
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()

      const onSubmit = async (data) => {
        try {
            setMessage("");
            const result = await loginUser(data.email, data.password);
            if (result) {
                alert("Đăng nhập thành công!");
                navigate("/", { replace: true });
            }
        } catch (error) {
            setMessage("Vui lòng nhập email và mật khẩu hợp lệ");
            console.error("Login error:", error);
        }
      }

      const handleGoogleSignIn = async () => {
        try {
            setMessage("");
            const result = await signInWithGoogle();
            if (result) {
                alert("Đăng nhập thành công!");
                navigate("/", { replace: true });
            }
        } catch (error) {
            setMessage("Đăng nhập bằng Google thất bại!");
            console.error("Google sign-in error:", error);
        }
      }
  return (
    <div className='h-[calc(100vh-120px)] flex justify-center items-center '>
        <div className='w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
            <h2 className='text-xl font-semibold mb-4'>Vui lòng đăng nhập</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="email">Email</label>
                    <input 
                    {...register("email", { required: true })} 
                    type="email" name="email" id="email" placeholder='Địa chỉ email'
                    className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="password">Mật khẩu</label>
                    <input 
                    {...register("password", { required: true })} 
                    type="password" name="password" id="password" placeholder='Mật khẩu'
                    className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow'
                    />
                </div>
                {
                    message && <p className='text-red-500 text-xs italic mb-3'>{message}</p>
                }
                <div>
                    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none'>Đăng nhập</button>
                </div>
            </form>
            <div className='mt-4 text-center'>
                <p className='text-sm font-medium'>
                Chưa có tài khoản? <Link to="/register" className='text-blue-500 hover:text-blue-700'>Đăng ký</Link>
                </p>
            </div>
            <div className='mt-3'>
                <Link 
                    to="/admin" 
                    className='w-full flex flex-wrap gap-1 items-center justify-center bg-secondary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none'>
                    Đăng nhập Admin
                </Link>
            </div>



            {/* google sign in */}
            <div className='mt-4'>
                <button 
                onClick={handleGoogleSignIn}
                className='w-full flex flex-wrap gap-1 items-center justify-center bg-secondary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none'>
                <FaGoogle  className='mr-2'/>
                Đăng nhập bằng Google
                </button>
            </div>

            <p className='mt-5 text-center text-gray-500 text-xs'>©2025 Book Store. Đã đăng ký bản quyền.</p>
        </div>
    </div>
  )
}

export default Login