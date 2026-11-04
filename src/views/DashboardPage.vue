<template>
  <ion-page>
    <FinanceHeader title="Visão geral" />
    <ion-content class="ion-padding">
      <ion-spinner v-if="loading" name="crescent" />

      <ion-note v-if="errorMessage" color="danger" class="feedback">
        {{ errorMessage }}
      </ion-note>

      <template v-if="!loading && !errorMessage">
        <ion-grid>
          <ion-row>
            <ion-col size="12" size-sm="6" size-lg="4">
              <SummaryCard
                title="Total de receitas"
                :value="summary.totalIncome"
                :icon="trendingUpOutline"
                color="success"
              />
            </ion-col>
            <ion-col size="12" size-sm="6" size-lg="4">
              <SummaryCard
                title="Total de despesas"
                :value="summary.totalExpense"
                :icon="trendingDownOutline"
                color="danger"
              />
            </ion-col>
            <ion-col size="12" size-sm="6" size-lg="4">
              <SummaryCard title="Saldo atual" :value="summary.balance" :icon="walletOutline" color="primary" />
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="12" size-lg="6">
              <ExpenseChart :categories="categories" />
            </ion-col>
            <ion-col size="12" size-lg="6">
              <MonthlyChart :months="months" />
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="12" size-sm="6" size-lg="4">
              <ion-card>
                <ion-card-content>
                  <ion-text color="medium">Maior categoria de gasto</ion-text>
                  <ion-text class="indicator-value">
                    {{ largestCategory?.categoria ?? 'Sem despesas registradas' }}
                  </ion-text>
                  <ion-text v-if="largestCategory" color="medium">
                    {{ formatCurrency(largestCategory.valor) }}
                  </ion-text>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="12" size-sm="6" size-lg="4">
              <ion-card>
                <ion-card-content>
                  <ion-text color="medium">Quantidade de lançamentos</ion-text>
                  <ion-text class="indicator-value">{{ summary.transactionCount }}</ion-text>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="12" size-sm="6" size-lg="4">
              <ion-card>
                <ion-card-content>
                  <ion-text color="medium">Despesas sobre receitas</ion-text>
                  <ion-text class="indicator-value">
                    {{ summary.expensePercentage.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) }}%
                  </ion-text>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import {
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonNote,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
  onIonViewDidEnter,
  onIonViewWillEnter,
} from '@ionic/vue';
import { trendingDownOutline, trendingUpOutline, walletOutline } from 'ionicons/icons';

import ExpenseChart from '@/components/ExpenseChart.vue';
import FinanceHeader from '@/components/FinanceHeader.vue';
import MonthlyChart from '@/components/MonthlyChart.vue';
import SummaryCard from '@/components/SummaryCard.vue';
import { getExpensesByCategory, getFinancialSummary, getMonthlyComparison } from '@/service/dashboardService';

interface ExpenseCategory {
  categoria: string;
  valor: number;
}

interface MonthlyComparison {
  mes: string;
  receitas: number;
  despesas: number;
}

const loading = ref(true);
const errorMessage = ref('');
const chartsReady = ref(false);
const pageEntered = ref(false);
const summary = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  transactionCount: 0,
  expensePercentage: 0,
});
const categories = ref<ExpenseCategory[]>([]);
const months = ref<MonthlyComparison[]>([]);

const largestCategory = computed(() =>
  categories.value.reduce<ExpenseCategory | null>(
    (largest, category) => (!largest || category.valor > largest.valor ? category : largest),
    null,
  ),
);

function formatCurrency(value: number) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function showChartsAfterLayout() {
  await nextTick();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  if (pageEntered.value && !loading.value) {
    chartsReady.value = true;
  }
}

async function loadDashboard() {
  loading.value = true;
  errorMessage.value = '';
  chartsReady.value = false;

  try {
    const [financialSummary, expenseCategories, monthlyComparison] = await Promise.all([
      getFinancialSummary(),
      getExpensesByCategory(),
      getMonthlyComparison(),
    ]);

    summary.value = financialSummary;
    categories.value = expenseCategories;
    months.value = monthlyComparison;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível carregar o dashboard.';
  } finally {
    loading.value = false;
    await showChartsAfterLayout();
  }
}

onIonViewWillEnter(() => {
  pageEntered.value = false;
  void loadDashboard();
});

onIonViewDidEnter(() => {
  pageEntered.value = true;
  void showChartsAfterLayout();
});
</script>

<style scoped>
.feedback {
  display: block;
  margin: 1rem 0;
}

.indicator-value {
  display: block;
  margin-top: 0.75rem;
  font-size: 1.35rem;
  font-weight: 700;
}
</style>
