import { Link, useNavigate } from "react-router-dom";
import { HiOutlineHome, HiOutlineHeart, HiOutlineShoppingCart } from "react-icons/hi2";
import { IoSearchOutline, IoClose } from "react-icons/io5";
import { HiOutlineUser } from "react-icons/hi";

import avatarImg from "../assets/avatar.png"
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { useFetchAllBooksQuery } from "../redux/features/books/booksApi";
import { getImgUrl } from "../utils/getImgUrl";

const navigation = [
    {name: "Trang cá nhân", href:"/user-dashboard"},
    {name: "Đơn hàng", href:"/orders"},
    {name: "Giỏ hàng", href:"/cart"},
    {name: "Thanh toán", href:"/checkout"},
    {name: "Diễn đàn", href:"/forum"},
]

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const searchRef = useRef(null);
    
    const navigate = useNavigate();
    const cartItems = useSelector(state => state.cart.cartItems);
    const {data: books = []} = useFetchAllBooksQuery();
    
    const {currentUser, logout} = useAuth()
    
    const handleLogOut = () => {
        logout()
    }

    const userToken = localStorage.getItem('user_token');
    
    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        if (value.trim()) {
            // Filter books based on search term
            const results = books.filter(book => 
                book.title.toLowerCase().includes(value.toLowerCase()) || 
                // book.description.toLowerCase().includes(value.toLowerCase()) ||
                book.category.toLowerCase().includes(value.toLowerCase())
            );
            setSearchResults(results);
            setShowResults(true);
        } else {
            setShowResults(false);
            setSearchResults([]);
        }
    };
    
    // Handle clicking on a search result
    const handleResultClick = (bookId) => {
        setShowResults(false);
        setSearchTerm("");
        navigate(`/books/${bookId}`);
    };
    
    // Handle search submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        
        if (searchTerm.trim()) {
            // Navigate to search results page or show results
            // For now just make sure results are visible
            const results = books.filter(book => 
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(results);
            setShowResults(true);
        }
    };
    
    // Close search results when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    // Clear search
    const clearSearch = () => {
        setSearchTerm("");
        setShowResults(false);
        setSearchResults([]);
    };
  
    return (
        <header className="max-w-screen-2xl mx-auto px-4 py-6">
            <nav className="flex justify-between items-center">
                {/* left side */}
                <div className="flex items-center md:gap-16 gap-4">
                    <Link to="/">
                        <HiOutlineHome className="size-8" />
                    </Link>

                    {/* search input */}
                    <div className="relative sm:w-72 w-40 space-x-2" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit}>
                            <IoSearchOutline className="absolute inline-block left-3 inset-y-2" />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm sách" 
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="bg-[#EAEAEA] w-full py-1 md:px-8 px-6 rounded-md focus:outline-none"
                            />
                            {searchTerm && (
                                <button 
                                    type="button" 
                                    onClick={clearSearch} 
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                >
                                    <IoClose />
                                </button>
                            )}
                        </form>

                        {/* Search Results Dropdown */}
                        {showResults && searchResults.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-md z-50 max-h-96 overflow-y-auto">
                                <div className="p-2 border-b">
                                    <p className="text-sm text-gray-500">Kết quả tìm kiếm ({searchResults.length})</p>
                                </div>
                                <ul>
                                    {searchResults.map(book => (
                                        <li 
                                            key={book._id} 
                                            className="hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleResultClick(book._id)}
                                        >
                                            <div className="flex items-center p-2 gap-2">
                                                <div className="w-12 h-16 flex-shrink-0">
                                                    <img 
                                                        src={getImgUrl(book.coverImage)} 
                                                        alt={book.title} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{book.title}</p>
                                                    <p className="text-xs text-gray-500 truncate">{book.category}</p>
                                                    <p className="text-sm font-bold text-primary">{book.newPrice}₫</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* No Results Message */}
                        {showResults && searchTerm && searchResults.length === 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-md z-50 p-4 text-center">
                                <p className="text-gray-500">Không tìm thấy sách nào phù hợp</p>
                            </div>
                        )}
                    </div>
                </div>


                {/* rigth side */}
                <div className="relative flex items-center md:space-x-3 space-x-2">
                    <Link to="/forum" className="hidden sm:block text-gray-700 hover:text-primary">
                        Diễn đàn
                    </Link>
                    <div >
                        {
                            currentUser ? <>
                            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                <img src={avatarImg} alt="" className={`size-7 rounded-full ${currentUser ? 'ring-2 ring-blue-500' : ''}`} />
                            </button>
                            {/* show dropdowns */}
                            {
                                isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-40">
                                        <ul className="py-2">
                                            {
                                                navigation.map((item) => (
                                                    <li key={item.name} onClick={() => setIsDropdownOpen(false)}>
                                                        <Link to={item.href} className="block px-4 py-2 text-sm hover:bg-gray-100">
                                                            {item.name}
                                                        </Link>
                                                    </li>
                                                ))
                                            }
                                            <li>
                                                <button
                                                onClick={handleLogOut}
                                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Đăng xuất</button>
                                            </li>
                                        </ul>
                                    </div>
                                )
                            }
                            </> : userToken ?  <Link to="/dashboard" className='border-b-2 border-primary'>Trang quản lý</Link> : (
                                <Link to="/login"> <HiOutlineUser className="size-6" /></Link>
                            )
                        }
                    </div>
                    
                    <button className="hidden sm:block">
                        <HiOutlineHeart className="size-6" />
                    </button>

                    <Link to="/cart" className="bg-primary p-1 sm:px-6 px-2 flex items-center rounded-sm">
                        <HiOutlineShoppingCart className='' />
                        {
                            cartItems.length > 0 ?  <span className="text-sm font-semibold sm:ml-1">{cartItems.length}</span> :  <span className="text-sm font-semibold sm:ml-1">0</span>
                        }
                    </Link>
                </div>
            </nav>
        </header>
    )
}

export default Navbar;