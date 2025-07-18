<script lang="ts">
import { ref, defineComponent, watch, onMounted } from 'vue'
import IconButton from '@/basics/IconButton.vue'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  components: {
    IconButton,
  },
  props: {
    i_id: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const isLiked = ref(false)
    const isFetching = ref(true)
    const responseData = ref<number[]>([])
    const likeNum = ref('')
    const likeId = ref('')
    const userStore = useUserStore()

    // Piniaから ユニークなid を取得
    likeNum.value = userStore.id ?? '0'

    const fetchLatestLikeStatus = async () => {
      try {
        const url = `https://yellowokapi2.sakura.ne.jp/Vue/api/favoriteGetAPI.php/${likeNum.value}`
        console.log(`リクエストURL (fetchLatestLikeStatus): ${url}`)

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: props.i_id }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const responseJson = await response.json()
        console.log('APIレスポンス (favoriteGetAPI):', responseJson)

        responseData.value = Array.isArray(responseJson.i_id)
          ? responseJson.i_id.map(Number) // 数値配列に変換
          : []

        // 型を合わせたうえで includes 判定
        isLiked.value = responseData.value.includes(Number(props.i_id))
        console.log('最新のいいね状態 (isLiked):', isLiked.value)
      } catch (error) {
        console.error('Error fetching latest like status:', error)
      }
    }

    let isProcessing = false

    const toggleLike = async () => {
      if (isProcessing) return
      isProcessing = true

      try {
        await fetchLatestLikeStatus()
        console.log('Before toggle, isLiked:', isLiked.value)

        const actionValue = isLiked.value ? 'delete' : 'insert'
        console.log(`トグル処理: ${actionValue}`)

        const likeurl = `https://yellowokapi2.sakura.ne.jp/Vue/api/favoriteToggleAPI.php/${likeId.value}/${actionValue}`
        console.log(`リクエストURL (fetchLatestToggleStatus): ${likeurl}`)

        const response = await fetch(likeurl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: props.i_id }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const responseJson = await response.json()
        if (responseJson.success) {
          await fetchLatestLikeStatus()
          console.log('成功:', responseJson.success)
        } else {
          console.error('エラー: ' + JSON.stringify(responseJson))
        }
      } catch (error) {
        console.error('Error posting data:', error)
      } finally {
        isProcessing = false
      }
    }

    watch(
      () => props.i_id,
      async newVal => {
        if (typeof newVal === 'number' && newVal > 0 && likeNum.value !== '') {
          likeId.value = `${newVal}/${likeNum.value}`
          await fetchLatestLikeStatus()
        }
      },
      { immediate: true },
    )

    onMounted(async () => {
      if (props.i_id > 0 && likeNum.value !== '') {
        likeId.value = `${props.i_id}/${likeNum.value}`
        await fetchLatestLikeStatus()
        isFetching.value = false
      }
    })

    return { isLiked, toggleLike, responseData }
  },
})
</script>

<template>
  <head>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
    />
  </head>
  <div class="liked-container">
    <!-- 検索アイコン -->
    <IconButton
      :label="isLiked ? 'いいね済み' : 'いいね'"
      :iconClass="isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"
      :color="isLiked ? 'white' : 'red'"
      :backgroundColor="isLiked ? '#e5348c' : '#1e1e1e'"
      textColor="white"
      @click="toggleLike"
    />
  </div>
</template>

<style scoped>
button {
  width: 120px; /* 任意の横幅を設定 */
}
</style>
