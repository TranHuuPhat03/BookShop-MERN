import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getImgUrl } from '../../utils/getImgUrl';
import { clearCart, removeFromCart, addToCart, decreaseQuantity } from '../../redux/features/cart/cartSlice';

const CartPage = () => {
    const cartItems = useSelector(state => state.cart.cartItems);
    const dispatch =  useDispatch()

    const totalPrice = cartItems.reduce((acc, item) => acc + (item.newPrice * (item.quantity || 1)), 0).toFixed(2);

    const handleRemoveFromCart = (product) => {
        dispatch(removeFromCart(product))
    }

    const handleClearCart = () => {
        dispatch(clearCart())
    }

    const handleIncreaseQuantity = (product) => {
        dispatch(addToCart(product))
    }

    const handleDecreaseQuantity = (product) => {
        dispatch(decreaseQuantity(product))
    }

    return (
        <>
            <div className="flex mt-12 h-full flex-col overflow-hidden bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                        <div className="text-lg font-medium text-gray-900">Giỏ hàng</div>
                        <div className="ml-3 flex h-7 items-center ">
                            <button
                                type="button"
                                onClick={handleClearCart}
                                className="relative -m-2 py-1 px-2 bg-red-500 text-white rounded-md hover:bg-secondary transition-all duration-200"
                            >
                                <span className="">Xóa giỏ hàng</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flow-root">

                            {
                                cartItems.length > 0 ? (
                                    <ul role="list" className="-my-6 divide-y divide-gray-200">
                                        {
                                            cartItems.map((product) => (
                                                <li key={product?._id} className="flex py-6">
                                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                        <img
                                                            alt=""
                                                            src={`${getImgUrl(product?.coverImage)}`}
                                                            className="h-full w-full object-cover object-center"
                                                        />
                                                    </div>

                                                    <div className="ml-4 flex flex-1 flex-col">
                                                        <div>
                                                            <div className="flex flex-wrap justify-between text-base font-medium text-gray-900">
                                                                <h3>
                                                                    <Link to='/'>{product?.title}</Link>
                                                                </h3>
                                                                <p className="sm:ml-4">${product?.newPrice}</p>
                                                            </div>
                                                            <p className="mt-1 text-sm text-gray-500 capitalize"><strong>Thể loại: </strong>{product?.category}</p>
                                                        </div>
                                                        <div className="flex flex-1 flex-wrap items-end justify-between space-y-2 text-sm">
                                                            <div className="flex items-center">
                                                                <span className="text-gray-500 mr-3"><strong>Số lượng:</strong></span>
                                                                <div className="flex items-center border border-gray-300 rounded">
                                                                    <button 
                                                                        onClick={() => handleDecreaseQuantity(product)}
                                                                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200">
                                                                        -
                                                                    </button>
                                                                    <span className="px-3">{product.quantity || 1}</span>
                                                                    <button 
                                                                        onClick={() => handleIncreaseQuantity(product)}
                                                                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200">
                                                                        +
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="flex">
                                                                <button
                                                                onClick={() => handleRemoveFromCart(product)}
                                                                type="button" className="font-medium text-indigo-600 hover:text-indigo-500">
                                                                    Xóa
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="text-right text-sm font-medium text-gray-900 mt-2">
                                                            <p>Tổng tiền: ${(product.newPrice * (product.quantity || 1)).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))
                                        }

                                    </ul>
                                ) : (<p>Không có sản phẩm nào trong giỏ hàng!</p>)
                            }

                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Tổng tiền</p>
                        <p>${totalPrice ? totalPrice : 0}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">Phí vận chuyển và thuế sẽ được tính khi thanh toán.</p>
                    <div className="mt-6">
                        <Link
                            to="/checkout"
                            className={`flex items-center justify-center rounded-md border border-transparent ${cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} px-6 py-3 text-base font-medium text-white shadow-sm`}
                            onClick={(e) => cartItems.length === 0 && e.preventDefault()}
                        >
                            Thanh toán
                        </Link>
                    </div>
                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <Link to="/">
                            hoặc
                            <button
                                type="button"
                                className="font-medium text-indigo-600 hover:text-indigo-500 ml-1"
                            >
                                Tiếp tục mua sắm
                                <span aria-hidden="true"> &rarr;</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CartPage