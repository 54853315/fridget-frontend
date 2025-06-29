<script lang="ts">
  import Notification from "$lib/notifications/Notification.svelte";
  import { notificationStore } from "$lib/notifications";
  import Button from "@smui/button";
  import IconButton from "@smui/icon-button";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import Tab from "@smui/tab";
  import TabBar from "@smui/tab-bar";

  import Banner, { Label, Icon, CloseReason } from "@smui/banner";
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import Checkbox from "@smui/checkbox";
  import FormField from "@smui/form-field";

  let { children } = $props();
  import "../../theme/theme.scss";
</script>

<Notification
  bind:message={$notificationStore.message}
  bind:type={$notificationStore.type}
  bind:timeout={$notificationStore.timeout}
/>

{@render children()}
