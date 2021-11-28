# social-network
config: Chứa các cấu hình db, authen,..
controllers: Chứa các chức năng, API.
middleware: Các phần mềm trung gian (xác thực, ..).
models: Schema.
routes: Định nghĩa các router, kết hợp controlles.
utils: Các service chức năng được yêu cầu nhiều lần.

### Package
cloudinary: Thư viện quản lý hình ảnh
multer: middleware nodejs xử lý multipart/form-data, upload file
multer-storage-cloudinary: multer storage enegine cho Cloudinary