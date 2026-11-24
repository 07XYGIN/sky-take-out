<!--购买页-->
<template>
  <view class="customer-box">
    <view class="wrap">
      <view class="contion">
        <view class="orderPay">
          <view>
            <view v-if="timeout">订单已超时</view>
            <view v-else-if="rocallTime"
              >支付剩余时间<text>{{ rocallTime }}</text></view
            >
          </view>
          <view class="money"
            >￥<text>{{ orderDataInfo.orderAmount }}</text></view
          >
          <view>{{ orderDataInfo.shopName }}-{{ orderDataInfo.orderNumber }}</view>
        </view>
      </view>
      <view class="bottomBox btnBox">
        <button class="add_btn" type="primary" plain="true" @click="handleSave" :disabled="!ready || timeout || paying" :loading="paying">
          确认支付
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { paymentOrder, getOrderDetail } from "@/pages/api/api.js";
export default {
  data() {
    return {
      timeout: false,
      rocallTime: "",
      orderId: null,
      orderDataInfo: {},
      times: null,
      paying: false,
      ready: false
    };
  },
  async onLoad(options) {
    this.orderId = options.orderId;
    try {
      await this.loadOrder();
    } catch (error) {
      this.ready = false;
    }
  },
  onUnload() { clearTimeout(this.times); },
  methods: {
    async loadOrder() {
      const response = await getOrderDetail(this.orderId);
      const order = response.data;
      this.orderDataInfo = {
        ...order,
        orderNumber: order.number,
        orderAmount: order.amount
      };
      this.ready = order.status === 1;
      this.runTimeBack();
    },
    async handleSave() {
      if (this.paying || !this.ready || this.timeout) return;
      this.paying = true;
      try {
        await paymentOrder({ orderNumber: this.orderDataInfo.orderNumber });
        await getOrderDetail(this.orderId);
        uni.redirectTo({
          url: "/pages/success/index?orderId=" + this.orderId
        });
      } catch (error) {
        uni.showToast({ title: error.message || "支付状态更新失败，请重试", icon: "none" });
      } finally {
        this.paying = false;
      }
    },
    runTimeBack() {
      clearTimeout(this.times);
      if (!this.orderDataInfo.payDeadline) return;
      const deadline = Date.parse(String(this.orderDataInfo.payDeadline).replace(/-/g, "/").replace("T", " "));
      if (!Number.isFinite(deadline)) return;
      const remaining = deadline - Date.now();
      this.timeout = remaining <= 0;
      if (this.timeout) return;
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor(remaining / 1000) % 60;
      this.rocallTime = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
      this.times = setTimeout(() => this.runTimeBack(), 1000);
    }
  }
};
</script>
<style src="./../common/Navbar/navbar.scss" lang="scss" scoped></style>
<style src="./../order/style.scss" lang="scss"></style>
<style>
</style>
