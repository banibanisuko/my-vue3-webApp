// types.ts

// コメント型
export type Comment = {
  comment_id: number
  user_id: number
  comment_body: string
  profile_photo: string
  profile_name: string
  deleted_at: string
}

// 投稿基本情報
export interface PostResponse {
  illust_id: number
  illust_title: string
  illust_body: string
  thumbnail_url: string
  illust_R18: number
  profile_name: string
  profile_photo: string
  profile_login_id: string
}

// コメントレスポンス
export interface CommentResponse {
  success: boolean
  comment: Comment[]
}

// プロフィール情報
export interface ProfileResponse {
  profile_id: number
  profile_name: string
  profile_body: string
  profile_photo: string
  profile_certificate18: number
  profile_birthDate: string
}

// 投稿ギャラリー用の画像型
export type Image = {
  image_id: number
  image_url: string
  sort_order: number
}

// PostGallery（PostResponse を拡張）
export interface PostGallery extends PostResponse {
  tags: number[]
  images: Image[]
  prev_id: number
  next_id: number
}

// お気に入り
export interface Favorite extends PostResponse {
  profile_id: number
  public: number
  showProfile: boolean
}
