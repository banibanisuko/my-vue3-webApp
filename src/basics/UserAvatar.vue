<template>
  <img class="user-avatar" src="../assets/images/innu.jpg" alt="User Icon" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'UserAvatar',
})
</script>

<style scoped>
.user-avatar {
  position: fixed;
  top: 25px;
  right: 88px;
  width: 35px;
  height: 35px;
  object-fit: cover;
  border-radius: 50%;
  z-index: 995;
}

@media (max-width: 768px) {
  .user-avatar {
    right: 77px;
  }
}
</style>
