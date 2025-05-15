import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useForm } from "react-hook-form"
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import Swal from'sweetalert2';
import { useCreateOrderMutation } from '../../redux/features/orders/ordersApi';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '../../redux/features/users/userApi';

const CheckoutPage = () => {
    const cartItems = useSelector(state => state.cart.cartItems);
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.newPrice * (item.quantity || 1)), 0).toFixed(2);
    const totalItemsCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const { currentUser } = useAuth()
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm()

    const [createOrder, {isLoading}] = useCreateOrderMutation();
    const navigate = useNavigate()

    const [isChecked, setIsChecked] = useState(false)
    const [saveProfile, setSaveProfile] = useState(true)
    const [orderError, setOrderError] = useState("")
    
    const { data: profileData } = useGetUserProfileQuery(currentUser?.email, {
        skip: !currentUser?.email
    });
    
    const [updateUserProfile] = useUpdateUserProfileMutation();
    
    // Pre-fill form with existing profile data if available
    useEffect(() => {
        if (profileData?.profile) {
            const { name, phone, address } = profileData.profile;
            
            if (name) setValue('name', name);
            if (phone) setValue('phone', phone);
            if (address) {
                if (address.street) setValue('address', address.street);
                if (address.city) setValue('city', address.city);
                if (address.state) setValue('state', address.state);
                if (address.country) setValue('country', address.country);
                if (address.zipcode) setValue('zipcode', address.zipcode);
            }
        }
    }, [profileData, setValue]);
    
    // Check if cart is empty on component load and cart changes
    useEffect(() => {
        if (cartItems.length === 0) {
            setOrderError("Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
        } else {
            setOrderError("");
        }
    }, [cartItems]);
    
    const onSubmit = async (data) => {
        // Check if cart is empty or price is 0
        if (cartItems.length === 0 || parseFloat(totalPrice) === 0) {
            setOrderError("Không thể đặt hàng với giỏ hàng trống hoặc tổng tiền $0");
            Swal.fire({
                title: "Giỏ hàng trống",
                text: "Bạn không thể đặt hàng với giỏ hàng trống hoặc tổng tiền $0",
                icon: "error",
                confirmButtonColor: "#3085d6",
            });
            return;
        }

        setOrderError("");
        
        // Include product quantities and prices in the order
        const newOrder = {
            name: data.name,
            email: currentUser?.email,
            address: {
                city: data.city,
                country: data.country,
                state: data.state,
                zipcode: data.zipcode
            },
            phone: data.phone,
            products: cartItems.map(item => ({
                productId: item._id,
                quantity: item.quantity || 1,
                price: item.newPrice || item.price || 0
            })),
            totalPrice: totalPrice,
        }
        
        try {
            // Save user profile if checkbox is checked
            if (saveProfile && currentUser?.email) {
                const profileData = {
                    name: data.name,
                    phone: data.phone,
                    address: {
                        street: data.address,
                        city: data.city,
                        state: data.state,
                        country: data.country,
                        zipcode: data.zipcode
                    }
                };
                
                await updateUserProfile({
                    email: currentUser.email,
                    profile: profileData
                }).unwrap();
            }
            
            await createOrder(newOrder).unwrap();
            Swal.fire({
                title: "Xác nhận đơn hàng",
                text: "Đơn hàng của bạn đã được đặt thành công!",
                icon: "success",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Đồng ý!"
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/orders");
                    window.location.reload(); // reload sau khi chuyển trang
                }
            });
        } catch (error) {
            console.error("Error place an order", error);
            alert("Đặt hàng thất bại")
        }
    }

    if(isLoading) return <div>Đang tải....</div>
    
    return (
        <section>
            <div className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">
                <div className="container max-w-screen-lg mx-auto">
                    <div>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-600 mb-2">Thanh toán khi nhận hàng</h2>
                            <p className="text-gray-500 mb-2">Tổng tiền: ${totalPrice}</p>
                            <p className="text-gray-500 mb-6">Tổng số sản phẩm: {totalItemsCount}</p>
                            
                            {orderError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                                    <p>{orderError}</p>
                                    {cartItems.length === 0 && (
                                        <div className="mt-2">
                                            <Link to="/" className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                                Xem sách
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded shadow-sm p-4 mb-6">
                            <h3 className="font-medium mb-2">Tóm tắt đơn hàng</h3>
                            <ul className="divide-y">
                                {cartItems.map(item => (
                                    <li key={item._id} className="py-2 flex justify-between">
                                        <div>
                                            <span className="font-medium">{item.title}</span>
                                            <span className="text-sm text-gray-500 ml-2">x {item.quantity || 1}</span>
                                        </div>
                                        <span>${(item.newPrice * (item.quantity || 1)).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t mt-3 pt-3 font-medium flex justify-between">
                                <span>Tổng cộng:</span>
                                <span>${totalPrice}</span>
                            </div>
                        </div>
                        
                            <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
                                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3 my-8">
                                    <div className="text-gray-600">
                                        <p className="font-medium text-lg">Thông tin cá nhân</p>
                                        <p>Vui lòng điền đầy đủ thông tin.</p>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                                            <div className="md:col-span-5">
                                                <label htmlFor="full_name">Họ và tên</label>
                                                <input
                                                    {...register("name", { required: true })}
                                                    type="text" name="name" id="name" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                                                {errors.name && <span className="text-red-500 text-xs">Vui lòng nhập họ tên</span>}
                                            </div>

                                            <div className="md:col-span-5">
                                                <label htmlFor="email">Địa chỉ email</label>
                                                <input
                                                    type="text" name="email" id="email" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                    disabled
                                                    defaultValue={currentUser?.email}
                                                    placeholder="email@domain.com" />
                                            </div>
                                            <div className="md:col-span-5">
                                                <label htmlFor="phone">Số điện thoại</label>
                                                <input
                                                    {...register("phone", { required: true })}
                                                    type="number" name="phone" id="phone" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="+84" />
                                                {errors.phone && <span className="text-red-500 text-xs">Vui lòng nhập số điện thoại</span>}
                                            </div>

                                            <div className="md:col-span-3">
                                                <label htmlFor="address">Địa chỉ</label>
                                                <input
                                                    {...register("address", { required: true })}
                                                    type="text" name="address" id="address" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="" />
                                                {errors.address && <span className="text-red-500 text-xs">Vui lòng nhập địa chỉ</span>}
                                            </div>

                                            <div className="md:col-span-2">
                                                <label htmlFor="city">Thành phố</label>
                                                <input
                                                    {...register("city", { required: true })}
                                                    type="text" name="city" id="city" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="" />
                                                {errors.city && <span className="text-red-500 text-xs">Vui lòng nhập thành phố</span>}
                                            </div>

                                            <div className="md:col-span-2">
                                                <label htmlFor="country">Quốc gia</label>
                                                <div className="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                                                    <input
                                                        {...register("country", { required: true })}
                                                        name="country" id="country" placeholder="Quốc gia" className="px-4 appearance-none outline-none text-gray-800 w-full bg-transparent" />
                                                    <button tabIndex="-1" className="cursor-pointer outline-none focus:outline-none transition-all text-gray-300 hover:text-red-600">
                                                        <svg className="w-4 h-4 mx-2 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                                        </svg>
                                                    </button>
                                                    <button tabIndex="-1" className="cursor-pointer outline-none focus:outline-none border-l border-gray-200 transition-all text-gray-300 hover:text-blue-600">
                                                        <svg className="w-4 h-4 mx-2 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                                    </button>
                                                </div>
                                                {errors.country && <span className="text-red-500 text-xs">Vui lòng nhập quốc gia</span>}
                                            </div>

                                            <div className="md:col-span-2">
                                                <label htmlFor="state">Tỉnh/Thành phố</label>
                                                <div className="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                                                    <input
                                                        {...register("state", { required: true })}
                                                        name="state" id="state" placeholder="Tỉnh/Thành phố" className="px-4 appearance-none outline-none text-gray-800 w-full bg-transparent" />
                                                    <button className="cursor-pointer outline-none focus:outline-none transition-all text-gray-300 hover:text-red-600">
                                                        <svg className="w-4 h-4 mx-2 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                                        </svg>
                                                    </button>
                                                    <button tabIndex="-1" className="cursor-pointer outline-none focus:outline-none border-l border-gray-200 transition-all text-gray-300 hover:text-blue-600">
                                                        <svg className="w-4 h-4 mx-2 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                                    </button>
                                                </div>
                                                {errors.state && <span className="text-red-500 text-xs">Vui lòng nhập tỉnh/thành phố</span>}
                                            </div>

                                            <div className="md:col-span-1">
                                                <label htmlFor="zipcode">Mã bưu điện</label>
                                                <input
                                                    {...register("zipcode", { required: true })}
                                                    type="text" name="zipcode" id="zipcode" className="transition-all flex items-center h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="" />
                                                {errors.zipcode && <span className="text-red-500 text-xs">Vui lòng nhập mã bưu điện</span>}
                                            </div>
                                            
                                            <div className="md:col-span-5 mt-3">
                                                <div className="inline-flex items-center">
                                                    <input
                                                        onChange={(e) => setSaveProfile(e.target.checked)}
                                                        checked={saveProfile}
                                                        type="checkbox" name="save_profile" id="save_profile" className="form-checkbox" />
                                                    <label htmlFor="save_profile" className="ml-2">Lưu thông tin này cho lần sau</label>
                                                </div>
                                            </div>

                                            <div className="md:col-span-5 mt-3">
                                                <div className="inline-flex items-center">
                                                    <input
                                                        onChange={(e) => setIsChecked(e.target.checked)}
                                                        type="checkbox" name="billing_same" id="billing_same" className="form-checkbox" />
                                                    <label htmlFor="billing_same" className="ml-2 ">Tôi đồng ý với <Link className='underline underline-offset-2 text-blue-600'>Điều khoản & Điều kiện</Link> và <Link className='underline underline-offset-2 text-blue-600'>Chính sách mua hàng</Link></label>
                                                </div>
                                            </div>

                                            <div className="md:col-span-5 text-right">
                                                <div className="inline-flex items-end">
                                                    <button
                                                        disabled={!isChecked || cartItems.length === 0 || parseFloat(totalPrice) === 0}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Đặt hàng</button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </form>
                            </div>
                        


                    </div>


                </div>
            </div>
        </section>
    )
}

export default CheckoutPage