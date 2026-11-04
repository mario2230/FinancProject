<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title> Despesas por categoria </ion-card-title>
    </ion-card-header>

    <ion-card-content>
      <ion-grid class="chart-container">
        <ion-row>
          <ion-col>
            <apexchart
              v-if="categories.length > 0"
              type="pie"
              height="300"
              width="100%"
              :options="chartOptions"
              :series="values"
            />

            <ion-text v-else color="medium">
              <ion-label> Nenhuma despesa registrada. </ion-label>
            </ion-text>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/vue';

interface Category {
  categoria: string;
  valor: number;
}

const props = defineProps<{
  categories: Category[];
}>();

const categories = computed(() => props.categories);

const values = computed(() => categories.value.map((item) => Number(item.valor)));

const chartOptions = computed(() => ({
  chart: {
    width: '100%',
    redrawOnParentResize: true,
    redrawOnWindowResize: true,
  },
  labels: categories.value.map((item) => item.categoria),

  legend: {
    position: 'bottom',
  },
}));
</script>

<style scoped>
.chart-container,
.chart-container ion-row,
.chart-container ion-col {
  width: 100%;
  min-width: 0;
  padding: 0;
}
</style>
