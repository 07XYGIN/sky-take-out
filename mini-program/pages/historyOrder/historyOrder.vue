<!--历史订单-->
<template>
  <view class="history_order">
    <uni-nav-bar @clickLeft="goBack" left-icon="back" leftIcon="arrowleft" title="历史订单" statusBar="true" fixed="true"
      color="#ffffff" backgroundColor="#333333"></uni-nav-bar>
    <!-- 根据scrollinto和:id="'tab'+index"切换下方轮播 -->
    <scroll-view scroll-x class="scroll-row" :scroll-into-view="scrollinto" :scroll-with-animation="true" enable-flex>
      <view v-for="(item, index) in tabBars" :key="index" :id="'tab' + index" class="scroll-row-item"
        @click="changeTab(index)">
        <view :class="tabIndex == index ? 'scroll-row-item-act' : ''"><text class="line"></text>{{ item }}</view>
      </view>
    </scroll-view>
    <!--  滑块内容 对应的是顶部选项卡的切换 :current="tabIndex"  设置的是y方向上可以滚动-->
    <swiper :current="tabIndex" @change="onChangeSwiperTab" :style="{ height: scrollH + 'px' }">
      <swiper-item v-for="(item, index) in tabBars" :key="index">
        <!-- 垂直滚动区域  scroll和swiper的高度都要给且是一样的高度-->
        <scroll-view scroll-y="true" :style="{ height: scrollH + 'px' }" @scrolltolower="lower">
          <!-- 可垂直滚动区域 显示真正内容-->
          <view class="main recent_orders" v-if="recentOrdersList && recentOrdersList.length > 0">
            <!-- 历史订单列表 -->
            <view class="box order_lists" v-for="(item, index) in recentOrdersList" :key="index" :class="{
              'item-last': Number(index) + 1 === recentOrdersList.length,
            }">
              <!-- 时间和支付状态 -->
              <view class="date_type">
                <!-- 时间 -->
                <text class="time">{{ item.orderTime }}</text>
                <!-- 支付状态 -->
                <text class="type status" :class="{ status: item.status == 2 }">{{
                  statusWord(item.status)
                }}</text>
              </view>
              <!-- 点菜的内容 -->
              <view class="orderBox" @click="goDetail(item.id)">
                <view class="food_num">
                  <scroll-view scroll-x="true" class="pic" style="width: 100%; overflow: hidden; white-space: nowrap">
                    <view class="food_num_item" v-for="(num, y) in item.orderDetailList" :key="y">
                      <view class="img">
                        <image :src="num.image"></image>
                      </view>
                      <view class="food">{{ num.name }}</view>
                    </view>
                  </scroll-view>
                </view>
                <!-- 商品数量及金额 -->
                <view class="numAndAum">
                  <view><text>￥{{ item.amount.toFixed(2) }}</text></view>
                  <view><text>共{{ numes(item.orderDetailList).count }}件</text></view>
                </view>
              </view>
              <view class="againBtn">
                <button class="new_btn" type="default" @click="oneMoreOrder(item.id)">
                  再来一单
                </button>
                <button class="new_btn btn" type="default" @click="goDetail(item.id)"
                  v-if="item.status === 1 && getOvertime(item.payDeadline) > 0">
                  去支付
                </button>
                <button class="new_btn btn" type="default" @click="handleReminder('center', item.id)"
                  v-if="item.status === 2">
                  催单
                </button>
              </view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>
    <uni-popup ref="commonPopup" class="comPopupBox">
      <view class="popup-content">
        <view class="text">{{ textTip }}</view>
        <view class="btn" v-if="showConfirm">
          <view @click="closePopup">确认</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import {
  getOrderPage,
  repetitionOrder,
  reminderOrder,
  delShoppingCart,
  queryOrdersCheckStatus
} from "../api/api.js";
import { mapMutations } from "vuex";
import Empty from "@/components/empty/empty";
import { statusWord, getOvertime } from "@/utils/index.js";
export default {
  components: {
    Empty,
  },
  data() {
    return {
      recentOrdersList: [],
      fetching: false,
      requestId: 0,
      pageInfo: {
        page: 1,
        pageSize: 10,
        total: 0,
      },
      status: "",
      payStatus: "",
      loadingType: 0,
      showTitle: false,
      scrollinto: "tab0",
      scrollH: 0,
      tabIndex: 0,
      // tabBars: ["全部订单", "待付款", "退款", "已完成", "派送中"],
      tabBars: ["全部订单", "待付款", "退款"],
      // 状态对应的接口和参数
      urlMap: {
        0: {
          fn: getOrderPage,
          key: "status",
        },
        1: {
          fn: getOrderPage,
          key: "status",
        },
        2: {
          fn: queryOrdersCheckStatus,
          key: "payStatus",
        },
      },
      textTip: "",
      showConfirm: false,
      isEmpty: false,
      loading: false,
      loadingText: '',
    };
  },
  onLoad() {
    this.getList();
  },
  onUnload() {
    this.showTitle = false;
  },
  onReady() {
    uni.getSystemInfo({
      success: (res) => {
        this.scrollH = res.windowHeight - uni.upx2px(100);
      },
    });
  },
  onPullDownRefresh() {
    this.pageInfo.page = 1;
    this.loadingType = 0;
    this.recentOrdersList = [];
    this.finished = false;
    this.getList();
    uni.stopPullDownRefresh();
    this.showTitle = true;
  },
  onReachBottom() { this.dataAdd(); },

  methods: {
    ...mapMutations(["setAddressBackUrl"]),
    numes(list) {
      let count = 0;
      let total = 0;
      list.length > 0 &&
        list.forEach((obj) => {
          count += Number(obj.number);
          total += Number(obj.number) * Number(obj.amount);
        });
      return { count: count, total: total };
    },
    statusWord(status) {
      return statusWord(status);
    },
    getOvertime(time) {
      return getOvertime(time);
    },
    // 获取历史订单列表
    async getList(nextPage = 1) {
      if (this.fetching && nextPage > 1) return;
      const requestId = ++this.requestId;
      this.fetching = true;
      const params = { page: nextPage, pageSize: this.pageInfo.pageSize };
      const config = this.urlMap[this.tabIndex];
      params[config.key] = this[config.key];
      const fetchPage = config.fn;
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

    // 再来一单
    async oneMoreOrder(id) {
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
    // tab选项卡切换轮播
    changeTab(index) {
      // 点击的还是当前数据的时候直接return
      if (this.tabIndex == index) {
        return;
      }
      this.tabIndex = index;
      if (index === 1) {
        // 待付款
        this.status = 1;
        this.payStatus = 0
      } else if (index === 2) {
        // 退款
        this.status = 6;
        this.payStatus = 2
      }
      else {
        // 全部
        this.status = "";
        this.payStatus = ""
      }
      this.pageInfo.page = 1;
      this.recentOrdersList = [];
      this.getList();
      // 滑动
      this.scrollinto = "tab" + index;
    },
    onChangeSwiperTab(e) {
      this.changeTab(e.detail.current);
    },
    dataAdd() {
      if (this.fetching || this.recentOrdersList.length >= this.pageInfo.total) return;
      this.getList(this.pageInfo.page + 1);
    },
    lower() {
      this.dataAdd();
    },

    // 去详情页面
    goDetail(id) {
      this.setAddressBackUrl("/pages/historyOrder/historyOrder");
      uni.navigateTo({ url: "/pages/details/index?orderId=" + id });
    },
    // 催单
    handleReminder(type, id) {
      reminderOrder(id).then((res) => {
        if (res.code === 1) {
          this.showConfirm = true;
          this.textTip = "您的催单信息已发出！";
          this.$refs.commonPopup.open(type);
          this.getList();
        }
      });
    },
    // 关闭弹层
    closePopup(type) {
      this.$refs.commonPopup.close(type);
    },
    // 返回我的
    goBack() {
      uni.redirectTo({
        url: "/pages/my/my",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.history_order {
  height: 100%;

  .recent_orders {
    padding-top: 8rpx;
  }
}

.scroll-row {
  height: 88rpx;
  line-height: 88rpx;
  background-color: #fff;
  padding: 0 30rpx;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  width: 100vw;
  box-sizing: border-box;
  flex-wrap: nowrap;
  overflow: auto;
  display: flex;
}

.scroll-row-item {
  margin-right: 88rpx;
  color: #666;
  display: inline-block;
  font-size: 28rpx;
  flex-shrink: 0;
}

.scroll-row-item-act {
  color: #333;
  position: relative;
  font-weight: 600;

  .line {
    width: 32rpx;
    height: 8rpx;
    display: block;
    background: #ffc200;
    border-radius: 8rpx;
    transform: translate(-50%, -50%);
    position: absolute;
    bottom: -4rpx;
    left: 50%;
  }
}
</style>
