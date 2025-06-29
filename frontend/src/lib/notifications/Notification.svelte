<script lang="ts">
  import Snackbar, { Label, Actions } from "@smui/snackbar";
  import IconButton from "@smui/icon-button";
  import { onDestroy } from "svelte";

  export let message = "";
  export let type = "success"; // 'info' | 'success' | 'error | 'warning
  export let timeout = 3000;

  let snackbarSelf: Snackbar;

  let timer;

  $: if (message && snackbarSelf) {
    snackbarSelf.open();
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      snackbarSelf.close();
      message = "";
    }, timeout);
  }

  // 组件销毁时清除定时器
  onDestroy(() => {
    if (timer) clearTimeout(timer);
  });
</script>

<Snackbar class={`notification-${type}`} bind:this={snackbarSelf}>
  <Label>{message}</Label>
  <Actions>
    <IconButton class="material-icons" title="Dismiss">close</IconButton>
  </Actions>
</Snackbar>
