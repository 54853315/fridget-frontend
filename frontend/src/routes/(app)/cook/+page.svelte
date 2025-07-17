<script lang="ts">
  import { IngredientApi, CookingPreferenceApi } from "$lib/api";
  import { categories, methods, kitchenware, choices } from "$lib/constants";
  import { showNotification } from "$lib/notifications";
  import IconButton from "@smui/icon-button";
  import Fab, { Icon } from "@smui/fab";
  import Autocomplete from "@smui-extra/autocomplete";
  import SegmentedButton, { Segment } from "@smui/segmented-button";
  import Chip, { Set, LeadingIcon, TrailingAction, Text } from "@smui/chips";
  import ChipInput from "@smui-extra/chip-input";
  import Button from "@smui/button";
  import { Label } from "@smui/common";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import LayoutGrid from "$lib/components/LayoutGrid.svelte";
  import { onMount } from "svelte";

  let formData = $state({
    // 食材相关
    inputValue: "",
    selectedCategory: undefined,
    confirmIngredients: [],
    myIngredients: [],

    // 烹饪偏好
    haveCulinaryskills: [],
    haveKitchenUtensils: [],
    people: "1",
    remark: "",
  });

  // 状态管理
  let isInitialized = $state(false); // 在 onMount 中，加载完食材和烹饪偏好后设置为 true
  let isIngredientsLoading = $state(false);
  let isPreferenceLoading = $state(false);

  // 加载我的食材和烹饪偏好
  let previousChipCount = 0;

  onMount(async () => {
    await loadMyIngredients();
    await loadCookingPreference();

    // 初始化快照，避免首次数据加载触发保存
    previousSkillsSnapshot = JSON.stringify(formData.haveCulinaryskills);
    previousUtensilsSnapshot = JSON.stringify(formData.haveKitchenUtensils);

    // 初始化 chip 数量
    previousChipCount = formData.confirmIngredients.length;

    // 标记初始化完成
    isInitialized = true;
  });

  async function loadMyIngredients() {
    try {
      isIngredientsLoading = true;
      const response = await IngredientApi.getMyIngredients();
      formData.myIngredients = response || [];
    } catch (error) {
      console.error("加载食材失败:", error);
      showNotification(` ${error.message || "未知错误"}`, "error");
    } finally {
      isIngredientsLoading = false;
    }
  }

  async function loadCookingPreference() {
    try {
      isPreferenceLoading = true;
      const response = await CookingPreferenceApi.getCookingPreference();
      if (response && response.result) {
        const preference = response.result;
        formData.haveCulinaryskills = preference.cookingMethods || [];
        formData.haveKitchenUtensils = preference.cookingEquipment || [];
        formData.people = preference.servingSize || "1";
        formData.remark = preference.additionalInfo || "";
      }
    } catch (error) {
      console.error("加载烹饪偏好失败:", error);
      if (error.status !== "NOT_FOUND") {
        // 其他错误才显示通知
        showNotification(` ${error.message || "未知错误"}`, "error");
      }
    } finally {
      isPreferenceLoading = false;
    }
  }

  async function saveCookingPreferenceWithMessage(successMessage = "烹饪偏好已保存") {
    try {
      const currentPeople = $state.snapshot(formData.people);
      let servingSize = currentPeople;
      const preferenceData = {
        cookingEquipment: formData.haveKitchenUtensils,
        cookingMethods: formData.haveCulinaryskills,
        servingSize: servingSize,
        additionalInfo: formData.remark,
      };

      await CookingPreferenceApi.saveCookingPreference(preferenceData);
      showNotification(successMessage, "success");
    } catch (error) {
      showNotification(` ${error.message}`, "error");
    }
  }

  const saveCookingPreference = () => saveCookingPreferenceWithMessage("补充食材已保存");
  const savePeopleCount = selectedValue => {
    formData.people = selectedValue;
    saveCookingPreferenceWithMessage("用餐人数已保存");
  };
  const saveSkillsAndEquipment = () => saveCookingPreferenceWithMessage("偏好设置已保存");

  // 响应式保存料理方式和厨具
  let previousSkillsSnapshot = "";
  let previousUtensilsSnapshot = "";
  let saveTimeoutId = null;

  $effect(() => {
    // 只有在初始化完成且不是数据加载状态时才检查变化
    if (isInitialized && !isPreferenceLoading) {
      const currentSkillsSnapshot = JSON.stringify(formData.haveCulinaryskills);
      const currentUtensilsSnapshot = JSON.stringify(formData.haveKitchenUtensils);

      // console.log("Effect triggered:", {
      //   skills: formData.haveCulinaryskills,
      //   utensils: formData.haveKitchenUtensils,
      //   previousSkills: previousSkillsSnapshot,
      //   previousUtensils: previousUtensilsSnapshot,
      // });

      const skillsChanged = currentSkillsSnapshot !== previousSkillsSnapshot;
      const utensilsChanged = currentUtensilsSnapshot !== previousUtensilsSnapshot;

      if (skillsChanged || utensilsChanged) {
        console.log("Changes detected, saving...", {
          skillsChanged,
          utensilsChanged,
        });
        // 清除之前的定时器
        if (saveTimeoutId) {
          clearTimeout(saveTimeoutId);
        }

        // 设置新的定时器
        saveTimeoutId = setTimeout(() => {
          saveSkillsAndEquipment();
          saveTimeoutId = null;
        }, 500);
      }

      // 更新快照（使用非响应式变量）
      previousSkillsSnapshot = currentSkillsSnapshot;
      previousUtensilsSnapshot = currentUtensilsSnapshot;
    }
  });



  $effect(() => {
    if (formData.confirmIngredients.length > previousChipCount) {
      // A chip was added, likely via separator. Clear the input.
      setTimeout(() => {
        formData.inputValue = '';
      }, 0);
    }
    previousChipCount = formData.confirmIngredients.length;
  });

  async function addIngredients(event: CustomEvent<string>) {
    if (formData.confirmIngredients.length === 0) {
      showNotification("请先添加食材", "warning");
      return;
    }

    if (!formData.selectedCategory) {
      showNotification("请选择食材分类", "warning");
      return;
    }

    try {
      isIngredientsLoading = true;

      // 构造食材数据
      const ingredientsToAdd = formData.confirmIngredients.map(name => ({
        name,
        category: formData.selectedCategory,
      }));

      await IngredientApi.addIngredients(ingredientsToAdd);

      // 重新加载食材列表
      await loadMyIngredients();

      // 清空输入
      formData.confirmIngredients = [];
      formData.inputValue = "";
      formData.selectedCategory = undefined;

      showNotification("食材添加成功", "success");
    } catch (error) {
      console.error("添加食材失败:", error);
      showNotification(` ${error.message || "未知错误"}`, "error");
    } finally {
      isIngredientsLoading = false;
    }
  }

  async function removeIngredient(ingredient) {
    try {
      isIngredientsLoading = true;
      await IngredientApi.deleteIngredients([
        {
          name: ingredient.name,
          category: ingredient.category,
        },
      ]);
      await loadMyIngredients();
      showNotification("食材删除成功", "success");
    } catch (error) {
      console.error("删除食材失败:", error);
      showNotification(` ${error.message || "未知错误"}`, "error");
    } finally {
      isIngredientsLoading = false;
    }
  }

  
</script>

<div class="cook-container">
  <h1 align="center">我的食材</h1>

  <div class="input-container">
    <ChipInput
      bind:chips={formData.confirmIngredients}
      bind:value={formData.inputValue}
      autocomplete$combobox
      chipTrailingAction$class="material-icons"
      chipTrailingAction$aria-label="删除食材"
      addChipKeys={[',', '\\']}
      style="width:800px;"
    >
      {#snippet chipTrailingAction()}cancel{/snippet}
      {#snippet label()}
        {#if formData.confirmIngredients.length > 0}
          继续输入食材
        {:else}
          输入食材，如：牛肉，按回车确认
        {/if}
      {/snippet}
    </ChipInput>

    <Autocomplete options={categories} textfield$variant="outlined" bind:value={formData.selectedCategory} label="清选择食材分类" />

    <div class="">
      <Fab>
        <IconButton class="material-icons" viewBox="2 2 20 20" ripple={false} onclick={addIngredients} disabled={isIngredientsLoading}>
          add</IconButton
        >
      </Fab>
    </div>
  </div>

  {#if isIngredientsLoading}
    <div style="display: flex; justify-content: center; margin: 20px;">
      <span>加载中...</span>
    </div>
  {:else}
    <div class="ingredients-grid">
      <h4>我的食材</h4>
      {#if formData.myIngredients.length === 0}
        <p>暂无食材，请添加一些食材吧！</p>
      {:else}
        <div class="ingredients-list">
          {#each formData.myIngredients as ingredient}
            <div class="ingredient-item">
              <span class="ingredient-name">{ingredient.name}</span>
              <span class="ingredient-category">({ingredient.category})</span>
              <button class="remove-btn" onclick={() => removeIngredient(ingredient)} disabled={isIngredientsLoading}> × </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <h4>擅长的料理方式</h4>
  <Set chips={methods} filter bind:selected={formData.haveCulinaryskills}>
    {#snippet chip(chip)}
      <Chip {chip} touch>
        <Text>{chip}</Text>
      </Chip>
    {/snippet}
  </Set>

  <h4>擅长的厨具</h4>
  <Set chips={Object.values(kitchenware)} filter bind:selected={formData.haveKitchenUtensils}>
    {#snippet chip(chipValue)}
      <Chip chip={chipValue} touch value={chipValue}>
        <LeadingIcon>{Object.keys(kitchenware).find(k => kitchenware[k] === chipValue)}</LeadingIcon>
        <Text>{chipValue}</Text>
      </Chip>
    {/snippet}
  </Set>

  <h4>用餐人数</h4>
  <SegmentedButton segments={choices} singleSelect bind:selected={formData.people}>
    {#snippet segment(segment)}
      <Segment {segment} onclick={() => savePeopleCount(segment)}>
        <Label>{segment}</Label>
      </Segment>
    {/snippet}
  </SegmentedButton>

  <h4>补充</h4>
  <Textfield style="width: 100%;" helperLine$style="width: 100%;" textarea bind:value={formData.remark} label="备注信息">
    {#snippet helper()}
      <HelperText>请输入其他烹饪偏好或特殊要求</HelperText>
    {/snippet}
  </Textfield>

  <div style="margin-top: 20px; text-align: center;">
    <Button variant="raised" onclick={saveCookingPreference} disabled={isIngredientsLoading}>
      <Label>保存补充信息</Label>
    </Button>
  </div>
</div>

<style>
  * :global(svg:focus) {
    outline: 0;
  }

  .input-container {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .cook-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .ingredients-grid {
    width: 100%;
    margin: 20px 0;
  }

  .ingredients-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
    margin-top: 10px;
  }

  .ingredient-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #f5f5f5;
    border-radius: 8px;
    border: 1px solid #ddd;
  }

  .ingredient-name {
    font-weight: 500;
    color: #333;
  }

  .ingredient-category {
    font-size: 12px;
    color: #666;
    margin-left: 5px;
  }

  .remove-btn {
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
  }

  .remove-btn:hover {
    background: #cc0000;
  }

  .remove-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .category {
    font-weight: bold;
    color: #555;
  }

  .tag button {
    background: none;
    border: none;
    cursor: pointer;
    color: #999;
    padding: 0;
    font-size: 14px;
  }

  .tag button:hover {
    color: #f00;
  }
</style>
