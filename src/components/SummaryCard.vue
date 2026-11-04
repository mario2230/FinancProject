<template>
  <ion-card>
    <ion-card-content>
      <ion-grid>
        <ion-row class="ion-align-items-center">
          <ion-col>
            <ion-text color="medium">
              <ion-label>{{ title }}</ion-label>
            </ion-text>

            <ion-text class="summary-value">
              {{ formattedValue }}
            </ion-text>
          </ion-col>

          <ion-col size="auto">
            <ion-icon :icon="icon" :color="color" size="large" />
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonText, IonLabel, IonIcon } from '@ionic/vue';

interface Props {
  title: string;
  value: number;
  icon: string;
  color: string;
}

const props = defineProps<Props>();

const formattedValue = computed(() => {
  return props.value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
});
</script>

<style scoped>
.summary-value {
  display: block;
  margin-top: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
}
</style>
