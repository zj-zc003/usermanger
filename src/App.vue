<template>
  <div id="app">
    <LoginForm v-if="!authStore.isAuthenticated" />
    <MainLayout v-else />
    <!--<MainLayout />-->
  </div>
</template>

<script setup>
import { useAuthStore } from '@/store/auth'
import LoginForm from '@/components/LoginForm.vue'
//import HomePage from '@/components/HomePage.vue'
import MainLayout from './layout/MainLayout.vue'

const authStore = useAuthStore()
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
    Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
  background-color: #f8fafc;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

button {
  cursor: pointer;
  font-family: inherit;
}
</style>
