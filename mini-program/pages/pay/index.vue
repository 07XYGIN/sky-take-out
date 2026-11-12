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
          <view>{{ shopInfo().shopName }}-{{ orderDataInfo.orderNumber }}</view>
        </view>
      </view>
      <view class="box payBox">
        <view class="contion">
          <view class="example-body">
            <radio-group class="uni-list" @change="styleChange">
              <view class="uni-list-item">
                <view
                  class="uni-list-item__container"
                  v-for="(item, index) in payMethodList"
                  :key="item"
                >
                  <view class="uni-list-item__content">
                    <icon class="wechatIcon"></icon
                    ><text class="uni-list-item__content-title">{{
                      item
                    }}</text>
                  </view>
                  <view class="uni-list-item__extra">
                    <radio
                      :value="item"
                      color="#FFC200"
                      :checked="index == activeRadio"
                      class="radioIcon"
                    />
                  </view>
                </view>
              </view>
            </radio-group>
          </view>
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
import { mapState } from "vuex";
import { paymentOrder, getOrderDetail } from "@/pages/api/api.js";
export default {
  data() {
    return {
      timeout: false,
      rocallTime: "",
      orderId: null,
      orderDataInfo: {},
      activeRadio: 0,
      payMethodList: ["微信支付"],
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
    ...mapState(["shopInfo"]),
    styleChange() { this.activeRadio = 0; },
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
        const response = await paymentOrder({
          orderNumber: this.orderDataInfo.orderNumber,
          payMethod: 1
        });
        const data = response.data;
        if (!data || !data.timeStamp || !data.paySign || !(data.packageStr || data.package)) {
          throw new Error("后端未返回完整的微信支付参数");
        }
        await new Promise((resolve, reject) => {
          uni.requestPayment({
            ...data,
            package: data.packageStr || data.package,
            success: resolve,
            fail: reject
          });
        });
        // 微信回调后再查后端订单，支付回调尚未入库时先进入详情页。
        const result = await getOrderDetail(this.orderId);
        const paid = Number(result.data.payStatus) === 1;
        uni.redirectTo({
          url: (paid ? "/pages/success/index?orderId=" : "/pages/details/index?orderId=") + this.orderId
        });
      } catch (error) {
        uni.showToast({ title: error.message || "支付未完成，请重试", icon: "none" });
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
