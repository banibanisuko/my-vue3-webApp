<script lang="ts">
import { ref, watch, defineComponent } from 'vue'

export default defineComponent({
  //親コンポーネントのカスタム属性ArticleTagsからタグの値を受け取る
  props: {
    tagsMsg: {
      type: Array as () => string[],
      default: () => [],
    },
  },

  setup(props) {
    const tags = ref<string[]>([])

    // props.tagsMsg を監視して tags に反映
    watch(
      () => props.tagsMsg,
      (newTagsMsg: string[]) => {
        if (Array.isArray(newTagsMsg)) {
          tags.value = newTagsMsg
        } else {
          tags.value = []
        }
      },
      { immediate: true },
    )

    return { tags }
  },
})
</script>

<template>
  <div class="tags-container">
    <ul>
      <li v-for="(tag, index) in tags" :key="index">
        <a :href="'/tags/' + tag" target="_blank">#{{ tag }}</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tags-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

ul {
  list-style-type: none;
  padding: 0;
  display: flex;
  gap: 10px;
}

li {
  background-color: #f0f0f0;
  border-radius: 15px;
  padding: 8px 16px;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

li:hover {
  background-color: #d0d0d0;
}

a {
  color: #333;
  text-decoration: none;
}
</style>
