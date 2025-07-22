<template>
  <div class="audio-player">
    <audio controls style="width: 100%">
      <source :src="src" type="audio/mpeg">
      您的浏览器不支持音频播放
    </audio>
  </div>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      required: true
    }
  }
};
</script>
