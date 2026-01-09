<script setup lang="ts">
import { ref } from "vue";
import Configurator from "./components/Configurator.vue";

const isLoggedIn = ref(false);
const traderName = ref("贸易商A");
const language = ref("zh-CN");

function onToggleLogin() {
  isLoggedIn.value = !isLoggedIn.value;
}
</script>

<template>
  <div class="container">
    <div class="card header">
      <div class="row" style="justify-content: space-between;">
        <div class="row" style="align-items: center; gap: 12px;">
          <img class="logo" src="/logo.png" alt="Logo" />
          <div>
            <div class="h1">轮椅配置器 Demo</div>
          </div>
        </div>
        <div class="row" style="align-items: center;">
          <select class="select compact" v-model="language">
            <option value="zh-CN">中文</option>
            <option value="en-US">English</option>
          </select>
          <button class="btn secondary" @click="onToggleLogin">
            {{ isLoggedIn ? `已登录：${traderName}` : "登录" }}
          </button>
        </div>
      </div>
    </div>

    <div style="height: 14px;"></div>

    <Configurator :is-logged-in="isLoggedIn" />
  </div>
</template>
