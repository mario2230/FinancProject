<template>
  <ion-page>
    <FinanceHeader title="Perfil" />
    <ion-content class="ion-padding">
      <ion-spinner v-if="loading" name="crescent" />
      <ion-note v-if="errorMessage" color="danger" class="feedback">
        {{ errorMessage }}
      </ion-note>

      <ion-card v-if="!loading && user">
        <ion-card-header>
          <ion-card-title>Minha conta</ion-card-title>
          <ion-card-subtitle>Informações básicas do usuário</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-label>
              <ion-text color="medium">E-mail</ion-text>
              <ion-note>{{ user.email }}</ion-note>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <ion-text color="medium">Conta criada em</ion-text>
              <ion-note>{{ formattedCreatedAt }}</ion-note>
            </ion-label>
          </ion-item>
          <ion-button expand="block" color="danger" class="ion-margin-top" :disabled="loggingOut" @click="logout">
            <ion-spinner v-if="loggingOut" name="crescent" />
            <ion-text v-else>Sair da conta</ion-text>
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
  onIonViewWillEnter,
} from '@ionic/vue';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'vue-router';

import FinanceHeader from '@/components/FinanceHeader.vue';
import { useAuth } from '@/service/userAuth';

const { getUser, deslogarUser } = useAuth();
const user = ref<User | null>(null);
const loading = ref(true);
const loggingOut = ref(false);
const errorMessage = ref('');
const router = useRouter();

const formattedCreatedAt = computed(() => {
  if (!user.value?.created_at) return 'Não disponível';
  return new Date(user.value.created_at).toLocaleDateString('pt-BR');
});

async function loadProfile() {
  loading.value = true;
  errorMessage.value = '';

  try {
    user.value = await getUser();
    if (!user.value) {
      await router.replace('/login');
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível carregar os dados da conta.';
  } finally {
    loading.value = false;
  }
}

onIonViewWillEnter(loadProfile);

async function logout() {
  errorMessage.value = '';
  loggingOut.value = true;
  try {
    await deslogarUser();
    await router.replace('/login');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível encerrar a sessão.';
  } finally {
    loggingOut.value = false;
  }
}
</script>

<style scoped>
.feedback {
  display: block;
  margin: 1rem 0;
}
</style>
