<script lang="ts">
  import Notification from "$lib/notifications/Notification.svelte";
  import { notificationStore } from "$lib/notifications";
  import { showNotification } from "$lib/notifications";
  import Button from "@smui/button";
  import IconButton from "@smui/icon-button";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import Tab from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  import { goto } from "$app/navigation";
  import { UserApi, clearTokens, getTokens } from "$lib/api";

  import Banner, { Label, Icon, CloseReason } from "@smui/banner";
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import Checkbox from "@smui/checkbox";
  import FormField from "@smui/form-field";

  let donationClose = $state(false);

  // 从localStorage读取Banner关闭状态
  if (typeof window !== "undefined") {
    donationClose = localStorage.getItem("bannerClosed") === "true";
  }
  let isLoading = $state(false);

  const menu = [
    {
      label: "今日菜谱",
      href: "/",
    },
    {
      label: "我的食材",
      href: "cook",
    },
    {
      label: "退出",
      href: null, // 退出不使用href，而是调用函数
    },
  ];

  // 处理退出登录
  async function handleLogout() {
    if (isLoading) return;

    isLoading = true;

    try {
      const { accessToken } = getTokens();
      if (accessToken) {
        // 调用退出API
        await UserApi.logout(accessToken);
      }

      // 清除本地token
      clearTokens();

      showNotification("退出成功", "success");

      goto("/login");
    } catch (error) {
      console.error("退出失败:", error);
      // 即使API调用失败，也清除本地token并跳转
      clearTokens();
      showNotification("退出成功", "success");
      goto("/login");
    } finally {
      isLoading = false;
    }
  }

  // 处理菜单点击
  function handleMenuClick(item: any) {
    if (item.label === "退出") {
      handleLogout();
    } else if (item.href) {
      goto(item.href);
    }
  }

  function handleBannerClosed(event: CustomEvent<{ reason: CloseReason }>) {
    const { reason } = event.detail;

    if (reason === CloseReason.PRIMARY) {
      if (typeof window !== "undefined") {
        window.open("https://github.com/54853315/fridget-frontend", "_blank");
      }
    } else {
      donationClose = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("bannerClosed", "true");
      }
    }
  }

  let { children } = $props();
  import "../../theme/theme.scss";
</script>

<div class="top-app-bar-container">
  <TopAppBar variant="static">
    <Row class="app-bar-row">
      <Section class="app-bar-section">
        <Title>
          <span><img src="/images/logo.svg" alt="Fridget Logo" style="height: 70px;padding-top:9px" /></span>
        </Title>
      </Section>
      <Section class="app-bar-section">
        <TabBar tabs={menu.map(item => item.label)}>
          {#snippet tab(tab)}
            <Tab
              {tab}
              minWidth
              href={menu.find(item => item.label === tab)?.href}
              onclick={() => {
                const menuItem = menu.find(item => item.label === tab);
                if (menuItem) {
                  handleMenuClick(menuItem);
                }
              }}
            >
              <Label>{tab}</Label>
            </Tab>
          {/snippet}
        </TabBar>
      </Section>
    </Row>
  </TopAppBar>

  <style>
    .top-app-bar-container {
      .app-bar-row {
        display: flex;
        justify-content: space-between;
        width: 100%;
        padding: 0 7rem;
      }

      .app-bar-section {
        flex: 0 0 auto;
      }
    }
  </style>
  <Banner centered open={!donationClose} onSMUIBannerClosed={handleBannerClosed}>
    {#snippet icon()}
      <Icon class="material-icons">favorite</Icon>
    {/snippet}
    {#snippet label()}
      <Label>如果你喜欢，可以捐赠这个项目。</Label>
    {/snippet}
    {#snippet actions()}
      <Button>访问Github源代码</Button>
      <Button secondary>关闭</Button>
    {/snippet}
  </Banner>
</div>

<Notification bind:message={$notificationStore.message} bind:type={$notificationStore.type} bind:timeout={$notificationStore.timeout} />

{@render children()}
