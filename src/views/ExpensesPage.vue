<template>
  <ion-page>
    <FinanceHeader title="Despesas" />
    <ion-content class="ion-padding">
      <ion-toolbar>
        <ion-title size="small">Suas despesas</ion-title>
        <ion-button slot="end" @click="openCreateForm">Adicionar despesa</ion-button>
      </ion-toolbar>

      <ion-spinner v-if="loading" name="crescent" />
      <ion-note v-if="errorMessage" color="danger" class="feedback">
        {{ errorMessage }}
      </ion-note>

      <ion-list v-if="!loading && expenses.length">
        <TransactionItem
          v-for="expense in expensesWithIds"
          :key="expense.id"
          :transaction="expense"
          type="despesa"
          @edit="openEditForm"
          @delete="confirmDelete"
        />
      </ion-list>
      <ion-text v-else-if="!loading" color="medium"> Nenhuma despesa cadastrada. </ion-text>

      <ion-modal :is-open="isFormOpen" @did-dismiss="closeForm">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editingId ? 'Editar despesa' : 'Nova despesa' }}</ion-title>
            <ion-button slot="end" fill="clear" @click="closeForm">Fechar</ion-button>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-input v-model="form.descricao" label="Descrição" label-placement="stacked" :maxlength="100" />
          </ion-item>
          <ion-item>
            <ion-input
              v-model="form.valor"
              type="number"
              min="0"
              step="0.01"
              label="Valor (R$)"
              label-placement="stacked"
            />
          </ion-item>
          <ion-item>
            <ion-select v-model="form.categoria" label="Categoria" label-placement="stacked" interface="popover">
              <ion-select-option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-input v-model="form.data" type="date" label="Data" label-placement="stacked" />
          </ion-item>
          <ion-note v-if="formError" color="danger" class="feedback">{{ formError }}</ion-note>
          <ion-button expand="block" class="ion-margin-top" :disabled="saving" @click="saveExpense">
            <ion-spinner v-if="saving" name="crescent" />
            <ion-text v-else>Salvar despesa</ion-text>
          </ion-button>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import {
  alertController,
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonModal,
  IonNote,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
} from '@ionic/vue';

import FinanceHeader from '@/components/FinanceHeader.vue';
import TransactionItem from '@/components/TransactionItem.vue';
import { createExpense, deleteExpense, getExpenses, updateExpense, type Expense } from '@/service/expenseService';

const categories = ['Alimentação', 'Transporte', 'Moradia', 'Educação', 'Lazer', 'Saúde', 'Outros'];
const expenses = ref<Expense[]>([]);
const loading = ref(true);
const saving = ref(false);
const isFormOpen = ref(false);
const editingId = ref<string | null>(null);
const errorMessage = ref('');
const formError = ref('');
const form = reactive<{ descricao: string; valor: string | number; categoria: string; data: string }>({
  descricao: '',
  valor: '',
  categoria: '',
  data: '',
});

const expensesWithIds = computed(() =>
  expenses.value.filter((expense): expense is Expense & { id: string } => Boolean(expense.id)),
);

function todayAsLocalDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

async function loadExpenses() {
  errorMessage.value = '';
  loading.value = true;
  try {
    expenses.value = await getExpenses();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível carregar as despesas.';
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.descricao = '';
  form.valor = '';
  form.categoria = '';
  form.data = todayAsLocalDate();
  formError.value = '';
}

function openCreateForm() {
  editingId.value = null;
  resetForm();
  isFormOpen.value = true;
}

function openEditForm(expense: Expense & { id: string }) {
  editingId.value = expense.id;
  form.descricao = expense.descricao;
  form.valor = Number(expense.valor);
  form.categoria = expense.categoria;
  form.data = expense.data;
  formError.value = '';
  isFormOpen.value = true;
}

function closeForm() {
  isFormOpen.value = false;
}

async function saveExpense() {
  const amount = Number(form.valor);
  if (!form.descricao.trim() || !Number.isFinite(amount) || amount <= 0 || !form.data) {
    formError.value = 'Preencha a descrição, um valor maior que zero e a data.';
    return;
  }
  if (!categories.includes(form.categoria)) {
    formError.value = 'Selecione uma categoria válida.';
    return;
  }

  saving.value = true;
  formError.value = '';
  try {
    const expense = {
      descricao: form.descricao.trim(),
      valor: amount,
      categoria: form.categoria,
      data: form.data,
    };

    if (editingId.value) {
      await updateExpense(editingId.value, expense);
    } else {
      await createExpense(expense);
    }

    closeForm();
    await loadExpenses();
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Não foi possível salvar a despesa.';
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(id: string) {
  const alert = await alertController.create({
    header: 'Excluir despesa?',
    message: 'Esta ação não pode ser desfeita.',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      { text: 'Excluir', role: 'confirm' },
    ],
  });
  await alert.present();
  const { role } = await alert.onDidDismiss();

  if (role !== 'confirm') return;

  errorMessage.value = '';
  loading.value = true;
  try {
    await deleteExpense(id);
    await loadExpenses();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível excluir a despesa.';
    loading.value = false;
  }
}

onIonViewWillEnter(loadExpenses);
</script>

<style scoped>
.feedback {
  display: block;
  margin: 1rem 0;
}
</style>
