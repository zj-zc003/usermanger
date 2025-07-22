<template>
  <div class="video-player">
    <video controls width="100%">
      <source :src="src" type="video/mp4">
      您的浏览器不支持视频播放
    </video>
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
