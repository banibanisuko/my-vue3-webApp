// stores/user.ts
//ログイン情報保持用store
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core' // ← これが便利！

export const useUserStore = defineStore('user', {
  state: () => ({
    id: useStorage('user_id', ''), // localStorageへ保存
    name: useStorage('user_name', ''), // 同上
    login_id: useStorage('user_login_id', ''),
    admin: useStorage('user_admin', 0), // 同上
    last_checked: useStorage('user_last_checked', ''),
    isLogin: useStorage('user_isLogin', false), //isLigin = *ログインしているときのみtrue*
  }),
  actions: {
    login(
      id: string,
      name: string,
      admin: number,
      login_id: string,
      last_checked: string,
    ) {
      this.id = id
      this.name = name
      this.admin = admin
      this.login_id = login_id
      this.last_checked = last_checked
      this.isLogin = true
    },
    logout() {
      this.id = this.name = this.login_id = this.last_checked = ''
      this.admin = 0
      this.isLogin = false
    },
  },
})
