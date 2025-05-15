# Ứng dụng Bookstore

Kho chứa bao gồm hai phần: **backend** và **frontend** của ứng dụng Bookstore.

## Cấu trúc thư mục

```
root/
├── backend/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── ...
└── README.md
```

## Cài đặt & Chạy

### 1. Backend

1. Vào thư mục backend:

   cd backend

2. Cài đặt thư viện:

   npm install

3. Chạy server ở chế độ phát triển:

   npm run start:dev

> PS D:\node\Bookstore\backend> npm run start:dev

> book-store-backend@1.0.0 start:dev
> nodemon index.js

[nodemon] 3.1.7
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): _._
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node index.js`
Example app listening on port 5000
Mongodb connect successfully!

### 3. Frontend

1. Mở terminal mới, vào thư mục frontend:

   cd frontend

2. Cài đặt thư viện:

   npm install

3. Chạy ứng dụng:

   npm run dev

> Frontend sẽ chạy tại `http://localhost:5173`.

## Lưu ý

- Truy cập web trực tiếp tại: https://bookstore-iota-two.vercel.app/
- Tài khoản admin: admin, Mật khẩu: 123456
- Nếu thay đổi file `.env` hoặc `.env.local`, hãy khởi động lại server tương ứng.
- Đảm bảo MongoDB đã chạy và port không bị trùng lặp.
