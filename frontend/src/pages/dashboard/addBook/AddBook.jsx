import { useState } from 'react'
import InputField from './InputField'
import SelectField from './SelectField'
import { useForm } from 'react-hook-form'
import { useAddBookMutation } from '../../../redux/features/books/booksApi'
import Swal from 'sweetalert2'

const AddBook = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            trending: false
        }
    });
    const [imageFileName, setimageFileName] = useState('')
    const [addBook, {isLoading}] = useAddBookMutation()
    
    const onSubmit = async (data) => {
        if (!imageFileName) {
            alert("Vui lòng chọn ảnh bìa sách");
            return;
        }
 
        const newBookData = {
            ...data,
            coverImage: imageFileName
        }
        try {
            await addBook(newBookData).unwrap();
            Swal.fire({
                title: "Thêm sách",
                text: "Sách đã được thêm thành công!",
                icon: "success",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Đồng ý!"
              });
              reset();
              setimageFileName('')
        } catch (error) {
            console.error(error);
            alert("Không thể thêm sách. Vui lòng thử lại.")   
        }
      
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file) {
            setimageFileName(file.name);
        }
    }
  return (
    <div className="max-w-lg mx-auto md:p-6 p-3 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Thêm sách mới</h2>

      {/* Form starts here */}
      <form onSubmit={handleSubmit(onSubmit)} className=''>
        {/* Reusable Input Field for Title */}
        <InputField
          label="Tên sách"
          name="title"
          placeholder="Nhập tên sách"
          register={register}
          required={true}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">Vui lòng nhập tên sách</p>}

        {/* Reusable Textarea for Description */}
        <InputField
          label="Mô tả"
          name="description"
          placeholder="Nhập mô tả sách"
          type="textarea"
          register={register}
          required={true}
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">Vui lòng nhập mô tả sách</p>}

        {/* Reusable Select Field for Category */}
        <SelectField
          label="Thể loại"
          name="category"
          options={[
            { value: '', label: 'Chọn thể loại' },
            { value: 'business', label: 'Kinh doanh' },
            { value: 'technology', label: 'Công nghệ' },
            { value: 'fiction', label: 'Tiểu thuyết' },
            { value: 'horror', label: 'Kinh dị' },
            { value: 'adventure', label: 'Phiêu lưu' },
            // Add more options as needed
          ]}
          register={register}
          required={true}
        />
        {errors.category && <p className="text-red-500 text-xs mt-1">Vui lòng chọn thể loại</p>}

        {/* Trending Checkbox */}
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register('trending')}
              className="rounded text-blue-600 focus:ring focus:ring-offset-2 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-semibold text-gray-700">Xu hướng</span>
          </label>
        </div>

        {/* Price Fields */}
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Giá gốc"
            name="oldPrice"
            type="number"
            placeholder="Nhập giá gốc"
            register={register}
            required={true}
          />
          <InputField
            label="Giá mới"
            name="newPrice"
            type="number"
            placeholder="Nhập giá mới"
            register={register}
            required={true}
          />
        </div>
        {errors.oldPrice && <p className="text-red-500 text-xs mt-1">Vui lòng nhập giá gốc</p>}
        {errors.newPrice && <p className="text-red-500 text-xs mt-1">Vui lòng nhập giá mới</p>}

        {/* Author Field */}
        <InputField
          label="Tác giả"
          name="author"
          placeholder="Nhập tên tác giả"
          register={register}
          required={true}
        />
        {errors.author && <p className="text-red-500 text-xs mt-1">Vui lòng nhập tên tác giả</p>}

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ảnh bìa sách
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Đang thêm...' : 'Thêm sách'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddBook