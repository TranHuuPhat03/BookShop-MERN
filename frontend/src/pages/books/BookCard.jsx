import PropTypes from 'prop-types'
import { FiShoppingCart } from 'react-icons/fi'
import { getImgUrl } from '../../utils/getImgUrl'
import { Link } from'react-router-dom'
import { useDispatch } from'react-redux'
import { addToCart } from '../../redux/features/cart/cartSlice'

const BookCard = ({book}) => {
    const dispatch =  useDispatch();

    const handleAddToCart = (product) => {
        dispatch(addToCart(product))
    }
    return (
        <div className="flex gap-6 p-4 rounded-lg transition-shadow duration-300 bg-white">
            {/* Image Section */}
            <div className="w-[180px] h-[250px] flex-shrink-0">
                <Link to={`/books/${book._id}`} className="block w-full h-full">
                    <img
                        src={`${getImgUrl(book?.coverImage)}`}
                        alt={book?.title}
                        className="w-full h-full object-contain hover:scale-105 transition-all duration-200"
                    />
                </Link>
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-1">
                <Link to={`/books/${book._id}`}>
                    <h3 className="text-2xl font-semibold hover:text-blue-600 mb-3">
                        {book?.title}
                    </h3>
                </Link>
                <p className="text-gray-600 mb-4 line-clamp-3">{book?.description}</p>
                
                <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-lg">
                            {book?.newPrice}$ <span className="line-through font-normal ml-2 text-gray-500">{book?.oldPrice}$</span>
                        </p>
                        <button 
                            onClick={() => handleAddToCart(book)}
                            className="btn-primary h-10 px-4 inline-flex items-center gap-2 whitespace-nowrap">
                            <FiShoppingCart />
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

BookCard.propTypes = {
    book: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        coverImage: PropTypes.string.isRequired,
        newPrice: PropTypes.number.isRequired,
        oldPrice: PropTypes.number.isRequired
    }).isRequired
}

export default BookCard