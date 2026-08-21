# sky-take-out

## 项目介绍

sky-take-out 是一个外卖业务练习项目，包含管理端、用户小程序和后端服务三个部分。管理端由原有 Vue 项目迁移为 React 技术栈，用于门店员工处理订单、维护菜品和查看经营数据；小程序面向用户点餐、下单和管理地址；后端基于 Spring Boot 模板从零开发业务接口，并使用项目 SQL 初始化业务数据结构。

## 技术栈

- 管理端：React 19、TypeScript、Vite、Ant Design 5、TailwindCSS、Axios、React Router、Zustand、ECharts、lucide-react
- 小程序：uni-app、Vue、Vuex、uni-ui
- 后端：Spring Boot、MyBatis、MySQL、JWT、Redis
- 数据库：MySQL、sky_20260821154803.sql

## 功能

- 管理端登录与员工账号管理
- 工作台营业概览、订单概览、菜品和套餐概览
- 订单查询、接单、拒单、派送、完成、取消和详情查看
- 菜品、套餐、分类的新增、编辑、删除和状态管理
- 营业额、用户、订单和销量排名统计
- 小程序用户点餐、购物车、下单、订单查看和地址管理
