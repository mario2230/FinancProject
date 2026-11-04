<template>
  <ion-page>
    <ion-content class="ion-padding auth-content">
      <ion-grid class="auth-grid">
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="7" size-lg="5">
            <ion-card>
              <ion-card-header>
                <ion-card-title>FinControl</ion-card-title>
                <ion-card-subtitle>Acesse sua conta</ion-card-subtitle>
              </ion-card-header>

              <ion-card-content>
                <ion-item>
                  <ion-input
                    v-model="email"
                    type="email"
                    label="E-mail"
                    label-placement="stacked"
                    autocomplete="email"
                    inputmode="email"
                  />
                </ion-item>
                <ion-item>
                  <ion-input
                    v-model="password"
                    type="password"
                    label="Senha"
                    label-placement="stacked"
                    autocomplete="current-password"
                  />
                </ion-item>

                <ion-note v-if="errorMessage" color="danger" class="feedback">
                  {{ errorMessage }}
                </ion-note>
                <ion-note v-if="successMessage" color="success" class="feedback">
                  {{ successMessage }}
                </ion-note>

                <ion-button expand="block" class="ion-margin-top" :disabled="loading" @click="submitLogin">
                  <ion-spinner v-if="loading" name="crescent" />
                  <ion-text v-else>Entrar</ion-text>
                </ion-button>
                <ion-button expand="block" fill="clear" router-link="/register"> Criar uma conta </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonItem,
  IonInput,
  IonNote,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
} from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuth } from '@/service/userAuth';

const { signInWithEmail } = useAuth();
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const route = useRoute();
const router = useRouter();

if (route.query.registered === '1') {
  successMessage.value =
    route.query.emailConfirmation === '1'
      ? 'Cadastro criado no Supabase Authentication. Confirme seu e-mail antes de entrar; perfis em tabelas públicas exigem configuração separada.'
      : 'Cadastro realizado. Entre para acessar sua conta.';
}

async function submitLogin() {
  errorMessage.value = '';
  successMessage.value = '';

  const normalizedEmail = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errorMessage.value = 'Informe um e-mail válido.';
    return;
  }

  if (!password.value) {
    errorMessage.value = 'Informe sua senha.';
    return;
  }

  loading.value = true;
  try {
    await signInWithEmail(normalizedEmail, password.value);
    await router.push('/dashboard');
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message.toLowerCase().includes('invalid login credentials')) {
      errorMessage.value =
        'E-mail ou senha incorretos. Se acabou de criar a conta, confirme seu e-mail antes de entrar.';
    } else {
      errorMessage.value = message || 'Não foi possível entrar. Tente novamente.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-grid {
  min-height: 100%;
}

.feedback {
  display: block;
  margin: 1rem 0 0;
}
</style>
