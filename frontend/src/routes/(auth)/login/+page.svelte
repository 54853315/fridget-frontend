<script lang="ts">
  import TextField from "@smui/textfield";
  import Icon from "@smui/textfield/icon";
  import FormField from "@smui/form-field";
  import Button, { Label } from "@smui/button";
  import { UserApi, setTokens } from "$lib/api";
  import { showNotification } from "$lib/notifications";
  import { goto } from "$app/navigation";

  let userId = $state("");
  let userPassword = $state("");
  let isLoading = $state(false);
  let showPassword = $state(false);

  async function handleSubmit() {
    if (!userId || !userPassword) {
      showNotification("请填写用户名和密码", "error");
      return;
    }

    isLoading = true;

    try {
      const response = await UserApi.login({
        userId,
        userPassword,
      });

      if (response.result && response.result.token) {
        setTokens(response.result.token, response.result.refreshToken);
        showNotification("登录成功!", "success");
        goto("/cook");
      } else {
        showNotification("登录失败：服务器响应异常", "error");
      }
    } catch (error) {
      console.error("登录失败:", error);
      showNotification(`${error.message || "未知错误"}`, "error");
    } finally {
      isLoading = false;
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function handleIconKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      togglePasswordVisibility();
    }
  }
</script>

<div class="form-container">
  <h1 align="center">登录</h1>

  <h6>用户名 <span class="text-red">*</span></h6>
  <FormField style="width: 100%;">
    <TextField style="min-width: 100%;" bind:value={userId} onkeydown={handleKeyDown} disabled={isLoading} required>
      {#snippet leadingIcon()}
        <Icon class="material-icons">person</Icon>
      {/snippet}
    </TextField>
  </FormField>

  <h6>密码 <span class="text-red">*</span></h6>
  <FormField style="width: 100%;">
    <TextField
      style="min-width:100%"
      bind:value={userPassword}
      onkeydown={handleKeyDown}
      type={showPassword ? "text" : "password"}
      disabled={isLoading}
      required
    >
      {#snippet leadingIcon()}
        <Icon class="material-icons">password</Icon>
      {/snippet}
      {#snippet trailingIcon()}
        <span
          class="password-toggle icon-clickable"
          role="button"
          tabindex="0"
          aria-pressed={showPassword}
          on:click={togglePasswordVisibility}
          on:keydown={handleIconKeyDown}
        >
          <Icon class="material-icons" aria-hidden="true">
            {showPassword ? "visibility_off" : "visibility"}
          </Icon>
        </span>
      {/snippet}
    </TextField>
  </FormField>

  <Button class="button-submit" onclick={handleSubmit} variant="raised" disabled={isLoading}>
    <Label>{isLoading ? "登录中..." : "登录"}</Label>
  </Button>
  <h6 align="center">
    没有账号？ <a href="/signup" class="text-green">注册</a>
  </h6>
</div>

<style>
  .form-container {
    max-width: 500px;
    margin: 0 auto;
    width: 100%;
    /* padding: 20px; */
  }

  .icon-clickable {
    cursor: pointer;
    pointer-events: auto;
  }

  .password-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
  }
</style>
