<script lang="ts">
  import ImageList, { Item, ImageAspectContainer, Image, Supporting, Label } from "@smui/image-list";
  import CircularProgress from "@smui/circular-progress";
  import { Input } from "@smui/textfield";
  import Paper from "@smui/paper";
  import Fab from "@smui/fab";
  import { Icon } from "@smui/common";
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label as ButtonLabel } from "@smui/button";

  import { RecipeApi } from "../../lib/api/index.js";
  import { onMount } from "svelte";

  let value = $state("");
  let recipes = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let dialogOpen = $state(false);
  let selectedRecipe = $state(null);
  const nutritionMeta = [
    { key: "calories", label: "卡路里", unit: "", accent: "accent-energy", caption: "每日能量" },
    { key: "sugar", label: "糖", unit: "", accent: "accent-sugar", caption: "甜甜的" },
    { key: "protein", label: "蛋白质", unit: "", accent: "accent-protein", caption: "肌肉修复" },
    { key: "carbs", label: "碳水化合物", unit: "", accent: "accent-carbs", caption: "持续供能" },
    { key: "fat", label: "脂肪", unit: "", accent: "accent-fat", caption: "必要脂类" },
    { key: "fiber", label: "膳食纤维", unit: "", accent: "accent-fiber", caption: "肠道轻盈" },
  ];
  const stepBadges = ["primary", "secondary", "accent", "neutral"];
  const celebrationPreset = {
    title: "热油泼香",
    tagline: "趁热上桌",
    description: "趁菜最热的时候浇上一勺滚油，让蒜末与干辣椒瞬间爆香。", // @TODO 需改善AI 返回的内容
    badge: "🔥",
    className: "cele-confetti",
    cue: "热油升香 5 秒",
  };

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
      <div class="plating-celebrations">
        <h3 class="cele-title"></h3>
        <!-- <div style="margin-bottom: 20px;"> -->
        <!-- <h3 style="margin: 0 0 8px 0; color: var(--mdc-theme-primary);">食谱描述</h3> -->
        <p class="cele-subtitle">
          {selectedRecipe.description || "这是一道美味可口的佳肴，制作简单，营养丰富。"}
        </p>

        <!-- 营养信息 -->
        {#if selectedRecipe.nutrition}
          <div class="nutrition-section">
            <h3 class="section-title">📊 营养信息</h3>
            <div class="nutrition-grid">
              {#each nutritionMeta as info (info.key)}
                <div class={`nutrition-card ${info.accent}`}>
                  <span class="nutrition-label">{info.label}</span>
                  <span class="nutrition-value">
                    {selectedRecipe.nutrition[info.key] ?? "--"}{info.unit}
                  </span>
                  <span class="nutrition-caption">{info.caption}</span>
                </div>
              {/each}
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
            <h3 class="section-title">🛒 所需食材</h3>
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
            <h3 class="steps-title">⏲️ 制作步骤</h3>
            <div class="steps-list">
              {#each selectedRecipe.steps as step, index}
                <div class={`step-card accent-${stepBadges[index % stepBadges.length]}`}>
                  <div class={`step-badge badge-${stepBadges[index % stepBadges.length]}`}>
                    {index + 1}
                  </div>
                  <div class="step-body">
                    <p class="step-label">步骤 {index + 1}</p>
                    <p class="step-text">{step}</p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      {@const ingredientNames = (selectedRecipe.ingredients ?? []).map(ing => ing?.name).filter(Boolean)}
      {@const highlightedIngredients = ingredientNames.slice(0, 2).join("、")}
      {@const stepsCount = selectedRecipe.steps?.length ?? 0}
      {@const nutrition = selectedRecipe.nutrition ?? {}}
      {@const stageFacts = [
        { label: "食材", value: ingredientNames.length ? `${ingredientNames.length} 种 · ${highlightedIngredients}` : "根据冰箱清单生成" },
        stepsCount ? { label: "步骤", value: `${stepsCount} 步` } : null,
        nutrition.calories ? { label: "热量", value: `${nutrition.calories} kcal` } : null,
        nutrition.protein ? { label: "蛋白质", value: `${nutrition.protein} g` } : null,
      ].filter(Boolean)}
      {@const formattedDate = new Date(selectedRecipe.createdAt || Date.now())
        .toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, ".")}
      <section class="cele-stage" aria-live="polite">
        <div class={`cele-stage-card ${celebrationPreset.className}`}>
          <div class="cele-stage-grid">
            <div class="cele-stage-copy">
              <div class="stage-chip-row">
                <span class="stage-chip stage-chip-emphasis">{selectedRecipe.cookingDifficultyLevel || "家常菜"}</span>
                <span class="stage-chip stage-chip-soft">{formattedDate}</span>
              </div>
              <div class="stage-title-wrap">
                <span class="stage-emblem">{celebrationPreset.badge}</span>
                <div>
                  <p class="stage-title">{selectedRecipe.name}</p>
                  <p class="stage-tagline">{celebrationPreset.tagline}</p>
                </div>
              </div>
              <p class="stage-description">{selectedRecipe.description || "AI 已根据冰箱余量生成这道菜的摘要。"}</p>
              <p class="stage-note">{celebrationPreset.description}</p>
            </div>
            <div class="cele-stage-visual" aria-hidden="true">
              <div class="cele-stage-rays">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="stage-cta-row">
                <span class="stage-cta-label">点睛提示</span>
                <span class="stage-cta-value">{celebrationPreset.cue || highlightedIngredients || "按口味完成"}</span>
              </div>
            </div>
          </div>
          <div class="stage-meta-row">
            {#each stageFacts as metric (metric.label)}
              <div class="stage-metric">
                <span class="stage-metric-label">{metric.label}</span>
                <span class="stage-metric-value">{metric.value}</span>
              </div>
            {/each}
          </div>
        </div>
      </section>
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

  .recipe-steps {
    margin-top: 24px;
  }

  .section-title,
  .steps-title {
    color: var(--mdc-theme-primary);
    font-size: 20px;
    font-weight: 600;
  }

  .section-title {
    margin: 0 0 12px 0;
  }

  .steps-title {
    margin: 0 0 16px 0;
  }

  .steps-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .step-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 12px 16px;
    background: rgba(24, 24, 24, 0.92);
    position: relative;
    transition:
      border-color 150ms ease,
      background 150ms ease;
  }

  .step-card::before {
    content: "";
    position: absolute;
    left: 0;
    top: 10px;
    bottom: 10px;
    width: 3px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
  }

  .step-card:hover {
    border-color: rgba(255, 255, 255, 0.18);
    background: rgba(32, 32, 32, 0.94);
  }

  .step-card.accent-primary::before {
    background: var(--mdc-theme-primary, #ff7043);
  }

  .step-card.accent-secondary::before {
    background: var(--mdc-theme-secondary, #64b5f6);
  }

  .step-card.accent-accent::before {
    background: #ffd766;
  }

  .step-card.accent-neutral::before {
    background: #9e9e9e;
  }

  .step-badge {
    width: 36px;
    min-width: 36px;
    height: 36px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    color: #0b0b0b;
    margin-top: 2px;
  }

  .badge-primary {
    background: color-mix(in srgb, var(--mdc-theme-primary, #ff7043) 80%, #ffffff);
  }

  .badge-secondary {
    background: color-mix(in srgb, var(--mdc-theme-secondary, #64b5f6) 80%, #ffffff);
  }

  .badge-accent {
    background: color-mix(in srgb, #ffd766 80%, #ffffff);
  }

  .badge-neutral {
    background: color-mix(in srgb, #9e9e9e 85%, #ffffff);
    color: #141414;
  }

  .step-body {
    flex: 1;
  }

  .step-label {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--mdc-theme-on-surface, #fff);
  }

  .step-text {
    margin: 4px 0 0 0;
    line-height: 1.6;
    color: var(--mdc-theme-text-secondary-on-background, rgba(255, 255, 255, 0.75));
  }

  .cele-stage {
    margin: 28px 0 16px;
  }

  .cele-stage-card {
    position: relative;
    border-radius: 28px;
    padding: 32px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background-image: radial-gradient(circle at 18% 20%, rgba(255, 255, 255, 0.09), transparent 60%),
      linear-gradient(120deg, rgba(255, 255, 255, 0.04), transparent 55%),
      linear-gradient(var(--stage-base, rgba(12, 12, 12, 0.92)), var(--stage-base, rgba(12, 12, 12, 0.92)));
    backdrop-filter: blur(24px);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55);
    overflow: hidden;
  }

  .cele-stage-card::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 28px;
    background: radial-gradient(circle at 80% 0%, rgba(255, 255, 255, 0.12), transparent 50%);
    opacity: 0.4;
    pointer-events: none;
    z-index: 0;
  }

  .cele-stage-card > * {
    position: relative;
    z-index: 1;
  }

  .cele-stage-grid {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
    gap: 32px;
  }

  .cele-stage-copy {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .stage-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .stage-chip {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.85);
  }

  .stage-chip-emphasis {
    font-size: 13px;
    letter-spacing: 0.05em;
    background: rgba(152, 255, 149, 0.2);
    color: #d6ffd2;
    border: 1px solid rgba(152, 255, 149, 0.45);
  }

  .stage-chip-soft {
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.55);
  }

  .stage-title-wrap {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stage-emblem {
    font-size: 32px;
  }

  .stage-title {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .stage-tagline {
    margin: 4px 0 0 0;
    font-size: 18px;
    letter-spacing: 0.3em;
    color: rgba(255, 255, 255, 0.75);
  }

  .stage-description {
    margin: 0;
    font-size: 14px;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.7);
  }

  .stage-note {
    margin: 4px 0 0 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.55);
    letter-spacing: 0.03em;
  }

  .cele-stage-visual {
    position: relative;
    border-radius: 22px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.35);
    min-height: 180px;
    overflow: hidden;
  }

  .cele-stage-rays {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: space-around;
    align-items: stretch;
  }

  .cele-stage-rays span {
    width: 6px;
    margin: 0 4px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0), var(--stage-accent, #ffad87));
    transform-origin: top;
    animation: stage-ray 4s ease-in-out infinite;
    box-shadow: 0 0 25px rgba(255, 173, 135, 0.5);
  }

  .cele-stage-rays span:nth-child(2) {
    animation-delay: 0.4s;
  }

  .cele-stage-rays span:nth-child(3) {
    animation-delay: 0.9s;
  }

  @keyframes stage-ray {
    0%,
    100% {
      transform: translateY(10%) scaleY(0.7);
      opacity: 0.5;
    }
    50% {
      transform: translateY(-5%) scaleY(1.1);
      opacity: 1;
    }
  }

  .stage-cta-row {
    position: absolute;
    bottom: 16px;
    left: 16px;
    right: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }

  .stage-cta-value {
    font-size: 13px;
    letter-spacing: 0.08em;
    color: var(--stage-accent, var(--mdc-theme-primary));
  }

  .stage-meta-row {
    margin-top: 28px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
  }

  .stage-metric {
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
  }

  .stage-metric-label {
    display: block;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
  }

  .stage-metric-value {
    display: block;
    margin-top: 6px;
    font-size: 15px;
    font-weight: 600;
  }

  @media (max-width: 900px) {
    .cele-stage-card {
      padding: 24px;
    }

    .cele-stage-grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .cele-stage-visual {
      min-height: 140px;
    }
  }

  .plating-celebrations {
    margin-top: 32px;
    padding: 24px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(14, 14, 14, 0.9);
  }

  .cele-title {
    margin: 0;
    font-size: 22px;
    color: var(--mdc-theme-primary);
  }

  .cele-subtitle {
    margin: 8px 0 20px 0;
    color: var(--mdc-theme-text-secondary-on-background, rgba(255, 255, 255, 0.7));
    font-size: 14px;
  }

  .cele-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 18px;
    grid-auto-rows: minmax(220px, auto);
    align-items: stretch;
  }

  .cele-card {
    position: relative;
    border-radius: 14px;
    padding: 18px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
    transition:
      transform 220ms ease,
      border-color 220ms ease,
      box-shadow 220ms ease,
      background 220ms ease;
    min-height: 220px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    --cele-base-color: rgba(10, 10, 10, 0.72);
    --cele-surface: radial-gradient(circle at 15% 10%, rgba(255, 255, 255, 0.08), transparent 55%);
    background-image: var(--cele-surface), linear-gradient(var(--cele-base-color), var(--cele-base-color));
    background-blend-mode: screen, normal;
    backdrop-filter: blur(18px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 1px 12px rgba(0, 0, 0, 0.45);
    overflow: hidden;
  }

  .cele-card:focus-visible {
    outline: 2px solid var(--mdc-theme-primary);
    outline-offset: 3px;
  }

  .cele-card.is-active {
    transform: translateY(-6px);
    border-color: var(--mdc-theme-primary, rgba(255, 112, 67, 0.85));
    box-shadow: 0 22px 46px rgba(0, 0, 0, 0.55);
    --cele-base-color: rgba(18, 18, 18, 0.9);
    --cele-surface: radial-gradient(circle at 10% 0, rgba(255, 255, 255, 0.16), transparent 60%);
  }

  .cele-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cele-badge {
    font-size: 20px;
  }

  .cele-title-text {
    font-size: 16px;
    font-weight: 600;
  }

  .cele-tagline {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .cele-description {
    margin: 0;
    font-size: 13px;
    color: var(--mdc-theme-text-secondary-on-background, rgba(255, 255, 255, 0.75));
    line-height: 1.5;
    flex-grow: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .cele-select-btn {
    margin-top: 6px;
    align-self: flex-start;
    padding: 6px 16px;
    border-radius: 999px;
    border: none;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    cursor: pointer;
  }

  .cele-card.is-active .cele-select-btn {
    background: var(--mdc-theme-primary, #ff7043);
    color: #0b0b0b;
  }

  .cele-confetti {
    --cele-surface: radial-gradient(circle at top left, rgba(255, 205, 178, 0.4), rgba(15, 15, 15, 0.2));
    overflow: hidden;
    --stage-base: rgba(46, 25, 17, 0.95);
    --stage-accent: #ffb48a;
  }

  .cele-confetti::after,
  .cele-confetti::before {
    content: "";
    position: absolute;
    width: 6px;
    height: 80px;
    background: linear-gradient(180deg, #ff8a80, #ffd180);
    opacity: 0.5;
    top: -20px;
    left: 20%;
    transform: rotate(20deg);
    animation: confetti-fall 3s linear infinite;
  }

  .cele-confetti::before {
    left: 60%;
    animation-delay: 0.6s;
  }

  @keyframes confetti-fall {
    0% {
      transform: translateY(-40px) rotate(15deg);
    }
    100% {
      transform: translateY(140px) rotate(45deg);
    }
  }

  .cele-aurora {
    --cele-surface: linear-gradient(120deg, rgba(129, 212, 250, 0.25), rgba(149, 117, 205, 0.4));
    --stage-base: rgba(20, 23, 40, 0.92);
    --stage-accent: #9fb6ff;
  }

  .cele-sparkline {
    --cele-base-color: rgba(20, 20, 20, 0.9);
    --cele-surface: linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 70%);
    --stage-base: rgba(16, 16, 24, 0.95);
    --stage-accent: #93b2ff;
  }

  .cele-sparkline::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0, rgba(255, 255, 255, 0.08) 2px, transparent 2px, transparent 8px);
    animation: scan 2.8s linear infinite;
    opacity: 0.4;
    pointer-events: none;
  }

  @keyframes scan {
    0% {
      transform: translateX(-10%);
    }
    100% {
      transform: translateX(10%);
    }
  }

  .cele-balloon {
    --cele-surface: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 111, 97, 0.2));
    --stage-base: rgba(32, 19, 24, 0.94);
    --stage-accent: #ff9fb3;
  }
  .cele-balloon::after {
    content: "🎈🎈🎈";
    position: absolute;
    right: 12px;
    top: 12px;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
    100% {
      transform: translateY(0);
    }
  }

  .cele-minimal {
    --cele-surface: radial-gradient(circle at top right, rgba(255, 215, 130, 0.45), rgba(12, 12, 12, 0.3));
    --stage-base: rgba(24, 20, 12, 0.94);
    --stage-accent: #ffd699;
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

  .nutrition-section {
    margin-bottom: 20px;
  }

  .nutrition-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }

  .nutrition-card {
    border-radius: 12px;
    padding: 12px 14px;
    background: rgba(28, 28, 28, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
    position: relative;
    overflow: hidden;
  }

  .nutrition-card::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 55%);
    pointer-events: none;
  }

  .nutrition-label {
    display: block;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mdc-theme-text-secondary-on-background, rgba(255, 255, 255, 0.7));
    margin-bottom: 4px;
  }

  .nutrition-value {
    display: block;
    font-size: 22px;
    font-weight: 600;
    color: var(--mdc-theme-on-surface, #fff);
    margin-bottom: 2px;
  }

  .nutrition-caption {
    font-size: 10px;
    color: var(--mdc-theme-text-secondary-on-background, rgba(255, 255, 255, 0.65));
  }

  .nutrition-card.accent-energy {
    background: linear-gradient(135deg, rgba(255, 138, 128, 0.35), rgba(255, 138, 128, 0.08));
    border-color: rgba(255, 138, 128, 0.6);
    /* box-shadow: 0 18px 42px rgba(255, 138, 128, 0.22); */
  }

  .nutrition-card.accent-sugar {
    background: linear-gradient(135deg, rgba(255, 173, 210, 0.4), rgba(255, 173, 210, 0.08));
    border-color: rgba(255, 173, 210, 0.65);
    /* box-shadow: 0 18px 42px rgba(255, 173, 210, 0.22); */
  }

  .nutrition-card.accent-protein {
    background: linear-gradient(135deg, rgba(130, 177, 255, 0.35), rgba(130, 177, 255, 0.08));
    border-color: rgba(130, 177, 255, 0.55);
    /* box-shadow: 0 18px 42px rgba(130, 177, 255, 0.2); */
  }

  .nutrition-card.accent-carbs {
    background: linear-gradient(135deg, rgba(255, 214, 102, 0.35), rgba(255, 214, 102, 0.08));
    border-color: rgba(255, 214, 102, 0.5);
    /* box-shadow: 0 18px 42px rgba(255, 214, 102, 0.18); */
  }

  .nutrition-card.accent-fat {
    background: linear-gradient(135deg, rgba(186, 104, 255, 0.35), rgba(186, 104, 255, 0.08));
    border-color: rgba(186, 104, 255, 0.55);
    /* box-shadow: 0 18px 42px rgba(186, 104, 255, 0.2); */
  }

  .nutrition-card.accent-fiber {
    background: linear-gradient(135deg, rgba(102, 187, 106, 0.35), rgba(102, 187, 106, 0.08));
    border-color: rgba(102, 187, 106, 0.55);
  }

  @media (max-width: 600px) {
    .nutrition-grid {
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    }
  }
</style>
