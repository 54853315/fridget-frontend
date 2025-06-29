<script lang="ts">
  import LayoutGrid, { Cell } from "@smui/layout-grid";
  import IconButton from "@smui/icon-button";

  export let items: Array<any> = [];

  function handleCancel(index: number) {
    items = items.filter((_, i) => i !== index);
  }
</script>

<LayoutGrid style="width:100%">
  {#each items as item, i}
    <Cell span={2}>
      <div class="dish-cell">
        <div class="content">
          {item}
        </div>
        <IconButton class="material-icons cancel-button" onclick={() => handleCancel(i)} style="transform: scale(0.7);">cancel</IconButton>
      </div>
    </Cell>
  {/each}
</LayoutGrid>

<style>
  .dish-cell {
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--mdc-theme-secondary, #333);
    color: var(--mdc-theme-on-secondary, #fff);
    position: relative; /* 添加相对定位作为cancel-button的定位上下文 */
  }

  .content {
    width: 100%;
    text-align: center;
  }

  :global(.cancel-button) {
    position: absolute !important;
    top: -15px !important;
    right: -15px !important;
    color: var(--mdc-theme-on-secondary, #fff) !important;
    z-index: 1;
  }

  /* 针对按钮的涟漪效果 */
  :global(.cancel-button .mdc-icon-button__ripple) {
    position: absolute !important;
    top: 6px !important;
    left: 6px !important;
  }
</style>
