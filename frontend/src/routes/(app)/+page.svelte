<script lang="ts">
  import ImageList, { Item, ImageAspectContainer, Image, Supporting, Label } from "@smui/image-list";
  import CircularProgress from "@smui/circular-progress";
  import { Input } from "@smui/textfield";
  import Paper from "@smui/paper";
  import Fab from "@smui/fab";
  import { Icon } from "@smui/common";
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label as ButtonLabel } from "@smui/button";
  import List, { Item as ListItem, Text, PrimaryText, SecondaryText } from "@smui/list";
  import { RecipeApi } from "../../lib/api/index.js";
  import { onMount } from "svelte";

  let value = $state("");
  let recipes = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let dialogOpen = $state(false);
  let selectedRecipe = $state(null);

  // 加载推荐食谱
  async function loadRecommendedRecipes() {
    try {
      loading = true;
      error = null;
      const data = await RecipeApi.getRecommendedRecipes();
      recipes = data || [];
    } catch (err) {
      console.error("加载推荐食谱超时:", err);
      error = "食谱努力正在生成中...（预计 30 秒）";
      recipes = [];
      if (typeof window !== "undefined") {
        setTimeout(() => {
          loadRecommendedRecipes();
        }, 30000);
      }
    } finally {
      loading = false;
    }
  }

  function doSearch() {
    if (value.trim()) {
      // TODO: 实现搜索功能
      alert("搜索功能开发中 ");
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      doSearch();
    }
  }

  function openRecipeDialog(recipe) {
    selectedRecipe = recipe;
    dialogOpen = true;
  }

  function closeRecipeDialog() {
    dialogOpen = false;
    selectedRecipe = null;
  }

  // 组件挂载时加载数据
  onMount(() => {
    loadRecommendedRecipes();
  });
</script>

<h1 style="text-align: center;">你今天想在做什么菜呢？</h1>

<div class="search-container search-container">
  <Paper class="search-paper" elevation={6}>
    <Icon class="material-icons">search</Icon>
    <Input bind:value onkeydown={handleKeyDown} placeholder="搜索菜谱..." class="search-input" />
  </Paper>
  <Fab onclick={doSearch} disabled={value === ""} color="primary" mini class="search-fab">
    <Icon class="material-icons">arrow_forward</Icon>
  </Fab>
</div>

{#if loading}
  <div class="loading-container">
    <CircularProgress class="loading-spinner" indeterminate />
    <span class="loading-text">正在加载推荐食谱...（预计 1 分钟）</span>
  </div>
{:else if error}
  <div style="display: flex; flex-direction: column; align-items: center; margin-top: 40px; padding: 20px;">
    <Icon class="material-icons" style="font-size: 48px; color: var(--mdc-theme-error); margin-bottom: 12px;">error_outline</Icon>
    <p style="color: var(--mdc-theme-error); text-align: center; margin-bottom: 16px;">{error}</p>
    <Button
      style="padding: 8px 16px; background: var(--mdc-theme-primary); color: white; border: none; border-radius: 4px; cursor: pointer;"
      on:click={loadRecommendedRecipes}
    >
      重新加载
    </Button>
  </div>
{:else if recipes.length === 0}
  <div style="display: flex; flex-direction: column; align-items: center; margin-top: 40px; padding: 20px;">
    <Icon class="material-icons" style="font-size: 48px; color: var(--mdc-theme-text-secondary-on-background); margin-bottom: 12px;">restaurant</Icon>
    <p style="color: var(--mdc-theme-text-secondary-on-background); text-align: center;">暂无推荐食谱，请稍后再试</p>
  </div>
{:else}
  <ImageList class="my-image-list-standard">
    {#each recipes as recipe, i (recipe.id || i)}
      <Item style="padding: 30px 10px; cursor: pointer;" onclick={() => openRecipeDialog(recipe)}>
        <ImageAspectContainer>
          <Image
            src={recipe.imageUrl || `images/${(i % 12) + 1}.webp`}
            alt={recipe.name || `食谱 ${i + 1}`}
            style="border-radius: 15px;"
            on:error={e => {
              // 图片加载失败时使用默认图片
              e.target.src = `images/${(i % 12) + 1}.webp`;
            }}
          />
        </ImageAspectContainer>
        <Supporting>
          <Label style="font-size:18px;font-weight: 500;">
            {recipe.name || `美味食谱 ${i + 1}`}
          </Label>
          <br />
          {#if recipe.nutrition}
            <div class="nutrition-info">
              <span class="calories">{recipe.nutrition.calories} 卡路里</span>
              {#if recipe.spiceLevel}
                <span class="spice-level">
                  {"🌶️".repeat(Math.min(recipe.spiceLevel, 3))}
                </span>
              {/if}
            </div>
          {/if}
        </Supporting>
        <div class="food-description">
          <span>
            {recipe.description || "这是一道美味可口的佳肴，制作简单，营养丰富。"}
          </span>
          {#if recipe.ingredients && recipe.ingredients.length > 0}
            <div class="ingredients-preview">
              <small
                >主要食材: {recipe.ingredients
                  .slice(0, 3)
                  .map(ing => ing.name)
                  .join("、")}</small
              >
            </div>
          {/if}
        </div>
      </Item>
    {/each}
  </ImageList>
{/if}

<!-- 食谱详情弹窗 -->
<Dialog
  bind:open={dialogOpen}
  aria-labelledby="recipe-dialog-title"
  aria-describedby="recipe-dialog-content"
  surface$style="min-width: 900px; max-height: 90vh; border-radius: 16px;"
>
  {#if selectedRecipe}
    <Title id="recipe-dialog-title" class="dialog-header">
      <span class="dialog-title-text">{selectedRecipe.name}</span>
      <button class="dialog-close-btn" type="button" on:click={closeRecipeDialog} aria-label="关闭"> × </button>
    </Title>

    <Content id="recipe-dialog-content" style="padding: 16px 24px 24px; max-height: 70vh; overflow-y: auto;">
      <!-- 食谱图片 -->
      <div style="margin-bottom: 20px;">
        <img
          src={selectedRecipe.imageUrl || `images/${Math.floor(Math.random() * 12) + 1}.webp`}
          alt={selectedRecipe.name}
          style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 12px;"
        />
      </div>

      <!-- 基本信息 -->
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 8px 0; color: var(--mdc-theme-primary);">食谱描述</h3>
        <p style="margin: 0; line-height: 1.6; color: var(--mdc-theme-text-primary-on-background);">
          {selectedRecipe.description || "这是一道美味可口的佳肴，制作简单，营养丰富。"}
        </p>
      </div>

      <!-- 营养信息 -->
      {#if selectedRecipe.nutrition}
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; color: var(--mdc-theme-primary);">营养信息</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
            <div style="background-color: var(--mdc-theme-secondary, #333); padding: 12px; border-radius: 8px; text-align: center;">
              <div style="font-weight: 600; color: var(--mdc-theme-primary);">{selectedRecipe.nutrition.calories}</div>
              <div style="font-size: 12px; color: var(--mdc-theme-on-secondary, #fff);">卡路里</div>
            </div>
            <div style="background-color: var(--mdc-theme-secondary, #333); padding: 12px; border-radius: 8px; text-align: center;">
              <div style="font-weight: 600; color: var(--mdc-theme-primary);">{selectedRecipe.nutrition.protein}</div>
              <div style="font-size: 12px; color: var(--mdc-theme-on-secondary, #fff);">蛋白质</div>
            </div>
            <div style="background-color: var(--mdc-theme-secondary, #333); padding: 12px; border-radius: 8px; text-align: center;">
              <div style="font-weight: 600; color: var(--mdc-theme-primary);">{selectedRecipe.nutrition.carbs}</div>
              <div style="font-size: 12px; color: var(--mdc-theme-on-secondary, #fff);">碳水化合物</div>
            </div>
            <div style="background-color: var(--mdc-theme-secondary, #333); padding: 12px; border-radius: 8px; text-align: center;">
              <div style="font-weight: 600; color: var(--mdc-theme-primary);">{selectedRecipe.nutrition.fat}</div>
              <div style="font-size: 12px; color: var(--mdc-theme-on-secondary, #fff);">脂肪</div>
            </div>
          </div>
          {#if selectedRecipe.spiceLevel}
            <div style="margin-top: 12px; text-align: center;">
              <span style="font-size: 14px; color: var(--mdc-theme-text-primary-on-background);">辣度等级: </span>
              <span style="font-size: 16px;">{"🌶️".repeat(Math.min(selectedRecipe.spiceLevel, 5))}</span>
            </div>
          {/if}
        </div>
      {/if}

      <!-- 食材列表 -->
      {#if selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0}
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; color: var(--mdc-theme-primary);">所需食材</h3>
          <div style="display: grid; gap: 8px;">
            {#each selectedRecipe.ingredients as ingredient}
              <div
                style="display: flex; justify-content: space-between; align-items: center; background: var(--mdc-theme-surface); border-radius: 8px; border: 1px solid var(--mdc-theme-text-hint-on-background);"
              >
                <span style="color: var(--mdc-theme-text-primary-on-background);">{ingredient.name}</span>
                <span style="color: var(--mdc-theme-primary); font-weight: 500;">{ingredient.quantity}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- 制作步骤 -->
      {#if selectedRecipe.steps && selectedRecipe.steps.length > 0}
        <div class="recipe-steps">
          <h3 style="margin: 0 0 12px 0; color: var(--mdc-theme-primary);">制作步骤</h3>
          <List threeLine nonInteractive>
            {#each selectedRecipe.steps as step, index}
              <ListItem>
                <Text>
                  <PrimaryText>步骤 {index + 1}</PrimaryText>
                  <SecondaryText>{step}</SecondaryText>
                </Text>
              </ListItem>
            {/each}
          </List>
        </div>
      {/if}
    </Content>
  {/if}
</Dialog>

<style>
  .food-description {
    line-height: 20px;
    font-size: 12px;
    color: var(--mdc-theme-text-primary-on-background, rgb(163, 163, 163));
  }

  .nutrition-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    margin-bottom: 8px;
  }

  /* 在小屏幕设备上隐藏营养信息，避免食谱名称换行 */
  @media (max-width: 900px) {
    .nutrition-info {
      display: none;
    }
  }

  .loading-container {
    display: flex;
    justify-content: center;
    margin-top: 40px;
  }

  .loading-spinner {
    height: 32px;
    width: 32px;
  }

  .loading-text {
    margin-left: 12px;
    color: var(--mdc-theme-text-secondary-on-background);
  }

  .calories {
    font-size: 11px;
    /* color: var(--mdc-theme-primary, #6200ea); */
    color: var(--mdc-theme-primary, rgb(117, 117, 117));
    font-weight: 500;
    background: var(--mdc-theme-text-secondary-on-background, #6200ea);
    background: rgba(98, 0, 234, 0.1);
    padding: 2px 6px;
    border-radius: 8px;
  }

  .spice-level {
    font-size: 12px;
    line-height: 1;
  }

  .ingredients-preview {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.1));
  }

  .ingredients-preview small {
    color: var(--mdc-theme-text-secondary-on-background, rgb(117, 117, 117));
    font-size: 10px;
    line-height: 1.2;
  }

  .search-container {
    border: 1px solid var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.1));
    display: flex;
    justify-content: center;
    align-items: center;
  }
  * :global(.search-paper) {
    display: flex;
    align-items: center;
    flex-grow: 1;
    max-width: 600px;
    margin: 0 12px;
    padding: 0 12px;
    height: 48px;
  }
  * :global(.search-paper > *) {
    display: inline-block;
    margin: 0 12px;
  }
  * :global(.search-input) {
    flex-grow: 1;
    color: var(--mdc-theme-on-surface, #fff);
  }
  * :global(.search-input::placeholder) {
    color: var(--mdc-theme-on-surface, #fff);
    opacity: 0.6;
  }
  * :global(.search-fab) {
    flex-shrink: 0;
  }
  @media screen and (prefers-color-scheme: dark) {
    .recipe-steps :global(.mdc-deprecated-list-item) {
      padding: 0 !important;
      padding-left: 0px !important;
      margin-left: 0 !important;
    }
    .recipe-steps :global(.mdc-deprecated-list-item .mdc-deprecated-list-item__ripple) {
      padding-left: 0 !important;
    }
    .recipe-steps :global(.mdc-deprecated-list-item .mdc-deprecated-list-item__text) {
      padding-left: 0 !important;
    }
  }

  .dialog-header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 48px 0 24px;
  }

  .dialog-title-text {
    font-size: 24px;
    font-weight: 600;
    text-align: center;
  }

  .dialog-close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: var(--mdc-theme-on-surface, #fff);
    font-size: 20px;
    cursor: pointer;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dialog-close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }
</style>
