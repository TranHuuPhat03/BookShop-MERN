import React, { useEffect } from 'react'
import InputField from '../addBook/InputField'
import SelectField from '../addBook/SelectField'
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchBookByIdQuery, useUpdateBookMutation } from '../../../redux/features/books/booksApi';
import Loading from '../../../components/Loading';
import Swal from 'sweetalert2';

const UpdateBook = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: bookData, isLoading, isError } = useFetchBookByIdQuery(id);
  const [updateBook] = useUpdateBookMutation();
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (bookData) {
      setValue('title', bookData.title);
      setValue('description', bookData.description);
      setValue('category', bookData?.category);
      setValue('trending', bookData.trending);
      setValue('oldPrice', bookData.oldPrice);
      setValue('newPrice', bookData.newPrice);
      setValue('coverImage', bookData.coverImage)
    }
  }, [bookData, setValue])

  const onSubmit = async (data) => {
    const updateBookData = {
      id,
      title: data.title,
      description: data.description,
      category: data.category,
      trending: data.trending,
      oldPrice: Number(data.oldPrice),
      newPrice: Number(data.newPrice),
      coverImage: data.coverImage || bookData.coverImage,
    };

    try {
      const result = await updateBook(updateBookData).unwrap();
      if (result) {
        Swal.fire({
          title: "Cập Nhật Sách",
          text: "Sách đã được cập nhật thành công!",
          icon: "success",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Đồng ý!"
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/dashboard/manage-books');
          }
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật sách:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể cập nhật sách. Vui lòng thử lại sau.",
        icon: "error",
        confirmButtonText: "Đồng ý"
      });
    }
  }

  if (isLoading) return <Loading />
  if (isError) return <div>Lỗi khi tải dữ liệu sách</div>
  return (
    <div className="max-w-lg mx-auto md:p-6 p-3 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Cập Nhật Sách</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label="Tiêu đề"
          name="title"
          placeholder="Nhập tiêu đề sách"
          register={register}
        />

        <InputField
          label="Mô tả"
          name="description"
          placeholder="Nhập mô tả sách"
          type="textarea"
          register={register}
        />

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
          ]}
          register={register}
        />
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

        <InputField
          label="Giá cũ"
          name="oldPrice"
          type="number"
          placeholder="Giá cũ"
          register={register}
        />

        <InputField
          label="Giá mới"
          name="newPrice"
          type="number"
          placeholder="Giá mới"
          register={register}
        />

        <InputField
          label="URL Ảnh bìa"
          name="coverImage"
          type="text"
          placeholder="URL ảnh bìa sách"
          register={register}
        />

        <button type="submit" className="w-full py-2 bg-blue-500 text-white font-bold rounded-md">
          Cập Nhật Sách
        </button>
      </form>
    </div>
  )
}

export default UpdateBook