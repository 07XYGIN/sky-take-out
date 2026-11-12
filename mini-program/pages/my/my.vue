<template>
  <view>
    <uni-nav-bar
      @clickLeft="goBack"
      left-icon="back"
      leftIcon="arrowleft"
      title="个人中心"
      statusBar="true"
      fixed="true"
      color="#ffffff"
      backgroundColor="#ffc200"
    ></uni-nav-bar>

    <view class="my-center">
      <!-- 头像展示部分 -->
      <head-info
        :psersonUrl="psersonUrl"
        :nickName="nickName"
        :gender="gender"
        :phoneNumber="phoneNumber"
        :getPhoneNum="getPhoneNum"
      ></head-info>

      <view class="container">
        <!-- 地址和历史订单 -->
        <order-info @goAddress="goAddress" @goOrder="goOrder"></order-info>
        <!-- 最近订单 -->
        <!-- 最近订单title -->
        <view
          class="recent"
          v-if="recentOrdersList && recentOrdersList.length > 0"
        >
          <text class="order_line">最近订单</text>
        </view>
        <order-list
          :scrollH="scrollH"
          @lower="lower"
          @goDetail="goDetail"
          @oneOrderFun="oneOrderFun"
          @getOvertime="getOvertime"
          @statusWord="statusWord"
          @numes="numes"
          :loading="loading"
          :loadingText="loadingText"
          :recentOrdersList="recentOrdersList"
        ></order-list>
      </view>
    </view>
  </view>
</template>

<script>
import { getOrderPage, repetitionOrder, delShoppingCart } from "../api/api.js";
import { mapMutations } from "vuex";
import { statusWord, getOvertime } from "@/utils/index.js";

import HeadInfo from "./components/headInfo.vue"; //头部
import OrderInfo from "./components/orderInfo.vue"; //地址
import OrderList from "./components/orderList.vue"; //最近订单
export default {
  data() {
    return {
      psersonUrl: "../../static/btn_waiter_sel.png",
      nickName: "",
      gender: "0",
      phoneNumber: "",
      recentOrdersList: [],
      fetching: false,
      requestId: 0,
      sumOrder: {
        amount: 0,
        number: 0,
      },
      status: "",
      scrollH: 0,
      pageInfo: {
        page: 1,
        pageSize: 10,
        total: 0,
      },
      loadingText: "",
      loading: false,
    };
  },
  components: {
    HeadInfo,
    OrderInfo,
    OrderList,
  },
  filters: {
    getPhoneNum(str) {
      return str.replace(/\-/g, "");
    },
  },
  onLoad() {
    this.psersonUrl =
      this.$store.state.baseUserInfo &&
      this.$store.state.baseUserInfo.avatarUrl;
    this.nickName =
      this.$store.state.baseUserInfo && this.$store.state.baseUserInfo.nickName;
    this.gender =
      this.$store.state.baseUserInfo && this.$store.state.baseUserInfo.gender;
    this.phoneNumber =
      (this.$store.state.baseUserInfo && this.$store.state.baseUserInfo.phone) || "";
    this.getList();
  },
  created() {},
  onReady() {
    uni.getSystemInfo({
      success: (res) => {
        this.scrollH = res.windowHeight - uni.upx2px(100);
      },
    });
  },
  methods: {
    ...mapMutations(["setAddressBackUrl"]),
    statusWord(obj) {
      return statusWord(obj.status, obj.time);
    },
    getOvertime(time) {
      return getOvertime(time);
    },
    // 获取列表数据
    async getList(nextPage = 1) {
      if (this.fetching && nextPage > 1) return;
      const requestId = ++this.requestId;
      this.fetching = true;
      const params = { page: nextPage, pageSize: this.pageInfo.pageSize };
      const fetchPage = getOrderPage;
      try {
        const res = await fetchPage(params);
        if (requestId !== this.requestId) return;
        const rows = res.data.records || [];
        this.recentOrdersList = nextPage === 1 ? rows : this.recentOrdersList.concat(rows);
        this.pageInfo.page = nextPage;
        this.pageInfo.total = Number(res.data.total);
        this.loadingText = this.recentOrdersList.length >= this.pageInfo.total ? "没有更多了" : "";
      } catch (error) {
        // 请求层统一显示错误；失败时保留页码，允许重试。
      } finally {
        if (requestId === this.requestId) {
          this.fetching = false;
          this.loading = false;
        }
        uni.hideLoading();
      }
    },

    // 去地址页面
    goAddress() {
      this.setAddressBackUrl("/pages/my/my");
      // TODO
      uni.redirectTo({
        url: "/pages/address/address?form=" + "my",
      });
    },
    // 去历史订单页面
    goOrder() {
      // TODO
      uni.navigateTo({
        url: "/pages/historyOrder/historyOrder",
      });
    },
    async oneOrderFun(id) {
      let pages = getCurrentPages();
      let routeIndex = pages.findIndex(
        (item) => item.route === "pages/index/index"
      );
      // 先清空购物车
      await delShoppingCart();
      repetitionOrder(id).then((res) => {
        if (res.code === 1) {
          uni.navigateBack({
            delta: routeIndex > -1 ? pages.length - routeIndex : 1,
          });
        }
      });
    },
    quitClick() {},
    // 去详情页面
    goDetail(id) {
      this.setAddressBackUrl("/pages/my/my");
      uni.redirectTo({
        url: "/pages/details/index?orderId=" + id,
      });
    },
    dataAdd() {
      if (this.fetching || this.recentOrdersList.length >= this.pageInfo.total) return;
      this.getList(this.pageInfo.page + 1);
    },
    lower() {
      this.dataAdd();
    },

    goBack() {
      uni.redirectTo({
        url: "/pages/index/index",
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.my-center {
  background: #f6f6f6;
  height: 100%;

  .container {
    margin-top: 20rpx;
    height: calc(100% - 194rpx);
  }
}
::v-deep .uni-navbar--border {
  border-width: 0 !important;
}
</style>
