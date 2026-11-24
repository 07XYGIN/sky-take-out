import { request } from "../../utils/request.js"

export const deliveryTimes = {
	today: ['18:00', '18:30', '19:00', '19:30', '20:00'],
	tomorrow: ['11:00', '11:30', '12:00', '18:00', '18:30', '19:00', '19:30', '20:00']
}


// 用户登录
export const userLogin = (params) => {
	return request({
		url: '/miniapp/user/login',
		method: 'POST',
		params
	})
}

// 菜品和套餐的分类
export const getCategoryList = (params) => {
	return request({
		url: '/miniapp/category/list',
		method: 'GET',
		params
	})
}

// 查询菜品管理列表
export const dishListByCategoryId = (params) => {
	return request({
		url: '/miniapp/dish/list',
		method: 'GET',
		params
	})
}

// 根据type类型查询是套餐的接口
export const querySetmeaList = (params) => {
	return request({
		url: '/miniapp/setmeal/list',
		method: 'GET',
		params
	})
}

// 获取购物车集合
export const getShoppingCartList = (params) => {
	return request({
		url: '/miniapp/shoppingCart/list',
		method: 'GET',
		params
	})
}


// 购物车新增接口-new
export const newAddShoppingCartAdd = (params) => {
	return request({
		url: '/miniapp/shoppingCart/add',
		method: 'POST',
		params
	})
}


// 购物车减菜接口-new 
export const newShoppingCartSub = (params) => {
	return request({
		url: '/miniapp/shoppingCart/sub',
		method: 'POST',
		params
	})
}


// 清除购物车
export const delShoppingCart = (params) => {
	return request({
		url: '/miniapp/shoppingCart/clean',
		method: 'DELETE',
		params
	})
}


// 用户下单
export const submitOrderSubmit = (params) => {
	return request({
		url: '/miniapp/order/submit',
		method: 'POST',
		params
	})
}


// 查询地址列表
export const queryAddressBookList = (params) => {
	return request({
		url: '/miniapp/addressBook/list',
		method: 'GET',
		params
	})
}

// 新增默认接口
export const putAddressBookDefault = (params) => {
	return request({
		url: '/miniapp/addressBook/default',
		method: 'PUT',
		params
	})
}


// 新增地址接口
export const addAddressBook = (params) => {
	return request({
		url: '/miniapp/addressBook',
		method: 'POST',
		params
	})
}

// 修改地址接口
export const editAddressBook = (params) => {
	return request({
		url: '/miniapp/addressBook',
		method: 'PUT',
		params
	})
}

// 删除地址
export const delAddressBook = (id) => {
	return request({
		url: `/miniapp/addressBook/?id=${id}`,
		method: 'DELETE',
		params: { id }
	})
}

// 查询地址通过id
export const queryAddressBookById = (params) => {
	return request({
		url: `/miniapp/addressBook/${params.id}`,
		method: 'GET',
		params
	})
}


// 查询默认地址
export const getAddressBookDefault = () => {
	return request({
		url: '/miniapp/addressBook/default',
		method: 'GET'
	})
}


// 此接口为首页查询套餐详情展示的接口
export const querySetmealDishById = (params) => {
	return request({
		url: `/miniapp/setmeal/dish/${params.id}`,
		method: 'GET'
	})
}
// v2.0添加接口
// 获取首页店铺信息
export const getShopStatus = (params) => {
	return request({
		url: `/miniapp/shop/status`,
		method: 'GET'
	})
}
// 获取店铺信息
export const getMerchantInfo = (params) => {
	return request({
		url: `/miniapp/shop/getMerchantInfo`,
		method: 'GET'
	})
}
// 历史订单
export const getOrderPage = (params) => {
	return request({
		url: '/miniapp/order/historyOrders',
		method: 'GET',
		params
	})
}
// 订单详情
export const getOrderDetail = (params) =>
	request({
		url: `/miniapp/order/orderDetail/${params}`,
		method: 'GET'
	})
// 取消订单
export const cancelOrder = (params) =>
	request({
		url: `/miniapp/order/cancel/${params}`,
		method: 'PUT'
	})
export const refundOrder = (params) =>
	request({
		url: `/miniapp/order/refund/${params}`,
		method: 'PUT'
	})
// 催单
export const reminderOrder = (params) =>
	request({
		url: `/miniapp/order/reminder/${params}`,
		method: 'GET'
	})
// 订单支付
export const paymentOrder = (params) =>
	request({
		url: `/miniapp/order/payment`,
		method: 'PUT',
		params
	})
// 再来一单
export const repetitionOrder = (params) =>
	request({
		url: `/miniapp/order/repetition/${params}`,
		method: 'POST',
		params
	})


// 查询用户订单支付状态列表信息
export const queryOrdersCheckStatus = (params) =>
	request({
		url: `/miniapp/order/queryOrdersCheckStatus`,
		method: 'get',
		params
	})


