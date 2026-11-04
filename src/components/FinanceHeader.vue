<template>
  <ion-header>
    <ion-toolbar color="primary">
      <ion-title>FinControl · {{ title }}</ion-title>
    </ion-toolbar>
    <ion-toolbar class="navigation-toolbar">
      <ion-buttons class="navigation-buttons">
        <ion-button
          v-for="item in navigation"
          :key="item.path"
          :fill="route.path === item.path ? 'solid' : 'clear'"
          :color="route.path === item.path ? 'primary' : 'medium'"
          @click="navigate(item.path)"
        >
          {{ item.label }}
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router';

defineProps<{ title: string }>();

const route = useRoute();
const router = useRouter();

const navigation = [
  { label: 'Visão geral', path: '/dashboard' },
  { label: 'Receitas', path: '/receitas' },
  { label: 'Despesas', path: '/despesas' },
  { label: 'Perfil', path: '/perfil' },
];

function navigate(path: string) {
  void router.push(path);
}
</script>

<style scoped>
.navigation-toolbar {
  overflow-x: auto;
}

.navigation-buttons {
  flex-wrap: nowrap;
  width: max-content;
}
</style>
