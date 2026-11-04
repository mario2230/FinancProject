<template>
  <ion-item>
    <ion-label>
      <ion-text class="transaction-description">{{ transaction.descricao }}</ion-text>

      <ion-text color="medium">
        <ion-note>{{ transaction.categoria }} · {{ formattedDate }}</ion-note>
      </ion-text>
    </ion-label>

    <ion-note slot="end" :color="type === 'receita' ? 'success' : 'danger'">
      {{ formattedValue }}
    </ion-note>

    <ion-buttons slot="end">
      <ion-button fill="clear" @click="emit('edit', transaction)">
        <ion-icon :icon="pencilOutline" />
      </ion-button>

      <ion-button fill="clear" color="danger" @click="emit('delete', transaction.id)">
        <ion-icon :icon="trashOutline" />
      </ion-button>
    </ion-buttons>
  </ion-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { IonItem, IonLabel, IonText, IonNote, IonButtons, IonButton, IonIcon } from '@ionic/vue';

import { pencilOutline, trashOutline } from 'ionicons/icons';

interface Transaction {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
}

const props = defineProps<{
  transaction: Transaction;
  type: 'receita' | 'despesa';
}>();

const emit = defineEmits<{
  edit: [transaction: Transaction];
  delete: [id: string];
}>();

const formattedValue = computed(() => {
  return Number(props.transaction.valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
});

const formattedDate = computed(() => {
  const date = new Date(`${props.transaction.data}T00:00:00`);

  return Number.isNaN(date.getTime()) ? props.transaction.data : date.toLocaleDateString('pt-BR');
});
</script>

<style scoped>
.transaction-description {
  display: block;
  font-weight: 600;
}
</style>
