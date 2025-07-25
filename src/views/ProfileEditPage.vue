<script lang="ts">
import { defineComponent, ref, watch, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import type { PropType } from 'vue'

import TextInput from '@/basics/TextInput.vue'
import RadioInput from '@/basics/RadioInput.vue'
import BirthDate from '@/basics/BirthDate.vue'
import PhotoDragDrop from '@/basics/PhotoDragDrop.vue'

export default defineComponent({
  components: {
    TextInput,
    RadioInput,
    BirthDate,
    PhotoDragDrop,
  },
  props: {
    userName: String,
    certificate18: String,
    profilePhoto: {
      type: Array as PropType<File[]>,
      required: false,
    },
    password: String,
    body: String,
    birthDate: String,
  },
  emits: [
    'submit',
    'update:userName',
    'update:certificate18',
    'update:profilePhoto',
    'update:password',
    'update:body',
    'update:birthDate',
  ],
  setup(props, { emit }) {
    // ローカルの状態を定義（フォーム入力用）
    const localUserName = ref(props.userName ?? '')
    const localPassword = ref(props.password ?? '')
    const localCertificate18 = ref(props.certificate18 ?? '0')
    const localBody = ref(props.body ?? '')
    const localBirthDate = ref(props.birthDate ?? '')
    const localProfilePhoto = ref<File[]>([])

    // 編集前の元の値を保持（変更検知用）
    const originalUserName = ref('')
    const originalPassword = ref('')
    const originalBirthDate = ref('')
    const originalCertificate18 = ref('')
    const originalBody = ref('')

    // 編集モードや変更済みフラグ
    const isEditingUserName = ref(false)
    const isEditedUserName = ref(false)
    const isEditingPassword = ref(false)
    const isEditedPassword = ref(false)
    const isEditingBirthDate = ref(false)
    const isEditedBirthDate = ref(false)
    const isEditingBody = ref(false)
    const isEditedBody = ref(false)
    const isEditingCertificate18 = ref(false)
    const isEditedCertificate18 = ref(true)

    // その他
    const passwordHide = ref(true) // パスワード表示状態の制御
    const errorMessage = ref('') // エラーメッセージ表示用
    const userStore = useUserStore()
    const id = ref(userStore.id)

    // propsの変化を監視してローカル値を更新
    watch(
      () => props.userName,
      val => (localUserName.value = val ?? ''),
    )
    watch(
      () => props.password,
      val => (localPassword.value = val ?? ''),
    )
    watch(
      () => props.certificate18,
      val => (localCertificate18.value = val ?? ''),
    )
    watch(
      () => props.body,
      val => (localBody.value = val ?? ''),
    )
    watch(
      () => props.birthDate,
      val => (localBirthDate.value = val ?? ''),
    )

    // パスワードの表示用文言を算出
    const displayPassword = computed(() => {
      if (
        (isEditingPassword.value &&
          originalPassword.value !== localPassword.value) ||
        isEditedPassword.value
      ) {
        return localPassword.value
      }

      if (
        originalPassword.value != null &&
        originalPassword.value !== '' &&
        originalPassword.value === localPassword.value
      ) {
        return '登録済みのパスワード'
      }

      return 'パスワードはまだありません'
    })

    // 各項目の編集状態を切り替える処理
    const toggleEdit = (field: string) => {
      switch (field) {
        case 'userName':
          if (!isEditingUserName.value)
            originalUserName.value = localUserName.value
          else
            isEditedUserName.value =
              localUserName.value !== originalUserName.value
          isEditingUserName.value = !isEditingUserName.value
          break
        case 'password':
          if (!isEditingPassword.value)
            originalPassword.value = localPassword.value
          else {
            isEditedPassword.value =
              localPassword.value !== originalPassword.value
            if (!isEditingPassword.value) passwordHide.value = true
          }
          isEditingPassword.value = !isEditingPassword.value
          break
        case 'birthDate':
          if (!isEditingBirthDate.value)
            originalBirthDate.value = localBirthDate.value
          else
            isEditedBirthDate.value =
              localBirthDate.value !== originalBirthDate.value
          isEditingBirthDate.value = !isEditingBirthDate.value
          break
        case 'body':
          if (!isEditingBody.value) originalBody.value = localBody.value
          else isEditedBody.value = localBody.value !== originalBody.value
          isEditingBody.value = !isEditingBody.value
          break
        case 'certificate18':
          if (!isEditingCertificate18.value)
            originalCertificate18.value = localCertificate18.value
          else
            isEditedCertificate18.value =
              localCertificate18.value !== originalCertificate18.value
          isEditingCertificate18.value = !isEditingCertificate18.value
          break
      }
    }

    // パスワードの表示/非表示を切り替える処理
    const showPassword = () => {
      passwordHide.value = !passwordHide.value
    }

    // フォームの送信処理
    const handleSubmit = async () => {
      const formData = new FormData()

      // 編集された項目のみ送信する
      const entries = [
        ['userName', isEditedUserName.value, localUserName.value],
        ['password', isEditedPassword.value, localPassword.value],
        [
          'certificate18',
          isEditedCertificate18.value,
          localCertificate18.value,
        ],
        ['body', isEditedBody.value, localBody.value],
        ['birthDate', isEditedBirthDate.value, localBirthDate.value],
      ] as const

      for (const [key, edited, value] of entries) {
        if (edited) formData.append(key, value)
      }

      if (localProfilePhoto.value.length > 0) {
        formData.append('profilePhoto', localProfilePhoto.value[0])
      }

      try {
        const response = await fetch(
          `https://yellowokapi2.sakura.ne.jp/Vue/api/ProfileEditAPI.php/${id.value}`,
          {
            method: 'POST',
            body: formData,
          },
        )

        const contentType = response.headers.get('Content-Type') || ''
        if (!contentType.includes('application/json')) {
          throw new Error('サーバーからJSON形式の返答がありませんでした。')
        }

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || `HTTP ${response.status}`)
        }

        console.log('送信成功:', result)
        alert('データが正常に送信されました')
        emit('submit')
      } catch (error) {
        console.error('更新失敗:', error)
        errorMessage.value = '更新に失敗しました。もう一度お試しください。'
      }
    }

    // 初期データをサーバーから取得
    onMounted(async () => {
      try {
        const response = await fetch(
          `https://yellowokapi2.sakura.ne.jp/Vue/api/ProfileAllCatchAPI.php/${id.value}`,
        )
        const contentType = response.headers.get('Content-Type') || ''
        if (!contentType.includes('application/json'))
          throw new Error('JSONとして受け取れませんでした。')

        const data = await response.json()
        localUserName.value = data.name ?? ''
        localPassword.value = data.password ?? ''
        localBody.value = data.body ?? ''
        localBirthDate.value = data.birthDate ?? ''
        localCertificate18.value = String(data.certificate18 ?? '0')

        // 比較用に取得値を保持
        originalUserName.value = data.name ?? ''
        originalPassword.value = data.password ?? ''
        originalBody.value = data.body ?? ''
        originalBirthDate.value = data.birthDate ?? ''
        originalCertificate18.value = String(data.certificate18 ?? '0')
      } catch (error) {
        console.error('初期データの取得に失敗:', error)
        errorMessage.value = '初期データの取得に失敗しました。'
      }
    })

    return {
      localUserName,
      localPassword,
      localCertificate18,
      localBody,
      localBirthDate,
      localProfilePhoto,
      errorMessage,
      isEditingUserName,
      isEditingPassword,
      isEditingCertificate18,
      isEditingBirthDate,
      isEditingBody,
      passwordHide,
      toggleEdit,
      showPassword,
      handleSubmit,
      displayPassword,
    }
  },
})
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div>
      <label for="image">プロフィール画像:</label>
      <PhotoDragDrop v-model="localProfilePhoto" :maxCount="1" />
    </div>

    <!-- 生年月日 -->
    <div>
      <p>
        【生年月日】<br />
        {{ localBirthDate ? localBirthDate : 'なし' }}
      </p>
      <template v-if="isEditingBirthDate">
        <BirthDate v-model="localBirthDate" />
      </template>
      <button type="button" @click="toggleEdit('birthDate')">
        {{ isEditingBirthDate ? '完了' : '編集' }}
      </button>
    </div>

    <!-- 名前 -->
    <div>
      <br /><label for="userName">【名前】</label>
      <template v-if="isEditingUserName">
        <TextInput
          id="userName"
          class="userName"
          name="userName"
          type="text"
          v-model="localUserName"
        />
      </template>
      <template v-else>
        <br /><span>{{ localUserName }}</span>
      </template>
      <button type="button" @click="toggleEdit('userName')">
        {{ isEditingUserName ? '完了' : '編集' }}
      </button>
    </div>

    <div>
      <br /><label for="body">【プロフィール本文】</label>
      <template v-if="isEditingBody">
        <TextInput
          id="body"
          class="body"
          name="body"
          type="textarea"
          v-model="localBody"
        />
      </template>
      <template v-else>
        <br /><span>{{ localBody }}</span>
      </template>
      <button type="button" @click="toggleEdit('body')">
        {{ isEditingBody ? '完了' : '編集' }}
      </button>
    </div>

    <!-- パスワード -->
    <div>
      <br /><label for="password">【パスワード】</label>

      <!-- 編集中で表示状態：パスワード入力欄 -->
      <template v-if="isEditingPassword">
        <TextInput
          id="password"
          class="password"
          name="password"
          type="password"
          v-model="localPassword"
        />
      </template>

      <!-- 編集中で伏せ字状態：●●●と表示＋表示ボタン -->
      <template v-else-if="passwordHide">
        <br />
        <span>●●●●●●</span>
        <br />
        <button type="button" @click="showPassword">表示</button>
      </template>

      <!-- 編集していない：通常表示 -->
      <template v-else>
        <br />
        <span>{{ displayPassword }}</span>
        <br />
        <button type="button" @click="showPassword">非表示</button>
      </template>

      <button type="button" @click="toggleEdit('password')">
        {{ isEditingPassword ? '完了' : '編集' }}
      </button>
    </div>

    <!-- 年齢制限表示設定 -->
    <br />
    <p>【年齢制限ありの画像を表示する】</p>
    <div class="radio-buttons">
      <span class="radio">
        <RadioInput
          id="show"
          name="certificate18"
          value="1"
          label="表示"
          v-model="localCertificate18"
        />
      </span>
      <span class="radio">
        <RadioInput
          id="hide"
          name="certificate18"
          value="0"
          label="非表示"
          v-model="localCertificate18"
        />
      </span>
    </div>

    <button type="submit">保存する</button>
  </form>
</template>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
li {
  display: flex;
  align-items: center;
  gap: 5px;
}
.birthday-select select {
  appearance: none;
  background-color: white;
  color: black;
  border: 1px solid #aaa;
  border-radius: 6px;
  padding: 6px 12px;
  margin: 0 4px 8px 0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.birthday-select select:focus {
  border-color: black;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
}
.birthday-select {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
