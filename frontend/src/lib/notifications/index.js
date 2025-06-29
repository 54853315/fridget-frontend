import { writable } from 'svelte/store';

export const notificationStore = writable({
  message: '',
  type: 'info',
  timeout: 3000
});

export function showNotification(message, type = 'info', timeout = 3000) {
  notificationStore.set({ message, type, timeout });
}