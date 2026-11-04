<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title> Movimentação mensal </ion-card-title>
    </ion-card-header>

    <ion-card-content>
      <ion-grid class="chart-container">
        <ion-row>
          <ion-col>
            <apexchart
              v-if="months.length > 0"
              type="bar"
              height="300"
              width="100%"
              :options="chartOptions"
              :series="series"
            />

            <ion-text v-else color="medium">
              <ion-label> Nenhuma movimentação registrada. </ion-label>
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

interface MonthlyData {
  mes: string;
  receitas: number;
  despesas: number;
}

const props = defineProps<{
  months: MonthlyData[];
}>();

const months = computed(() => props.months);

const series = computed(() => [
  {
    name: 'Receitas',
    data: months.value.map((item) => Number(item.receitas)),
  },
  {
    name: 'Despesas',
    data: months.value.map((item) => Number(item.despesas)),
  },
]);

const chartOptions = computed(() => ({
  chart: {
    width: '100%',
    redrawOnParentResize: true,
    redrawOnWindowResize: true,
    toolbar: {
      show: false,
    },
  },

  xaxis: {
    categories: months.value.map((item) => {
      const [year, month] = item.mes.split('-');
      return `${month}/${year}`;
    }),
  },

  yaxis: {
    labels: {
      formatter: (value: number) => `R$ ${value.toFixed(0)}`,
    },
  },

  legend: {
    position: 'bottom',
  },

  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '50%',
    },
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
