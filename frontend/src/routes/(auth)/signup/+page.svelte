<script lang="ts">
  import TextField from "@smui/textfield";
  import Icon from "@smui/textfield/icon";
  import Select from "@smui/select";
  import FormField from "@smui/form-field";
  import Checkbox from "@smui/checkbox";
  import Button, { Label } from "@smui/button";
  import { UserApi } from "$lib/api";
  import { showNotification } from "$lib/notifications";
  import { goto } from "$app/navigation";
  import { spicyChoices, vegetarianOptions } from "$lib/constants";
  import Radio from "@smui/radio";
  import SegmentedButton, { Segment } from "@smui/segmented-button";
  import Tooltip, {
    Wrapper,
    Title,
    Content,
    Link,
    RichActions,
  } from "@smui/tooltip";

  let formData = $state({
    name: "",
    userId: "",
    userPassword: "",
    confirmPassword: "",
    vegan: "",
    allergiesInput: "",
    spiciness: 0,
    cookingMethodInput: "",
  });

  let isLoading = $state(false);

  async function handleSubmit() {
    if (!formData.name || !formData.userId || !formData.userPassword) {
      showNotification("请填写必填项", "error");
      return;
    }

    if (formData.userPassword !== formData.confirmPassword) {
      showNotification("密码不匹配", "error");
      return;
    }

    isLoading = true;

    try {
      // 处理数组字段
      const cookingMethod = formData.cookingMethodInput
        ? formData.cookingMethodInput.split(",").map((s) => s.trim())
        : [];
      const allergies = formData.allergiesInput
        ? formData.allergiesInput.split(",").map((s) => s.trim())
        : [];

      const userData = {
        name: formData.name,
        userId: formData.userId,
        userPassword: formData.userPassword,
        role: "USER",
        vegan: formData.vegan || "no",
        cookingMethod,
        spiciness: parseInt(formData.spiciness),
        allergies,
      };

      const response = await UserApi.register(userData);

      if (response.status === "CREATED") {
        showNotification("注册成功！请登录", "success");
        goto("/login");
      } else {
        showNotification("注册失败：服务器响应异常", "error");
      }
    } catch (error) {
      console.error("注册失败:", error);
      showNotification(` ${error.message || "未知错误"}`, "error");
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="form-container">
  <h1 align="center">注册</h1>

  <h6>您的称呼 <span class="text-red">*</span></h6>
  <FormField style="width: 100%;">
    <TextField
      style="min-width: 100%;"
      bind:value={formData.name}
      disabled={isLoading}
      required
    >
      {#snippet leadingIcon()}
        <Icon class="material-icons">badge</Icon>
      {/snippet}
    </TextField>
  </FormField>

  <h6>登录用户名 <span class="text-red">*</span></h6>
  <FormField style="width: 100%;">
    <TextField
      style="min-width: 100%;"
      bind:value={formData.userId}
      disabled={isLoading}
      required
    >
      {#snippet leadingIcon()}
        <Icon class="material-icons">person</Icon>
      {/snippet}
    </TextField>
  </FormField>

  <h6>登录密码 <span class="text-red">*</span></h6>
  <FormField style="width: 100%;">
    <TextField
      variant="filled"
      style="min-width:100%"
      bind:value={formData.userPassword}
      type="password"
      disabled={isLoading}
      required
    >
      {#snippet leadingIcon()}
        <Icon class="material-icons">password</Icon>
      {/snippet}
      {#snippet trailingIcon()}
        <Icon class="material-icons">visibility</Icon>
      {/snippet}
    </TextField>
  </FormField>

  <h6>
    确认密码 <span class="text-red">*</span>
  </h6>
  <FormField style="width: 100%;">
    <TextField
      variant="filled"
      style="min-width: 100%;"
      bind:value={formData.confirmPassword}
      type="password"
      disabled={isLoading}
      required
    >
      {#snippet leadingIcon()}
        <Icon class="material-icons">password</Icon>
      {/snippet}
      {#snippet trailingIcon()}
        <Icon class="material-icons" onclick={() => {}}>visibility</Icon>
      {/snippet}
    </TextField>
  </FormField>

  <h6>素食选项（可选）</h6>
  {#each vegetarianOptions as option}
    <FormField style="width:100%">
      <Radio
        bind:group={formData.vegan}
        value={option.value}
        disabled={isLoading}
      />
      {#snippet label()}
        <span style="width:80%">{option.label}</span>
      {/snippet}
    </FormField>
  {/each}

  <h6>烹饪方式（可选，用逗号分隔）</h6>
  <FormField style="width: 100%;">
    <TextField
      style="width: 100%;"
      bind:value={formData.cookingMethodInput}
      disabled={isLoading}
      placeholder="例如：炒,煮,蒸"
    >
      {#snippet leadingIcon()}
        <Icon class="material-icons">restaurant</Icon>
      {/snippet}
    </TextField>
  </FormField>

  <h6>过敏反应（可选，用逗号分隔）</h6>
  <FormField style="width: 100%;">
    <TextField
      style="width: 100%;"
      bind:value={formData.allergiesInput}
      disabled={isLoading}
      placeholder="例如：花生,海鲜"
    >
      {#snippet leadingIcon()}
        <Icon class="material-icons">warning</Icon>
      {/snippet}
    </TextField>
  </FormField>

  <h6>吃辣的程度（可选）</h6>
  <FormField style="width: 100%;">
    <SegmentedButton
      segments={spicyChoices}
      singleSelect
      bind:selected={formData.spiciness}
    >
      {#snippet segment(segment)}
        <Segment {segment}>
          <Label>{segment}</Label>
        </Segment>
      {/snippet}
    </SegmentedButton>
  </FormField>

  <Button
    class="button-submit"
    onclick={handleSubmit}
    variant="raised"
    disabled={isLoading}
  >
    <Label>{isLoading ? "注册中..." : "提交注册"}</Label>
  </Button>
</div>

<style>
  .form-container {
    max-width: 500px;
    margin: 0 auto;
    width: 100%;
    /* padding: 20px; */
  }
  .button-submit {
    margin-bottom: 20px;
  }
</style>
