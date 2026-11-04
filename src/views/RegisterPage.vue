<template>
  <ion-page>
    <ion-content class="ion-padding auth-content">
      <ion-grid class="auth-grid">
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="7" size-lg="5">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Criar conta</ion-card-title>
                <ion-card-subtitle>Comece a organizar suas finanças</ion-card-subtitle>
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
                    :disabled="loading"
                  />
                </ion-item>
                <ion-item>
                  <ion-input
                    v-model="password"
                    type="password"
                    label="Senha"
                    label-placement="stacked"
                    autocomplete="new-password"
                    :disabled="loading"
                  />
                </ion-item>
                <ion-item>
                  <ion-input
                    v-model="passwordConfirmation"
                    type="password"
                    label="Confirme a senha"
                    label-placement="stacked"
                    autocomplete="new-password"
                    :disabled="loading"
                  />
                </ion-item>

                <ion-note v-if="errorMessage" color="danger" class="feedback">
                  {{ errorMessage }}
                </ion-note>

                <ion-button expand="block" class="ion-margin-top" :disabled="loading" @click="submitRegistration">
                  <ion-spinner v-if="loading" name="crescent" />
                  <ion-text v-else>Cadastrar</ion-text>
                </ion-button>
                <ion-button expand="block" fill="clear" router-link="/login" :disabled="loading">
                  Já tenho uma conta
                </ion-button>
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
  IonInput,
  IonItem,
  IonNote,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
} from '@ionic/vue';
import { useRouter } from 'vue-router';

import { useAuth } from '@/service/userAuth';

const { signUpNewUser, getSession } = useAuth();
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();

async function submitRegistration() {
  errorMessage.value = '';
  const normalizedEmail = email.value.trim();

  if (!normalizedEmail || !password.value || !passwordConfirmation.value) {
    errorMessage.value = 'Preencha todos os campos.';
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errorMessage.value = 'Informe um e-mail válido.';
    return;
  }

  if (password.value.length < 6) {
    errorMessage.value = 'A senha deve ter pelo menos 6 caracteres.';
    return;
  }

  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'As senhas não coincidem.';
    return;
  }

  loading.value = true;
  try {
    await signUpNewUser(normalizedEmail, password.value);
    const session = await getSession();

    if (session) {
      await router.push('/dashboard');
    } else {
      await router.push({
        path: '/login',
        query: { registered: '1', emailConfirmation: '1' },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('rate limit') && normalizedMessage.includes('email')) {
      errorMessage.value =
        'O Supabase atingiu o limite de envio de e-mails. Aguarde antes de tentar novamente ou configure um SMTP próprio em Authentication > SMTP Settings.';
    } else {
      errorMessage.value = message || 'Não foi possível criar a conta. Tente novamente.';
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
